"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ChevronRight } from 'lucide-react'

const categories = [
  { 
    name: "Food & Beverages", 
    slug: "food",
    subcategories: [
      { name: "Snacks", slug: "snacks" },
      { name: "Beverages", slug: "beverages" },
      { name: "Dairy", slug: "dairy" },
      { name: "Canned Goods", slug: "canned-goods" },
      { name: "Baking", slug: "baking" },
      { name: "Condiments", slug: "condiments" },
    ]
  },
  { 
    name: "Clothes", 
    slug: "clothes",
    subcategories: [
      { name: "Men's Wear", slug: "mens-wear" },
      { name: "Women's Wear", slug: "womens-wear" },
      { name: "Children's Wear", slug: "childrens-wear" },
      { name: "Shoes", slug: "shoes" },
      { name: "Accessories", slug: "accessories" },
      { name: "Sports Wear", slug: "sports-wear" },
    ]
  },
  { 
    name: "Hardware and Home Appliances", 
    slug: "hardware-and-home-appliances",
    subcategories: [
      { name: "Fridges", slug: "fridges" },
      { name: "Washing Machines", slug: "washing-machines" },
      { name: "Microwaves", slug: "microwaves" },
      { name: "Stoves", slug: "stoves" },
      { name: "Water Heaters", slug: "water-heaters" },
      { name: "Air Conditioners", slug: "air-conditioners" },
      { name: "Small Appliances", slug: "small-appliances" },
      { name: "Tools", slug: "tools" },
    ]
  },
  { 
    name: "Books", 
    slug: "books",
    subcategories: [
      { name: "Fiction", slug: "fiction" },
      { name: "Non-Fiction", slug: "non-fiction" },
      { name: "Educational", slug: "educational" },
      { name: "Children's Books", slug: "childrens-books" },
      { name: "Comics", slug: "comics" },
      { name: "Magazines", slug: "magazines" },
    ]
  },
  { 
    name: "Office Supplies", 
    slug: "office-supplies",
    subcategories: [
      { name: "Writing", slug: "writing" },
      { name: "Paper", slug: "paper" },
      { name: "Filing", slug: "filing" },
      { name: "Desk Accessories", slug: "desk-accessories" },
      { name: "Printing", slug: "printing" },
      { name: "Storage", slug: "storage" },
    ]
  },
]

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
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
                  <ChevronRight className="h-4 w-4" />
                </div>
                {hoveredCategory === category.slug && (
                  <div 
                    className="absolute left-full top-0 ml-0.5 w-64 bg-white shadow-lg rounded-lg p-4"
                    style={{ minHeight: '100px' }}
                  >
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <div className="grid gap-1">
                      {category.subcategories.map((subcategory) => (
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
