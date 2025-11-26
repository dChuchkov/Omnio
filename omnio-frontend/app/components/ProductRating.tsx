"use client"

import { useState } from "react"
import { Star, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductRatingProps {
  productId: number
  onReviewsClick?: () => void
}

export default function ProductRating({ productId, onReviewsClick }: ProductRatingProps) {
  const [rating] = useState(0) // This would come from your database
  const [totalReviews] = useState(0) // This would come from your database

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star key={index} className={`h-4 w-4 ${index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const handleShare = (platform: string) => {
    console.log(`Share on ${platform}`)
    // Implement sharing logic here
  }

  return (
    <div className="space-y-4 border-t pt-6">
      {/* Availability */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center w-6 h-6 bg-orange-500 rounded-full">
          <Check className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-medium">Product is available</span>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">{renderStars(rating)}</div>
        <button
          onClick={onReviewsClick}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        >
          Total reviews: <span className="font-medium">{totalReviews}</span>
        </button>
      </div>

      {/* Social Sharing */}
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => handleShare("facebook")} className="p-2">
          <svg className="h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleShare("viber")} className="p-2">
          <svg className="h-4 w-4" fill="#665CAC" viewBox="0 0 24 24">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.86.5 3.64 1.44 5.18L2 22l3.01-1.53c1.48.82 3.17 1.26 4.97 1.26 5.46 0 9.91-4.45 9.91-9.91C19.9 6.45 15.45 2 12.04 2zm5.25 7.24c-.06-.14-.22-.22-.46-.39-.24-.17-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.41-.54-.41-.14 0-.3-.02-.46-.02-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.09 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14z" />
          </svg>
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleShare("whatsapp")} className="p-2">
          <svg className="h-4 w-4" fill="#25D366" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
          </svg>
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleShare("email")} className="p-2">
          <svg className="h-4 w-4" fill="#EA4335" viewBox="0 0 24 24">
            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.91L12 10.09l9.455-6.269h.909c.904 0 1.636.732 1.636 1.636z" />
          </svg>
        </Button>
      </div>
    </div>
  )
}
