"use client"

import { useRef, useState } from "react"
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

interface LinkedInEmbedProps {
  post: Post
}

export function LinkedInEmbed({ post }: LinkedInEmbedProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [localUpvotes, setLocalUpvotes] = useState<number>(post.upvotes)
  const [localDownvotes, setLocalDownvotes] = useState<number>(post.downvotes)
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
      // Optimistically update UI
      if (voteType === "upvote") {
        setLocalUpvotes((prev: number) => prev + 1)
      } else {
        setLocalDownvotes((prev: number) => prev + 1)
      }

      // Send to server
      const result = await voteOnPost({
        postId: post.id,
        voteType,
      })

      if (!result.success) {
        // Revert optimistic update if server call fails
        setLocalUpvotes(post.upvotes)
        setLocalDownvotes(post.downvotes)

        toast({
          title: "Error",
          description: result.error || "Failed to record your vote",
          variant: "destructive",
        })
      } else {
        // Update local state with actual server values
        if (typeof result.upvotes === 'number' && typeof result.downvotes === 'number') {
          setLocalUpvotes(result.upvotes)
          setLocalDownvotes(result.downvotes)
        }
      }
    } catch (error) {
      // Revert optimistic update if there's an error
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

        <div className="min-h-[200px] flex items-center justify-center">
          <iframe
            src={`https://www.linkedin.com/embed/feed/update/urn:li:share:${post.post_id}?collapsed=1`}
            height="399"
            width="504"
            frameBorder="0"
            allowFullScreen
            title="Embedded LinkedIn post"
            className="w-full max-w-[504px] mx-auto"
          />
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
            onClick={() => window.open(`https://www.linkedin.com/feed/update/urn:li:share:${post.post_id}`, "_blank")}
          >
            View on LinkedIn
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 