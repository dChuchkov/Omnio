"use client"

import Link from "next/link"

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
    ],
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
    ],
  },
  {
    name: "Hardware & Home Appliances",
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
    ],
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
    ],
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
    ],
  },
]

interface MegaMenuProps {
  isVisible: boolean
}

export default function MegaMenu({ isVisible }: MegaMenuProps) {
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
                <div className="grid grid-cols-2 gap-2 pl-2">
                  {category.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.slug}
                      href={`/category/${category.slug}/${subcategory.slug}`}
                      className="block text-xs text-gray-600 hover:text-blue-600 hover:underline py-1"
                    >
                      {subcategory.name}
                    </Link>
                  ))}
                </div>
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
                <div className="space-y-1">
                  {category.subcategories.slice(0, 4).map((subcategory) => (
                    <Link
                      key={subcategory.slug}
                      href={`/category/${category.slug}/${subcategory.slug}`}
                      className="block text-xs text-gray-600 hover:text-blue-600 hover:underline"
                    >
                      {subcategory.name}
                    </Link>
                  ))}
                  {category.subcategories.length > 4 && (
                    <Link
                      href={`/category/${category.slug}`}
                      className="block text-xs text-blue-600 hover:underline font-medium"
                    >
                      View all →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
