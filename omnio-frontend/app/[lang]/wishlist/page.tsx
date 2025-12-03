"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "@/components/Link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ShoppingCart } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useWishlist } from "@/lib/wishlist"
import { useCart } from "@/lib/cart"

export default function WishlistPage() {
  const { user } = useAuth()
  const { items, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/signin?redirect=/wishlist")
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view your wishlist.</p>
          <Link href="/signin?redirect=/wishlist">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = (product: any) => {
    addToCart(product, 1)
    // Optionally remove from wishlist after adding to cart
    // removeFromWishlist(product.id)
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Save products you love to your wishlist.</p>
          <Link href="/">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Wishlist ({items.length} items)</h1>
        <Button variant="outline" asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {items.map((product) => (
          <Card key={product.id} className="flex flex-col h-full">
            <CardHeader className="flex-shrink-0">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image src={product.image?.url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-700"
                  onClick={() => removeFromWishlist(product.id)}
                >
                  <Heart className="h-4 w-4 fill-current" />
                </Button>
              </div>
              <CardTitle className="line-clamp-2 min-h-[3rem] text-sm">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-xs text-gray-600">{product.brand}</p>
              <div className="flex items-center space-x-2">
                <p className="text-lg font-bold text-red-600">${product.price.toFixed(2)}</p>
                {product.originalPrice && (
                  <p className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-4 space-y-2">
              <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => handleAddToCart(product)}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Link href={`/product/${product.id}`} className="w-full">
                <Button variant="outline" className="w-full text-sm bg-transparent">
                  View Product
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
