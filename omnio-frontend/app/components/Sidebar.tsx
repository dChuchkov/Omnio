"use client"

import { useState } from "react"
import Link from "@/components/Link"
import { cn } from "@/lib/utils"
import { ChevronRight } from 'lucide-react'
import type { Category } from "@/lib/types"

export default function Sidebar({
  isOpen,
  setIsOpen,
  categories
}: {
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void,
  categories: Category[]
}) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <>
      <div className={cn(
        "fixed left-0 z-40 w-64 bg-white shadow-lg transition-transform duration-200 ease-in-out transform",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4">
          <h2 className="font-semibold mb-4">Categories</h2>
          <div className="space-y-1">
            {categories.map((category) => (
              <div
                key={category.slug}
                className="relative"
                onMouseEnter={() => setHoveredCategory(category.slug)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <span className="text-sm">{category.name}</span>
                  {category.children && category.children.length > 0 && (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
                {hoveredCategory === category.slug && category.children && category.children.length > 0 && (
                  <div
                    className="absolute left-full top-0 ml-0.5 w-64 bg-white shadow-lg rounded-lg p-4"
                    style={{ minHeight: '100px' }}
                  >
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <div className="grid gap-1">
                      {category.children.map((subcategory) => (
                        <Link
                          key={subcategory.slug}
                          href={`/category/${category.slug}/${subcategory.slug}`}
                          className="block px-3 py-1.5 text-sm rounded-md hover:bg-gray-100"
                          onClick={() => setIsOpen(false)}
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
