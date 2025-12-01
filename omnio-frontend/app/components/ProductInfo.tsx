"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Minus, Plus, Check } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useCart } from "@/lib/cart"
import { useWishlist } from "@/lib/wishlist"
import ProductRating from "./ProductRating"
import type { Product } from "@/lib/types"

interface ProductInfoProps {
  product: Product
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string | null | undefined>(product.variants?.[0]?.color || null)
  const [showWishlistMessage, setShowWishlistMessage] = useState(false)
  const [showCartMessage, setShowCartMessage] = useState(false)
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const isInWishlistState = isInWishlist(product.id)

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity)
    }
  }

  const handleWishlistClick = () => {
    if (!user) {
      setShowWishlistMessage(true)
      setTimeout(() => setShowWishlistMessage(false), 4000)
      return
    }

    if (isInWishlistState) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const handleAddToCart = () => {
    if (!user) {
      window.location.href = `/signin?redirect=/product/${product.slug}`
      return
    }

    // When Strapi is integrated, also send selected color variant to cart
    addToCart(product, quantity)
    setShowCartMessage(true)
    setTimeout(() => setShowCartMessage(false), 3000)
  }

  const savings = product.originalPrice ? product.originalPrice - product.price : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Brand:</span>
          <span className="text-sm font-medium text-gray-700">{product.brand || 'Unknown'}</span>
        </div>
      </div>

      {/* Enhanced Pricing */}
      <div className="space-y-2">
        {product.originalPrice && (
          <div className="flex items-center space-x-3">
            <span className="text-lg text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
              Save ${savings.toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold text-red-600">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-green-600 font-medium">
              ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off)
            </span>
          )}
        </div>
        <p className="text-sm text-green-600 font-medium">✓ Free delivery</p>
      </div>

      {/* Color Selector - Only shown if product has variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-3 pb-6 border-b">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Color:</span>
            <span className="text-sm text-gray-900 font-semibold">{selectedColor}</span>
          </div>
          <div className="flex items-center space-x-3">
            {product.variants.map((variant) => (
              <button
                key={variant.color}
                onClick={() => setSelectedColor(variant.color)}
                className={`relative w-12 h-12 rounded-full transition-all ${selectedColor === variant.color
                  ? "ring-4 ring-blue-500 ring-offset-2 scale-110"
                  : "ring-2 ring-gray-200 hover:ring-gray-300"
                  }`}
                style={{ backgroundColor: variant.colorHex }}
                title={variant.color}
              >
                {selectedColor === variant.color && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check
                      className="h-6 w-6 drop-shadow-lg"
                      style={{
                        color:
                          variant.colorHex === "#FFFFFF" || variant.colorHex?.toLowerCase() === "#fff"
                            ? "#000000"
                            : "#FFFFFF",
                      }}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity and Actions */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          {/* Wishlist Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleWishlistClick}
            className={`${isInWishlistState ? "text-red-500 border-red-500" : "text-gray-400 hover:text-red-500"}`}
          >
            <Heart className={`h-5 w-5 ${isInWishlistState ? "fill-current" : ""}`} />
          </Button>

          {/* Quantity Controls */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="h-10 w-10 rounded-r-none"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center w-16 h-10 border-x bg-gray-50">
              <span className="font-medium">{quantity}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= 99}
              className="h-10 w-10 rounded-l-none"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart Button */}
          <Button size="lg" onClick={handleAddToCart} className="flex-1 bg-orange-600 hover:bg-orange-700">
            Add to Cart
          </Button>
        </div>

        {/* Messages */}
        {showWishlistMessage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm">!</span>
              </div>
              <p className="text-sm text-yellow-800">
                You must be{" "}
                <a href="/signin" className="font-medium underline hover:no-underline">
                  signed in
                </a>{" "}
                to add products to your wishlist.
              </p>
            </div>
          </div>
        )}

        {showCartMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="text-sm text-green-800">
                Product added to cart successfully!
                {selectedColor && ` (${selectedColor})`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Product Rating and Availability */}
      <ProductRating
        productId={product.id}
        rating={product.rating || 0}
        totalReviews={product.reviewsCount || 0}
        onReviewsClick={() => {
          const tabsElement = document.getElementById("product-tabs")
          if (tabsElement) {
            tabsElement.scrollIntoView({ behavior: "smooth" })
            const commentsTab = document.querySelector('[data-tab="comments"]') as HTMLButtonElement
            if (commentsTab) {
              setTimeout(() => commentsTab.click(), 300)
            }
          }
        }}
      />
    </div>
  )
}
