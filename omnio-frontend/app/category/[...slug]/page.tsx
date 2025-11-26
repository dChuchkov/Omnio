import { notFound } from "next/navigation"
import CategoryPageClient from "@/app/components/CategoryPageClient"
import { getAllProducts } from "@/lib/data"

export default async function CategoryPage({ params }: { params: { slug: string[] } }) {
  // Await the params to ensure we have the correct data
  const slug = await Promise.resolve(params.slug)
  const [mainCategory, subCategory] = slug

  // Validate that we have at least a main category
  if (!mainCategory || typeof mainCategory !== "string") {
    notFound()
  }

  // Get all products
  const allProducts = await getAllProducts()

  // Filter products based on category and optional subcategory
  const categoryProducts = allProducts.filter((product) => {
    const matchesCategory = product.category === mainCategory
    const matchesSubCategory = !subCategory || product.subCategory === subCategory
    return matchesCategory && matchesSubCategory
  })

  // Generate category name
  const categoryName = subCategory
    ? subCategory
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : mainCategory
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

  // If no products found for this category, show not found
  if (categoryProducts.length === 0) {
    notFound()
  }

  return (
    <div className="w-full min-h-screen">
      <CategoryPageClient products={categoryProducts} categoryName={categoryName} />
    </div>
  )
}
