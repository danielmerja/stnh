import Link from "next/link"
import { getCategories } from "../actions"
import { SubmitForm } from "./submit-form"

export default async function SubmitPage() {
  const categories = await getCategories()

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          &larr; Back to home
        </Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Submit a Post</h1>
        <p className="text-muted-foreground">
          Found a tweet that's clearly fabricated? Submit it to our wall of shame.
        </p>
      </div>

      <SubmitForm categories={categories} />
    </div>
  )
}
