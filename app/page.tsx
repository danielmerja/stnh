import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TwitterEmbed } from "@/components/twitter-embed"
import { CategorySelect } from "@/components/category-select"
import { SortTabs } from "@/components/sort-tabs"
import { getCategories, getPosts } from "./actions"
import type { SortOption } from "@/lib/types"

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Get sort parameter from URL or default to 'trending'
  const sort = (searchParams.sort as SortOption) || "trending"

  // Get category from URL if present
  const categorySlug = searchParams.category as string | undefined

  // Fetch categories and posts
  const categories = await getCategories()
  const posts = await getPosts({ categorySlug, sort })

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl">STNH 💩</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/" className="transition-colors hover:text-foreground/80">
                Home
              </Link>
              <Link href="/about" className="transition-colors hover:text-foreground/80">
                About
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            {/* TODO: Search functionality to be implemented
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search posts..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
                />
              </div>
            </div>
            */}
            <Button size="sm" asChild>
              <Link href="/submit">
                Submit Post <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container py-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Shit That Never Happened 💩</h1>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                A digital wall of shame for viral lies and fabricated stories
              </p>
            </div>
          </div>
        </section>
        <section className="container py-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <SortTabs currentSort={sort} />
              <div className="flex items-center gap-2">
                <CategorySelect categories={categories} currentCategory={categorySlug} />
              </div>
            </div>

            <div className="grid gap-6">
              {posts.length > 0 ? (
                posts.map((post) => <TwitterEmbed key={post.id} post={post} />)
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">No posts found</h3>
                  <p className="text-muted-foreground mt-2">
                    {categorySlug
                      ? "No posts in this category yet. Try another category or submit one!"
                      : "No posts yet. Be the first to submit one!"}
                  </p>
                </div>
              )}
            </div>

            {posts.length > 0 && (
              <div className="flex justify-center">
                <Button variant="outline" size="lg">
                  Load More
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 STNH. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground underline underline-offset-4">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
