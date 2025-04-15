"use client"

import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SortOption } from "@/lib/types"

interface SortTabsProps {
  currentSort: SortOption
}

export function SortTabs({ currentSort }: SortTabsProps) {
  return (
    <Tabs defaultValue={currentSort} className="w-full sm:w-auto">
      <TabsList>
        <TabsTrigger value="trending" asChild>
          <Link href="/?sort=trending">Trending</Link>
        </TabsTrigger>
        <TabsTrigger value="recent" asChild>
          <Link href="/?sort=recent">Recent</Link>
        </TabsTrigger>
        <TabsTrigger value="top" asChild>
          <Link href="/?sort=top">Top</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
} 