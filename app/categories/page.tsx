import Link from "next/link"
import { getCategories } from "../actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          &larr; Back to home
        </Link>
        <h1 className="text-3xl font-bold mt-4 mb-6">Categories</h1>
        <p className="text-muted-foreground mb-8">Browse our collection of fabricated stories by category</p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle>{category.name}</CardTitle>
                <CardDescription>
                  {category.description || `A collection of ${category.name.toLowerCase()} stories that never happened`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/?category=${category.slug}`}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  View Posts
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
