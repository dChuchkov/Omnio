"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import { useCart } from "@/lib/cart"
import { placeOrder } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { user, isLoading: authLoading } = useAuth()
  const { items, clearCart, totalPrice } = useCart()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin?redirect=/checkout")
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setPaymentStatus("Processing payment...")

    try {
      // Call backend to place order
      // We don't need to pass card details to backend for this simulation
      // In a real app, we'd tokenize card details with Stripe/etc first
      const order = await placeOrder()

      if (order && order.data) {
        setPaymentStatus("Payment successful! Order placed.")
        clearCart()
        // Redirect after a short delay
        setTimeout(() => {
          router.push("/") // Or to an order confirmation page if we had one
        }, 2000)
      } else {
        setPaymentStatus("Payment failed. Please try again.")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      setPaymentStatus("An error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (items.length === 0 && !paymentStatus) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <Button onClick={() => router.push('/')}>Continue Shopping</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p className="font-semibold">Total to Pay: ${totalPrice.toFixed(2)}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name on Card</Label>
          <Input id="name" required disabled={isProcessing} />
        </div>
        <div>
          <Label htmlFor="card">Card Number</Label>
          <Input id="card" required disabled={isProcessing} />
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input id="expiry" placeholder="MM/YY" required disabled={isProcessing} />
          </div>
          <div className="flex-1">
            <Label htmlFor="cvc">CVC</Label>
            <Input id="cvc" required disabled={isProcessing} />
          </div>
        </div>
        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      </form>
      {paymentStatus && (
        <p className={`text-center font-semibold ${paymentStatus.includes("failed") || paymentStatus.includes("error") ? "text-red-600" : "text-green-600"}`}>
          {paymentStatus}
        </p>
      )}
    </div>
  )
}
