"use client"

import { useState } from "react"
import Link from "@/components/Link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Product } from "@/lib/types"
import { getStrapiMedia } from "@/lib/api"

interface ProductCarouselProps {
  products: Product[]
  title: string
  viewAllLink?: string
}

export default function ProductCarousel({ products, title, viewAllLink }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 4

  const totalPages = Math.ceil(products.length / itemsPerPage)
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < totalPages - 1

  const nextSlide = () => {
    if (canGoNext) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevSlide = () => {
    if (canGoPrev) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const visibleProducts = products.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage)

  return (
    <div className="relative bg-gray-50 rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-blue-600 hover:text-blue-800 font-medium">
            View All →
          </Link>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Arrows */}
        <Button
          variant="outline"
          size="icon"
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg ${!canGoPrev ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
          onClick={prevSlide}
          disabled={!canGoPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg ${!canGoNext ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
          onClick={nextSlide}
          disabled={!canGoNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Products Grid */}
        <div className="mx-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleProducts.map((product) => (
              <Card key={product.id} className="flex flex-col h-full bg-white hover:shadow-lg transition-shadow">
                <CardHeader className="flex-shrink-0 p-4">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <Image src={getStrapiMedia(product.image?.url) || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                    {product.originalPrice && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 min-h-[2.5rem] text-sm">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-4 pt-0">
                  <p className="text-xs text-gray-500 mb-1">{product.category?.name || 'Uncategorized'}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-bold text-red-600">${product.price?.toFixed(2) || 'N/A'}</p>
                    {product.originalPrice && (
                      <p className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="mt-auto p-4 pt-0">
                  <Link href={`/product/${product.slug}`} className="w-full">
                    <Button className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white">View Product</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
