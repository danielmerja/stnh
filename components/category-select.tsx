"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category } from "@/lib/types"

interface CategorySelectProps {
  categories: Category[]
  currentCategory?: string
}

export function CategorySelect({ categories, currentCategory }: CategorySelectProps) {
  return (
    <Select 
      value={currentCategory || "all"} 
      onValueChange={(value) => {
        if (value === "all") {
          window.location.href = "/"
        } else {
          window.location.href = `/?category=${value}`
        }
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.slug}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 