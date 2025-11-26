"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CheckoutPage() {
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate payment processing
    setPaymentStatus("Processing payment...")
    setTimeout(() => {
      setPaymentStatus("Payment successful! Thank you for your purchase.")
    }, 2000)
  }

  return (
    <div className="space-y-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name on Card</Label>
          <Input id="name" required />
        </div>
        <div>
          <Label htmlFor="card">Card Number</Label>
          <Input id="card" required />
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input id="expiry" placeholder="MM/YY" required />
          </div>
          <div className="flex-1">
            <Label htmlFor="cvc">CVC</Label>
            <Input id="cvc" required />
          </div>
        </div>
        <Button type="submit" className="w-full">
          Pay Now
        </Button>
      </form>
      {paymentStatus && (
        <p className="text-center font-semibold text-green-600">{paymentStatus}</p>
      )}
    </div>
  )
}
