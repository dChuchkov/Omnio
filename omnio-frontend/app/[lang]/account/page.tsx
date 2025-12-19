"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "@/components/Link"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, CreditCard, MapPin, Package, Heart, ChevronRight } from "lucide-react"

type TabType = "profile" | "payment" | "addresses" | "orders" | "wishlist"

export default function AccountPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("profile")

  // Redirect if not logged in
  if (!user) {
    router.push("/signin?redirect=/account")
    return null
  }

  const sidebarItems = [
    { id: "profile" as TabType, label: "My Profile", icon: User },
    { id: "payment" as TabType, label: "Payment Cards", icon: CreditCard },
    { id: "addresses" as TabType, label: "Addresses", icon: MapPin },
    { id: "orders" as TabType, label: "Orders & Returns", icon: Package },
    { id: "wishlist" as TabType, label: "Wishlist", icon: Heart },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${activeTab === item.id
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 mr-3" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {activeTab === "profile" && <ProfileSection user={user} />}
            {activeTab === "payment" && <PaymentSection />}
            {activeTab === "addresses" && <AddressesSection />}
            {activeTab === "orders" && <OrdersSection />}
            {activeTab === "wishlist" && <WishlistSection />}
          </main>
        </div>
      </div>
    </div>
  )
}

function ProfileSection({ user }: { user: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" defaultValue={user.firstName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" defaultValue={user.lastName} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue={user.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
        </div>
        <Separator />
        <div>
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PaymentSection() {
  const cards = [
    { id: 1, type: "Visa", last4: "4242", expiry: "12/25", isDefault: true },
    { id: 2, type: "Mastercard", last4: "8888", expiry: "09/26", isDefault: false },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Cards</CardTitle>
        <CardDescription>Manage your saved payment methods</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <CreditCard className="h-8 w-8 text-gray-400" />
              <div>
                <p className="font-medium">
                  {card.type} •••• {card.last4}
                </p>
                <p className="text-sm text-gray-600">Expires {card.expiry}</p>
                {card.isDefault && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Default
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="outline" size="sm">
                Remove
              </Button>
            </div>
          </div>
        ))}
        <Button className="w-full bg-transparent" variant="outline">
          + Add New Card
        </Button>
      </CardContent>
    </Card>
  )
}

function AddressesSection() {
  const addresses = [
    {
      id: 1,
      type: "Home",
      name: "John Doe",
      street: "123 Main Street",
      city: "New York, NY 10001",
      isDefault: true,
    },
    {
      id: 2,
      type: "Work",
      name: "John Doe",
      street: "456 Office Blvd",
      city: "New York, NY 10002",
      isDefault: false,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Addresses</CardTitle>
        <CardDescription>Manage your shipping and billing addresses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="flex items-start justify-between p-4 border rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start space-x-4">
              <MapPin className="h-6 w-6 text-gray-400 mt-1" />
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{address.type}</p>
                  {address.isDefault && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Default</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{address.name}</p>
                <p className="text-sm text-gray-600">{address.street}</p>
                <p className="text-sm text-gray-600">{address.city}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="outline" size="sm">
                Remove
              </Button>
            </div>
          </div>
        ))}
        <Button className="w-full bg-transparent" variant="outline">
          + Add New Address
        </Button>
      </CardContent>
    </Card>
  )
}

function OrdersSection() {
  const orders = [
    {
      id: "ORD-2024-001",
      date: "March 15, 2024",
      status: "Delivered",
      total: "$299.99",
      items: 3,
    },
    {
      id: "ORD-2024-002",
      date: "March 10, 2024",
      status: "In Transit",
      total: "$149.99",
      items: 2,
    },
    {
      id: "ORD-2024-003",
      date: "March 5, 2024",
      status: "Processing",
      total: "$89.99",
      items: 1,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700"
      case "In Transit":
        return "bg-blue-100 text-blue-700"
      case "Processing":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders & Returns</CardTitle>
        <CardDescription>View and manage your order history</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <Package className="h-8 w-8 text-gray-400" />
              <div>
                <p className="font-medium">{order.id}</p>
                <p className="text-sm text-gray-600">{order.date}</p>
                <p className="text-sm text-gray-600">{order.items} items</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold">{order.total}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No orders yet</p>
            <Button className="mt-4" asChild>
              <Link href="/">Start Shopping</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function WishlistSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wishlist</CardTitle>
        <CardDescription>Items you've saved for later</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Your wishlist is managed separately</p>
          <Button asChild>
            <Link href="/wishlist">Go to Wishlist</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
