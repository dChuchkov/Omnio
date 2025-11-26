import { getAllProducts } from "@/lib/data"
import ProductCarousel from "./components/ProductCarousel"

export default async function Home() {
  const allProducts = await getAllProducts()
  const featuredProducts = allProducts.slice(0, 12)
  const discountedProducts = allProducts.filter((product) => product.originalPrice).slice(0, 8)

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to{" "}
          <span className="text-blue-600">
            omn<span className="text-orange-500">io</span>
          </span>
        </h1>
        <p className="text-lg text-gray-600 mb-6">Your ultimate shopping destination for everything you need</p>
        <div className="flex justify-center space-x-4 text-sm text-gray-500">
          <span>✓ Free Shipping</span>
          <span>✓ 30-Day Returns</span>
          <span>✓ Secure Payments</span>
        </div>
      </div>

      {/* Featured Products Carousel */}
      <ProductCarousel products={featuredProducts} title="Featured Products" viewAllLink="/category/featured" />

      {/* Special Offers Carousel */}
      {discountedProducts.length > 0 && (
        <ProductCarousel products={discountedProducts} title="Special Offers" viewAllLink="/category/offers" />
      )}
    </div>
  )
}
