"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Category, PostType } from "@/lib/types"
import { submitPost } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  postType: z.enum(["twitter", "linkedin"] as const),
  postUrl: z
    .string()
    .url("Please enter a valid URL")
    .refine((url) => {
      if (url.includes("twitter.com") || url.includes("x.com")) return true
      if (url.includes("linkedin.com/feed/update/")) return true
      return false
    }, {
      message: "URL must be from Twitter/X or LinkedIn",
    }),
  title: z.string().min(1, "Please enter a title"),
  description: z.string().min(1, "Please enter a description"),
  categoryId: z.string().min(1, "Please select a category"),
})

interface SubmitFormProps {
  categories: Category[]
}

export function SubmitForm({ categories }: SubmitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postType: "twitter",
      postUrl: "",
      title: "",
      description: "",
      categoryId: categories[0]?.id.toString() || "1",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      let postId: string | null = null

      // Extract post ID based on type
      if (values.postType === "twitter") {
        const url = new URL(values.postUrl)
        const pathParts = url.pathname.split("/")
        postId = pathParts[pathParts.length - 1]
      } else if (values.postType === "linkedin") {
        const match = values.postUrl.match(/urn:li:share:(\d+)/)
        postId = match ? match[1] : null
      }

      if (!postId) {
        toast({
          title: "Invalid URL",
          description: `Could not extract ${values.postType} post ID from the URL`,
          variant: "destructive",
        })
        return
      }

      const result = await submitPost({
        postType: values.postType,
        postId,
        title: values.title,
        description: values.description,
        categoryId: Number.parseInt(values.categoryId),
      })

      if (result.success) {
        toast({
          title: "Submission successful",
          description: "Your submission has been received and will be reviewed",
        })
        router.push("/")
      } else {
        toast({
          title: "Submission failed",
          description: result.error || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit the post",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const postType = form.watch("postType")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="postType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Post Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="twitter" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Twitter/X Post
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="linkedin" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      LinkedIn Post
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="postUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder={
                    postType === "twitter" 
                      ? "https://twitter.com/username/status/123456789" 
                      : "https://www.linkedin.com/feed/update/urn:li:share:1234567890"
                  } 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {postType === "twitter" 
                  ? "Paste the full URL of the tweet you want to submit"
                  : "Paste the full URL of the LinkedIn post or the embed code (containing urn:li:share:...)"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Give this story a catchy title" {...field} />
              </FormControl>
              <FormDescription>A brief, attention-grabbing title for this fabricated story</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Explain why this story is likely fabricated"
                  {...field}
                />
              </FormControl>
              <FormDescription>Provide context about why this story seems fake</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Choose the category that best fits this fabricated story</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/")}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
