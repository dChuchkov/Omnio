"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, MessageCircle } from "lucide-react"
import type { Product } from "@/lib/data"

interface ProductTabsProps {
  product: Product
}

interface Review {
  id: number
  userName: string
  rating: number
  comment: string
  date: string
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"specifications" | "comments">("specifications")
  const [reviews] = useState<Review[]>([]) // This would come from your database
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" })
  const [isLoggedIn] = useState(false) // This would come from your auth context

  const handleSubmitReview = () => {
    if (!isLoggedIn) {
      alert("Please sign in to leave a review")
      return
    }

    if (newReview.rating === 0) {
      alert("Please select a rating")
      return
    }

    if (newReview.comment.trim() === "") {
      alert("Please write a comment")
      return
    }

    // Here you would submit the review to your backend
    console.log("Submitting review:", newReview)
    setNewReview({ rating: 0, comment: "" })
  }

  const renderStars = (rating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${interactive ? "cursor-pointer hover:text-yellow-400" : ""} ${
          index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
        onClick={interactive ? () => setNewReview((prev) => ({ ...prev, rating: index + 1 })) : undefined}
      />
    ))
  }

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === "specifications"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("specifications")}
        >
          SPECIFICATIONS
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === "comments" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("comments")}
          data-tab="comments"
        >
          COMMENTS ({reviews.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "specifications" && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Product Specifications</h3>
              <div className="space-y-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b py-2">
                    <span className="font-medium text-gray-700">{key}</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Description</h4>
                <div className="text-gray-700">
                  <p className="mb-3">{product.description}</p>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="mr-2 text-green-600">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "comments" && (
          <Card>
            <CardContent className="p-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6">No reviews for this product yet</p>

                  {isLoggedIn ? (
                    <div className="max-w-md mx-auto space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                        <div className="flex justify-center space-x-1">{renderStars(newReview.rating, true)}</div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                        <Textarea
                          placeholder="Share your thoughts about this product..."
                          value={newReview.comment}
                          onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                          rows={4}
                        />
                      </div>

                      <Button onClick={handleSubmitReview} className="w-full">
                        Submit Review
                      </Button>
                    </div>
                  ) : (
                    <Button asChild>
                      <a href="/signin">Sign in to leave a review</a>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Add Review Form for logged in users */}
                  {isLoggedIn && (
                    <div className="border-b pb-6">
                      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                          <div className="flex space-x-1">{renderStars(newReview.rating, true)}</div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                          <Textarea
                            placeholder="Share your thoughts about this product..."
                            value={newReview.comment}
                            onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                            rows={4}
                          />
                        </div>

                        <Button onClick={handleSubmitReview}>Submit Review</Button>
                      </div>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{review.userName}</span>
                            <div className="flex space-x-1">{renderStars(review.rating)}</div>
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
