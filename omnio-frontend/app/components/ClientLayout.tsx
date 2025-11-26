"use client"

import type React from "react"
import { useState } from "react"
import { AuthProvider } from "@/lib/auth"
import { CartProvider } from "@/lib/cart"
import { WishlistProvider } from "@/lib/wishlist"
import Header from "./Header"
import Sidebar from "./Sidebar"
import Footer from "./Footer"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="flex min-h-screen flex-col">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex flex-1 pt-2">
              <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
              <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">{children}</main>
            </div>
            <Footer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}
