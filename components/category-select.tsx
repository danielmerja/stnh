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
      value={currentCategory || ""} 
      onValueChange={(value) => {
        if (value) {
          window.location.href = `/?category=${value}`
        } else {
          window.location.href = "/"
        }
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">All Categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.slug}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 