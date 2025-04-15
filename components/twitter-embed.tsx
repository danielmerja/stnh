"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Flag, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Post } from "@/lib/types"
import { voteOnPost } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

interface TwitterEmbedProps {
  post: Post
  userId?: string
}

export function TwitterEmbed({ post, userId = "anonymous" }: TwitterEmbedProps) {
  const tweetRef = useRef<HTMLDivElement>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes)
  const [localDownvotes, setLocalDownvotes] = useState(post.downvotes)
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Function to load the Twitter script
    const loadTwitterScript = () => {
      return new Promise<void>((resolve, reject) => {
        // If script is already loaded
        if (window.twttr) {
          resolve()
          return
        }

        // Create script element
        const script = document.createElement("script")
        script.src = "https://platform.twitter.com/widgets.js"
        script.async = true
        
        script.onload = () => resolve()
        script.onerror = (error) => reject(error)
        
        document.head.appendChild(script)
      })
    }

    // Function to embed the tweet
    const embedTweet = async () => {
      setIsLoading(true)
      setLoadError(false)

      try {
        // First ensure Twitter script is loaded
        await loadTwitterScript()

        // Wait for twttr to be fully initialized
        if (!window.twttr?.widgets) {
          throw new Error("Twitter widgets not initialized")
        }

        // Clear any existing content
        if (tweetRef.current) {
          tweetRef.current.innerHTML = ""

          // Create blockquote element
          const tweetBlockquote = document.createElement("blockquote")
          tweetBlockquote.className = "twitter-tweet"
          tweetBlockquote.setAttribute("data-dnt", "true")
          tweetBlockquote.setAttribute("data-theme", document.documentElement.classList.contains("dark") ? "dark" : "light")
          
          // Add a link to the tweet (required for widgets.load())
          const tweetLink = document.createElement("a")
          tweetLink.href = `https://twitter.com/x/status/${post.tweet_id}`
          tweetBlockquote.appendChild(tweetLink)
          
          // Add to DOM
          tweetRef.current.appendChild(tweetBlockquote)

          // Load the tweet
          await window.twttr.widgets.load(tweetRef.current)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error embedding tweet:", error)
        setLoadError(true)
        setIsLoading(false)
      }
    }

    embedTweet()

    // Cleanup
    return () => {
      if (tweetRef.current) {
        tweetRef.current.innerHTML = ""
      }
    }
  }, [post.tweet_id])

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="w-fit">
            {post.category?.name || "Uncategorized"}
          </Badge>
          <span className="text-xs text-muted-foreground">Added {new Date(post.created_at).toLocaleDateString()}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Flag className="mr-2 h-4 w-4" />
              Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Not actually fake</DropdownMenuItem>
            <DropdownMenuItem>Offensive content</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Other issue</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4">
        {post.title && <h3 className="font-semibold text-lg mb-2">{post.title}</h3>}
        {post.description && <p className="text-muted-foreground mb-4">{post.description}</p>}

        <div className="min-h-[200px] flex items-center justify-center">
          {isLoading && (
            <div className="animate-pulse text-muted-foreground">Loading tweet...</div>
          )}

          <div 
            ref={tweetRef} 
            className={isLoading || loadError ? "hidden" : "w-full"}
          />

          {loadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error loading tweet</AlertTitle>
              <AlertDescription>
                <div className="space-y-2">
                  <p>This tweet may have been deleted or is unavailable.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://twitter.com/i/web/status/${post.tweet_id}`, "_blank")}
                  >
                    Try viewing on X/Twitter <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant={userVote === "upvote" ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-1"
              onClick={() => handleVote("upvote")}
              disabled={isVoting}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{localUpvotes}</span>
            </Button>
            <Button
              variant={userVote === "downvote" ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-1"
              onClick={() => handleVote("downvote")}
              disabled={isVoting}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{localDownvotes}</span>
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://twitter.com/i/web/status/${post.tweet_id}`, "_blank")}
          >
            View on X
          </Button>
        </div>
      </CardFooter>
    </Card>
  )

  async function handleVote(voteType: "upvote" | "downvote") {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to vote",
        variant: "destructive",
      })
      return
    }

    setIsVoting(true)
    try {
      // Optimistically update UI
      if (userVote === voteType) {
        // User is clicking the same vote type again, so remove their vote
        if (voteType === "upvote") {
          setLocalUpvotes((prev) => Math.max(0, prev - 1))
        } else {
          setLocalDownvotes((prev) => Math.max(0, prev - 1))
        }
        setUserVote(null)
      } else if (userVote === null) {
        // New vote
        if (voteType === "upvote") {
          setLocalUpvotes((prev) => prev + 1)
        } else {
          setLocalDownvotes((prev) => prev + 1)
        }
        setUserVote(voteType)
      } else {
        // Changing vote type
        if (voteType === "upvote") {
          setLocalUpvotes((prev) => prev + 1)
          setLocalDownvotes((prev) => Math.max(0, prev - 1))
        } else {
          setLocalDownvotes((prev) => prev + 1)
          setLocalUpvotes((prev) => Math.max(0, prev - 1))
        }
        setUserVote(voteType)
      }

      // Send to server
      const result = await voteOnPost({
        postId: post.id,
        userId,
        voteType,
      })

      if (!result.success) {
        // Revert optimistic update if server call fails
        setLocalUpvotes(post.upvotes)
        setLocalDownvotes(post.downvotes)
        setUserVote(null)

        toast({
          title: "Error",
          description: result.error || "Failed to record your vote",
          variant: "destructive",
        })
      }
    } catch (error) {
      // Revert optimistic update if there's an error
      setLocalUpvotes(post.upvotes)
      setLocalDownvotes(post.downvotes)
      setUserVote(null)

      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }
}

// Add TypeScript type for Twitter widget
declare global {
  interface Window {
    twttr: {
      widgets: {
        createTweet: (
          tweetId: string,
          element: HTMLElement,
          options?: {
            theme?: "light" | "dark"
            align?: "left" | "center" | "right"
            conversation?: "none"
            dnt?: boolean
          }
        ) => Promise<HTMLElement | undefined>
        load: (element?: HTMLElement) => void
      }
    }
  }
}
