export type SortOption = "trending" | "recent" | "top"

export type PostType = "twitter" | "linkedin"

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface Post {
  id: number
  post_type: PostType
  post_id: string
  category_id: number
  title: string | null
  description: string | null
  status: string
  upvotes: number
  downvotes: number
  submitted_by: string | null
  created_at: string
  category?: Category
}

export interface Vote {
  id: number
  post_id: number
  user_id: string
  vote_type: "upvote" | "downvote"
  created_at: string
}

export interface Submission {
  id: number
  post_type: PostType
  post_id: string
  category_id: number
  submitted_by: string | null
  status: string
  notes: string | null
  created_at: string
}
