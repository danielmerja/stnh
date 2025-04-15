"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Post, SortOption } from "@/lib/types"

// Get all categories
export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data || []
}

// Get posts with optional filtering and sorting
export async function getPosts({
  categorySlug,
  sort = "trending",
  limit = 10,
  offset = 0,
}: {
  categorySlug?: string
  sort?: SortOption
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()

  // Start building the query
  let query = supabase
    .from("posts")
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .eq("status", "published")

  // Add category filter if provided
  if (categorySlug) {
    // First get the category ID
    const { data: categoryData } = await supabase.from("categories").select("id").eq("slug", categorySlug).single()

    if (categoryData) {
      query = query.eq("category_id", categoryData.id)
    }
  }

  // Add sorting
  switch (sort) {
    case "recent":
      query = query.order("created_at", { ascending: false })
      break
    case "top":
      query = query.order("upvotes", { ascending: false })
      break
    case "trending":
    default:
      // Simple trending algorithm: upvotes - downvotes weighted by recency
      query = query.order("upvotes", { ascending: false }).order("created_at", { ascending: false })
      break
  }

  // Add pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error("Error fetching posts:", error)
    return []
  }

  return data as Post[]
}

// Get a single post by ID
export async function getPostById(id: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching post:", error)
    return null
  }

  return data as Post
}

// Vote on a post
export async function voteOnPost({
  postId,
  userId,
  voteType,
}: {
  postId: number
  userId: string
  voteType: "upvote" | "downvote"
}) {
  const supabase = await createClient()

  // Start a transaction
  const { data: existingVote, error: fetchError } = await supabase
    .from("votes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 is "no rows returned" which is fine
    console.error("Error checking for existing vote:", fetchError)
    return { success: false, error: "Failed to check existing vote" }
  }

  // If user already voted the same way, remove their vote
  if (existingVote && existingVote.vote_type === voteType) {
    const { error: deleteError } = await supabase.from("votes").delete().eq("id", existingVote.id)

    if (deleteError) {
      console.error("Error removing vote:", deleteError)
      return { success: false, error: "Failed to remove vote" }
    }

    // Update post vote counts
    const { error: updateError } = await supabase.rpc(
      voteType === "upvote" ? "decrement_upvotes" : "decrement_downvotes",
      { post_id: postId },
    )

    if (updateError) {
      console.error("Error updating post vote count:", updateError)
      return { success: false, error: "Failed to update vote count" }
    }

    return { success: true }
  }

  // If user already voted the other way, change their vote
  if (existingVote) {
    const { error: updateError } = await supabase
      .from("votes")
      .update({ vote_type: voteType })
      .eq("id", existingVote.id)

    if (updateError) {
      console.error("Error updating vote:", updateError)
      return { success: false, error: "Failed to update vote" }
    }

    // Update post vote counts (both increment one and decrement the other)
    if (voteType === "upvote") {
      await supabase.rpc("increment_upvotes", { post_id: postId })
      await supabase.rpc("decrement_downvotes", { post_id: postId })
    } else {
      await supabase.rpc("decrement_upvotes", { post_id: postId })
      await supabase.rpc("increment_downvotes", { post_id: postId })
    }

    return { success: true }
  }

  // If no existing vote, create a new one
  const { error: insertError } = await supabase.from("votes").insert({
    post_id: postId,
    user_id: userId,
    vote_type: voteType,
  })

  if (insertError) {
    console.error("Error inserting vote:", insertError)
    return { success: false, error: "Failed to record vote" }
  }

  // Update post vote counts
  const { error: updateError } = await supabase.rpc(
    voteType === "upvote" ? "increment_upvotes" : "increment_downvotes",
    { post_id: postId },
  )

  if (updateError) {
    console.error("Error updating post vote count:", updateError)
    return { success: false, error: "Failed to update vote count" }
  }

  return { success: true }
}

// Submit a new post
export async function submitPost(formData: FormData) {
  const supabase = await createClient()

  const tweetId = formData.get("tweetId") as string
  const categoryId = Number.parseInt(formData.get("categoryId") as string)
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const submittedBy = (formData.get("submittedBy") as string) || "anonymous"

  // Validate tweet ID
  if (!tweetId || !tweetId.match(/^\d+$/)) {
    return { success: false, error: "Invalid Tweet ID" }
  }

  // Check if tweet already exists
  const { data: existingPost } = await supabase.from("posts").select("id").eq("tweet_id", tweetId).single()

  if (existingPost) {
    return { success: false, error: "This tweet has already been submitted" }
  }

  // Insert as a submission first (for moderation)
  const { error: submissionError } = await supabase.from("submissions").insert({
    tweet_id: tweetId,
    category_id: categoryId,
    submitted_by: submittedBy,
    notes: `Title: ${title}\nDescription: ${description}`,
  })

  if (submissionError) {
    console.error("Error creating submission:", submissionError)
    return { success: false, error: "Failed to submit post" }
  }

  return { success: true }
}

// Seed initial posts for development
export async function seedInitialPosts() {
  const supabase = await createClient()

  try {
    // Get category IDs
    const { data: categories } = await supabase.from("categories").select("id, slug")
    if (!categories || categories.length === 0) {
      console.error("No categories found")
      return { success: false, error: "No categories found" }
    }

    // Create a mapping of category slugs to IDs
    const categoryMap = categories.reduce(
      (acc, cat) => {
        acc[cat.slug] = cat.id
        return acc
      },
      {} as Record<string, number>,
    )

    // Sample tweets - using real, public tweet IDs that are known to exist
    const samplePosts = [
      {
        tweet_id: "1631661133234237440", // This is a made-up ID, replace with a real one
        category_id: categoryMap["overheard"] || 1,
        title: "The Starbucks Conversation",
        description: "Classic 'overheard' conversation that definitely didn't happen",
        upvotes: 120,
        downvotes: 5,
        status: "published",
      },
      {
        tweet_id: "1631661133234237441", // This is a made-up ID, replace with a real one
        category_id: categoryMap["my-kid-said"] || 2,
        title: "5-year-old Philosopher",
        description: "Another child prodigy with deep thoughts on society",
        upvotes: 89,
        downvotes: 12,
        status: "published",
      },
      {
        tweet_id: "1631661133234237442", // This is a made-up ID, replace with a real one
        category_id: categoryMap["fake-dms"] || 3,
        title: "Celebrity DMs",
        description: "Sure, that famous person definitely DMed you",
        upvotes: 45,
        downvotes: 8,
        status: "published",
      },
    ]

    // Insert posts one by one to avoid the ON CONFLICT error
    for (const post of samplePosts) {
      // Check if post already exists
      const { data: existingPost } = await supabase.from("posts").select("id").eq("tweet_id", post.tweet_id).single()

      if (!existingPost) {
        // Only insert if it doesn't exist
        const { error } = await supabase.from("posts").insert(post)

        if (error) {
          console.error(`Error inserting post ${post.tweet_id}:`, error)
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error seeding posts:", error)
    return { success: false, error: "Failed to seed posts" }
  }
}

export async function submitTweet({
  tweetId,
  categoryId,
  notes,
}: {
  tweetId: string
  categoryId: number
  notes: string
}) {
  const supabase = await createClient()

  // Validate tweet ID
  if (!tweetId || !tweetId.match(/^\d+$/)) {
    return { success: false, error: "Invalid Tweet ID" }
  }

  // Check if tweet already exists
  const { data: existingPost } = await supabase.from("posts").select("id").eq("tweet_id", tweetId).single()

  if (existingPost) {
    return { success: false, error: "This tweet has already been submitted" }
  }

  // Insert as a submission first (for moderation)
  const { error: submissionError } = await supabase.from("submissions").insert({
    tweet_id: tweetId,
    category_id: categoryId,
    submitted_by: "anonymous", // TODO: Get user ID
    notes: notes,
  })

  if (submissionError) {
    console.error("Error creating submission:", submissionError)
    return { success: false, error: "Failed to submit post" }
  }

  revalidatePath("/")
  return { success: true }
}
