"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flag, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Post } from "@/lib/types"
import { voteOnPost } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { Tweet } from "react-tweet"

interface TwitterEmbedProps {
  post: Post
}

export function TwitterEmbed({ post }: TwitterEmbedProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes)
  const [localDownvotes, setLocalDownvotes] = useState(post.downvotes)
  const { toast } = useToast()

  const handleReport = () => {
    toast({
      title: "Report submitted",
      description: "Yeah... good luck with that 😉",
      duration: 3000,
    })
  }

  async function handleVote(voteType: "upvote" | "downvote") {
    setIsVoting(true)
    try {
      if (voteType === "upvote") {
        setLocalUpvotes((prev) => prev + 1)
      } else {
        setLocalDownvotes((prev) => prev + 1)
      }

      const result = await voteOnPost({
        postId: post.id,
        voteType,
      })

      if (!result.success) {
        setLocalUpvotes(post.upvotes)
        setLocalDownvotes(post.downvotes)

        toast({
          title: "Error",
          description: result.error || "Failed to record your vote",
          variant: "destructive",
        })
      } else {
        if (typeof result.upvotes === 'number' && typeof result.downvotes === 'number') {
          setLocalUpvotes(result.upvotes)
          setLocalDownvotes(result.downvotes)
        }
      }
    } catch (error) {
      setLocalUpvotes(post.upvotes)
      setLocalDownvotes(post.downvotes)

      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="w-fit">
            {post.category?.name || "Uncategorized"}
          </Badge>
          <Badge variant="secondary" className="w-fit">
            Twitter/X
          </Badge>
          <span className="text-xs text-muted-foreground">Added {new Date(post.created_at).toLocaleDateString()}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" onClick={handleReport}>
              <Flag className="mr-2 h-4 w-4" />
              Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleReport}>Not actually fake</DropdownMenuItem>
            <DropdownMenuItem onClick={handleReport}>Offensive content</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleReport}>Other issue</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4">
        {post.title && <h3 className="font-semibold text-lg mb-2">{post.title}</h3>}
        {post.description && <p className="text-muted-foreground mb-4">{post.description}</p>}

        <div className="flex items-center justify-center">
          <Tweet id={post.post_id} />
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => handleVote("upvote")}
              disabled={isVoting}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{localUpvotes}</span>
            </Button>
            <Button
              variant="outline"
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
            onClick={() => window.open(`https://twitter.com/i/web/status/${post.post_id}`, "_blank")}
          >
            View on X
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
