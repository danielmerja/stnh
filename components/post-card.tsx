"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Heart, Share2, MoreHorizontal, Flag } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PostCardProps {
  username: string
  handle: string
  date: string
  content: string
  category: string
  likes: number
  comments: number
  shares: number
}

export function PostCard({ username, handle, date, content, category, likes, comments, shares }: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setLiked(!liked)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${username.charAt(0)}`} />
          <AvatarFallback>{username.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{username}</div>
            <div className="text-sm text-muted-foreground">{handle}</div>
            <div className="text-xs text-muted-foreground">• {date}</div>
          </div>
          <Badge variant="outline" className="w-fit">
            {category}
          </Badge>
        </div>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Flag className="mr-2 h-4 w-4" />
                Report post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Copy link</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-base">{content}</p>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full items-center justify-between">
          <Button variant="ghost" size="sm" className={`gap-1 ${liked ? "text-red-500" : ""}`} onClick={handleLike}>
            <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
            <span>{likeCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" />
            <span>{shares}</span>
          </Button>
          <Button variant="outline" size="sm">
            View Original
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
