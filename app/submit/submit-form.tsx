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
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional context or why you think this tweet is fabricated"
                  {...field}
                />
              </FormControl>
              <FormDescription>Provide any additional information that might be helpful</FormDescription>
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
