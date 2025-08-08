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
  query: searchQuery,
}: {
  categorySlug?: string
  sort?: SortOption
  limit?: number
  offset?: number
  query?: string
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

  // Add search query filter if provided
  if (searchQuery) {
    const searchPattern = `%${searchQuery}%`
    query = query.or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
  }

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
  voteType,
}: {
  postId: number
  voteType: "upvote" | "downvote"
}) {
  const supabase = await createClient()

  try {
    // Get current post
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("upvotes, downvotes")
      .eq("id", postId)
      .single()

    if (fetchError) {
      console.error("Error fetching post:", fetchError)
      return { success: false, error: "Failed to fetch post" }
    }

    // Calculate new vote counts
    const newUpvotes = voteType === "upvote" ? (post.upvotes || 0) + 1 : post.upvotes
    const newDownvotes = voteType === "downvote" ? (post.downvotes || 0) + 1 : post.downvotes

    // Update post with new vote counts
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        upvotes: newUpvotes,
        downvotes: newDownvotes,
      })
      .eq("id", postId)

    if (updateError) {
      console.error("Error updating post vote counts:", updateError)
      return { success: false, error: "Failed to update vote counts" }
    }

    return { success: true, upvotes: newUpvotes, downvotes: newDownvotes }
  } catch (error) {
    console.error("Error in vote transaction:", error)
    return { success: false, error: "Failed to process vote" }
  }
}

// Submit a new post
export async function submitPost({
  postUrl,
  title,
  description,
  categoryId,
}: {
  postUrl: string
  title: string
  description: string
  categoryId: number
}) {
  const supabase = await createClient()

  let postType: "twitter" | "linkedin" | null = null
  let postId: string | null = null

  try {
    const url = new URL(postUrl)
    if (url.hostname.includes("twitter.com") || url.hostname.includes("x.com")) {
      postType = "twitter"
      const pathParts = url.pathname.split("/")
      postId = pathParts[pathParts.length - 1]
    } else if (url.hostname.includes("linkedin.com")) {
      postType = "linkedin"
      const match = postUrl.match(/urn:li:share:(\d+)/)
      if (match) {
        postId = match[1]
      } else {
        // Attempt to find activity ID in URL for posts shared by users
        const activityMatch = postUrl.match(/activity:(\d+)/)
        if (activityMatch) {
            postId = activityMatch[1]
        }
      }
    }
  } catch (error) {
    return { success: false, error: "Invalid URL provided" }
  }

  if (!postType || !postId) {
    return { success: false, error: "Could not identify the post from the URL. Please provide a valid Twitter or LinkedIn post URL." }
  }

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
  //    - Validate post exists via respective APIs
  //    - Add spam prevention
  //    - Add content moderation

  // Validate post ID format
  if (!postId.match(/^\d+$/)) {
    return { success: false, error: "Invalid post ID format" }
  }

  // Check if post already exists
  const { data: existingPost } = await supabase
    .from("posts")
    .select("id")
    .eq("post_type", postType)
    .eq("post_id", postId)
    .single()

  if (existingPost) {
    return { success: false, error: "This post has already been submitted" }
  }

  // TEMPORARY: Direct insertion into posts table
  // TODO: Replace this with proper submission -> moderation -> publishing flow
  const { error: postError } = await supabase.from("posts").insert({
    post_type: postType,
    post_id: postId,
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
