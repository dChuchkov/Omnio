"use client"

import type React from "react"
import { useState } from "react"
import { AuthProvider } from "@/lib/auth"
import { CartProvider } from "@/lib/cart"
import { WishlistProvider } from "@/lib/wishlist"
import { LanguageProvider } from "@/lib/language"
import Sidebar from "./Sidebar"

import type { Category } from "@/lib/types"

export default function ClientLayout({
  children,
  header,
  footer,
  categories,
}: {
  children: React.ReactNode
  header: React.ReactNode
  footer: React.ReactNode
  categories: Category[]
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="flex min-h-screen flex-col">
              {header}
              <div className="flex flex-1 pt-2">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} categories={categories} />
                <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">{children}</main>
              </div>
              {footer}
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}
