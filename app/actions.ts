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

  try {
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
    }
    // If user already voted the other way, change their vote
    else if (existingVote) {
      const { error: updateError } = await supabase
        .from("votes")
        .update({ vote_type: voteType })
        .eq("id", existingVote.id)

      if (updateError) {
        console.error("Error updating vote:", updateError)
        return { success: false, error: "Failed to update vote" }
      }
    }
    // If no existing vote, create a new one
    else {
      const { error: insertError } = await supabase.from("votes").insert({
        post_id: postId,
        user_id: userId,
        vote_type: voteType,
      })

      if (insertError) {
        console.error("Error inserting vote:", insertError)
        return { success: false, error: "Failed to record vote" }
      }
    }

    // Count total upvotes and downvotes from votes table
    const { data: voteCounts, error: countError } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("post_id", postId)

    if (countError) {
      console.error("Error counting votes:", countError)
      return { success: false, error: "Failed to update vote counts" }
    }

    const upvotes = voteCounts.filter(v => v.vote_type === "upvote").length
    const downvotes = voteCounts.filter(v => v.vote_type === "downvote").length

    // Update post with accurate vote counts
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        upvotes,
        downvotes,
      })
      .eq("id", postId)

    if (updateError) {
      console.error("Error updating post vote counts:", updateError)
      return { success: false, error: "Failed to update post vote counts" }
    }

    return { success: true, upvotes, downvotes }
  } catch (error) {
    console.error("Error in vote transaction:", error)
    return { success: false, error: "Failed to process vote" }
  }
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

export async function submitTweet({
  tweetId,
  title,
  description,
  categoryId,
  notes,
}: {
  tweetId: string
  title: string
  description: string
  categoryId: number
  notes: string
}) {
  const supabase = await createClient()

  // TODO: Future improvements needed:
  // 1. Implement proper moderation flow:
  //    - Create admin interface
  //    - Use submissions table for pending posts
  //    - Add approval/rejection process
  // 2. Add user authentication:
  //    - Replace "anonymous" with actual user ID
  //    - Add user roles (admin, moderator, user)
  // 3. Enhance post metadata:
  //    - Add proper validation for all fields
  //    - Add rate limiting for submissions
  // 4. Add security measures:
  //    - Validate tweet exists via Twitter API
  //    - Add spam prevention
  //    - Add content moderation

  // Validate tweet ID
  if (!tweetId || !tweetId.match(/^\d+$/)) {
    return { success: false, error: "Invalid Tweet ID" }
  }

  // Check if tweet already exists
  const { data: existingPost } = await supabase.from("posts").select("id").eq("tweet_id", tweetId).single()

  if (existingPost) {
    return { success: false, error: "This tweet has already been submitted" }
  }

  // TEMPORARY: Direct insertion into posts table
  // TODO: Replace this with proper submission -> moderation -> publishing flow
  const { error: postError } = await supabase.from("posts").insert({
    tweet_id: tweetId,
    title,
    description,
    category_id: categoryId,
    submitted_by: "anonymous", // TODO: Replace with actual user ID once auth is implemented
    status: "published",
    upvotes: 0,
    downvotes: 0
  })

  if (postError) {
    console.error("Error creating post:", postError)
    return { success: false, error: "Failed to submit post" }
  }

  revalidatePath("/")
  return { success: true }
}
