"use client"

import Link from "next/link"
import type { Category } from "@/lib/types"

interface MegaMenuProps {
  isVisible: boolean
  categories: Category[]
}

export default function MegaMenu({ isVisible, categories }: MegaMenuProps) {
  if (!isVisible) return null

  return (
    <>
      {/* Desktop Version - Vertical Layout */}
      <div className="hidden md:block absolute top-full left-0 w-96 bg-white shadow-lg border z-50 max-h-96 overflow-y-auto">
        <div className="p-6">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.slug} className="space-y-3">
                <Link
                  href={`/category/${category.slug}`}
                  className="block font-semibold text-gray-900 hover:text-blue-600 text-sm uppercase tracking-wide border-b border-gray-200 pb-2"
                >
                  {category.name}
                </Link>
                {category.children && category.children.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pl-2">
                    {category.children.map((subcategory) => (
                      <Link
                        key={subcategory.slug}
                        href={`/category/${category.slug}/${subcategory.slug}`}
                        className="block text-xs text-gray-600 hover:text-blue-600 hover:underline py-1"
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Version - Horizontal Layout */}
      <div className="md:hidden absolute top-full left-0 w-screen bg-white shadow-lg border-t z-50">
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => (
              <div key={category.slug} className="space-y-2">
                <Link
                  href={`/category/${category.slug}`}
                  className="block font-semibold text-gray-900 hover:text-blue-600 text-sm"
                >
                  {category.name}
                </Link>
                {category.children && category.children.length > 0 && (
                  <div className="space-y-1">
                    {category.children.slice(0, 4).map((subcategory) => (
                      <Link
                        key={subcategory.slug}
                        href={`/category/${category.slug}/${subcategory.slug}`}
                        className="block text-xs text-gray-600 hover:text-blue-600 hover:underline"
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                    {category.children.length > 4 && (
                      <Link
                        href={`/category/${category.slug}`}
                        className="block text-xs text-blue-600 hover:underline font-medium"
                      >
                        View all →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
