"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "@/components/Link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, Grid, List } from "lucide-react"
import { useLanguage } from "@/lib/language"
import { getCategoryBySlug, getProductsByCategory, getProductsByParentCategory, getStrapiMedia } from "@/lib/api"
import { Category, Product } from "@/lib/types"

export default function CategoryPage() {
  const params = useParams()
  const { locale } = useLanguage()

  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")

  // Get the last slug from params (handles both /category/slug and /category/parent/child)
  const slugArray = Array.isArray(params.slug) ? params.slug : [params.slug]
  const categorySlug = slugArray[slugArray.length - 1]

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Fetch category data
        const categoryResponse = await getCategoryBySlug(categorySlug, locale)
        if (categoryResponse.data && categoryResponse.data.length > 0) {
          const fetchedCategory = categoryResponse.data[0]
          setCategory(fetchedCategory)

          // Check if this is a parent category (has children)
          const isParentCategory = fetchedCategory.children && fetchedCategory.children.length > 0

          // Fetch products - use different API based on category type
          let productsResponse
          if (isParentCategory) {
            // Parent category: fetch products from all subcategories
            productsResponse = await getProductsByParentCategory(categorySlug, locale)
          } else {
            // Subcategory: fetch products only from this category
            productsResponse = await getProductsByCategory(categorySlug, locale)
          }

          if (productsResponse.data) {
            setProducts(productsResponse.data)
          }
        }
      } catch (error) {
        console.error("Error fetching category data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [categorySlug, locale])

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Category not found</h2>
        <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="h-4 w-4" />
        {category.parent && (
          <>
            <Link href={`/category/${category.parent.slug}`} className="hover:text-blue-600">
              {category.parent.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-gray-900 font-medium">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-lg text-gray-600 max-w-3xl">{category.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-4">
              Browse our selection of {products.length} products
            </p>
          </div>
          {category.image && (
            <div className="relative h-32 w-32 rounded-lg overflow-hidden ml-6">
              <Image
                src={getStrapiMedia(category.image.url) || "/placeholder.svg"}
                alt={category.name}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Subcategories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {category.children.map((subcat) => (
              <Link
                key={subcat.id}
                href={`/category/${subcat.slug}`}
                className="flex flex-col items-center p-4 rounded-lg border hover:border-blue-500 hover:shadow-md transition-all"
              >
                {subcat.image && (
                  <div className="relative h-16 w-16 mb-2">
                    <Image
                      src={getStrapiMedia(subcat.image.url) || "/placeholder.svg"}
                      alt={subcat.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <span className="text-sm text-center font-medium">{subcat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white rounded-lg border p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            1-{Math.min(products.length, 20)} of {products.length} results
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show:</span>
            <Select defaultValue="20">
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="60">60</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex border rounded-md">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-gray-600"}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-gray-600"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-600">No products match your filters.</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"}>
          {sortedProducts.map((product) => (
            <Card key={product.id} className={viewMode === "list" ? "flex" : ""}>
              <CardHeader className={viewMode === "list" ? "w-48 flex-shrink-0" : ""}>
                <Link href={`/product/${product.slug}`}>
                  <div className="relative aspect-square overflow-hidden rounded-lg mb-2">
                    <Image
                      src={getStrapiMedia(product.image?.url) || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                    />
                    {product.originalPrice && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>
                </Link>
                <CardTitle className="line-clamp-2 text-sm">
                  <Link href={`/product/${product.slug}`} className="hover:text-blue-600">
                    {product.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-xs text-gray-600 mb-2">{product.brand}</p>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({product.reviewsCount || 0})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-bold text-red-600">${product.price.toFixed(2)}</p>
                  {product.originalPrice && (
                    <p className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</p>
                  )}
                </div>
                {!product.inStock && (
                  <p className="text-xs text-red-500 mt-1">Out of Stock</p>
                )}
              </CardContent>
              <CardFooter>
                <Link href={`/product/${product.slug}`} className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    View Product
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
