import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getProductById } from "@/lib/data"
import { ChevronRight } from "lucide-react"
import ProductTabs from "@/app/components/ProductTabs"
import ProductInfo from "@/app/components/ProductInfo"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(Number.parseInt(params.id))

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
          </li>
          <ChevronRight className="h-4 w-4" />
          <li className="inline-flex items-center">
            <Link href={`/category/${product.category}`} className="text-gray-700 hover:text-blue-600">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </Link>
          </li>
          <ChevronRight className="h-4 w-4" />
          <li>
            <span className="text-gray-500">{product.name}</span>
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg border bg-white">
          <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" priority />
        </div>

        {/* Product Info */}
        <ProductInfo product={product} />
      </div>

      {/* Product Tabs - Specifications and Comments */}
      <div className="mt-12" id="product-tabs">
        <ProductTabs product={product} />
      </div>
    </div>
  )
}
