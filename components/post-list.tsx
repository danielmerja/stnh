"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getPosts } from "@/app/actions"
import type { Post, SortOption } from "@/lib/types"
import { TwitterEmbed } from "./twitter-embed"
import { LinkedInEmbed } from "./linkedin-embed"

interface PostListProps {
  initialPosts: Post[]
  categorySlug?: string
  sort?: SortOption
  query?: string
}

export function PostList({ initialPosts, categorySlug, sort, query }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [offset, setOffset] = useState(initialPosts.length)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length === 10)

  const loadMorePosts = async () => {
    setIsLoading(true)
    const newPosts = await getPosts({
      categorySlug,
      sort,
      query,
      offset: offset,
      limit: 10,
    })

    if (newPosts.length > 0) {
      setPosts((prevPosts) => [...prevPosts, ...newPosts])
      setOffset((prevOffset) => prevOffset + newPosts.length)
      setHasMore(newPosts.length === 10)
    } else {
      setHasMore(false)
    }
    setIsLoading(false)
  }

  return (
    <>
      <div className="grid gap-6">
        {posts.length > 0 ? (
          posts.map((post) =>
            post.post_type === "twitter" ? (
              <TwitterEmbed key={post.id} post={post} />
            ) : (
              <LinkedInEmbed key={post.id} post={post} />
            )
          )
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No posts found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMorePosts}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </>
  )
}
