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
import type { Category } from "@/lib/types"
import { submitTweet } from "../actions"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  tweetUrl: z
    .string()
    .url("Please enter a valid URL")
    .refine((url) => url.includes("twitter.com") || url.includes("x.com"), {
      message: "URL must be from Twitter/X",
    }),
  title: z.string().min(1, "Please enter a title"),
  description: z.string().min(1, "Please enter a description"),
  categoryId: z.string().min(1, "Please select a category"),
  notes: z.string().optional(),
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
      tweetUrl: "",
      title: "",
      description: "",
      categoryId: "",
      notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Extract tweet ID from URL
      const url = new URL(values.tweetUrl)
      const pathParts = url.pathname.split("/")
      const tweetId = pathParts[pathParts.length - 1]

      if (!tweetId) {
        toast({
          title: "Invalid tweet URL",
          description: "Could not extract tweet ID from the URL",
          variant: "destructive",
        })
        return
      }

      const result = await submitTweet({
        tweetId,
        title: values.title,
        description: values.description,
        categoryId: Number.parseInt(values.categoryId),
        notes: values.notes || "",
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
        description: "Failed to submit the tweet",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="tweetUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tweet URL</FormLabel>
              <FormControl>
                <Input placeholder="https://twitter.com/username/status/123456789" {...field} />
              </FormControl>
              <FormDescription>Paste the full URL of the tweet you want to submit</FormDescription>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any other relevant information"
                  {...field}
                />
              </FormControl>
              <FormDescription>Any other details you'd like to share</FormDescription>
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
