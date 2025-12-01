import { notFound } from "next/navigation"
import CategoryPageClient from "@/app/components/CategoryPageClient"
import { getCategoryBySlug } from "@/lib/api"

export default async function CategoryPage({ params }: { params: { slug: string[] } }) {
  // Await the params to ensure we have the correct data
  const slugArray = await Promise.resolve(params.slug)

  // The last segment of the slug array is the category slug we want to fetch
  const categorySlug = slugArray[slugArray.length - 1]

  if (!categorySlug) {
    notFound()
  }

  // Fetch category data from Strapi
  const categoryResponse = await getCategoryBySlug(categorySlug)
  const category = categoryResponse.data[0]

  if (!category) {
    notFound()
  }

  // Extract products from the category response
  const products = category.products || []

  return (
    <div className="w-full min-h-screen">
      <CategoryPageClient products={products} categoryName={category.name} />
    </div>
  )
}
