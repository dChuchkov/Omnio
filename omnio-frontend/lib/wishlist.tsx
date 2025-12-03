"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth"
import { getWishlist, createWishlist, updateWishlist as apiUpdateWishlist } from "./api"
import type { Product } from "./types"

interface WishlistContextType {
  items: Product[]
  addToWishlist: (product: Product) => Promise<void>
  removeFromWishlist: (productId: number) => Promise<void>
  isInWishlist: (productId: number) => boolean
  totalItems: number
  isLoading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  // Fetch wishlist on load/login
  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        setIsLoading(true)
        try {
          const token = localStorage.getItem("jwt")
          if (!token) return

          let wishlist = await getWishlist(token, user.id)

          if (!wishlist) {
            // Create wishlist if not exists
            const newWishlistRes = await createWishlist(token, user.id)
            wishlist = newWishlistRes.data
          }

          if (wishlist && wishlist.products) {
            setItems(wishlist.products)
          }
        } catch (error) {
          console.error("Failed to fetch wishlist:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        // Load from local storage for guest
        const savedWishlist = localStorage.getItem("guest_wishlist")
        if (savedWishlist) {
          setItems(JSON.parse(savedWishlist))
        }
      }
    }

    fetchWishlist()
  }, [user])

  // Save to local storage for guest
  useEffect(() => {
    if (!user) {
      localStorage.setItem("guest_wishlist", JSON.stringify(items))
    }
  }, [items, user])

  const addToWishlist = async (product: Product) => {
    if (user) {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("jwt")
        if (!token) return

        // Check if already in wishlist
        if (items.some(item => item.id === product.id)) return

        let wishlist = await getWishlist(token, user.id)
        if (!wishlist) {
          const newWishlistRes = await createWishlist(token, user.id)
          wishlist = newWishlistRes.data
        }

        const currentProductIds = wishlist.products ? wishlist.products.map((p: any) => p.id) : []
        const newProductIds = [...currentProductIds, product.id]

        await apiUpdateWishlist(token, wishlist.id, newProductIds)

        // Refresh
        const updatedWishlist = await getWishlist(token, user.id)
        if (updatedWishlist && updatedWishlist.products) {
          setItems(updatedWishlist.products)
        }

      } catch (error) {
        console.error("Failed to add to wishlist:", error)
      } finally {
        setIsLoading(false)
      }
    } else {
      setItems((prevItems) => {
        if (!prevItems.find((item) => item.id === product.id)) {
          return [...prevItems, product]
        }
        return prevItems
      })
    }
  }

  const removeFromWishlist = async (productId: number) => {
    if (user) {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("jwt")
        if (!token) return

        let wishlist = await getWishlist(token, user.id)
        if (!wishlist) return // Should exist if we are removing

        const currentProductIds = wishlist.products ? wishlist.products.map((p: any) => p.id) : []
        const newProductIds = currentProductIds.filter((id: number) => id !== productId)

        await apiUpdateWishlist(token, wishlist.id, newProductIds)

        // Refresh
        const updatedWishlist = await getWishlist(token, user.id)
        if (updatedWishlist && updatedWishlist.products) {
          setItems(updatedWishlist.products)
        } else {
          setItems([])
        }

      } catch (error) {
        console.error("Failed to remove from wishlist:", error)
      } finally {
        setIsLoading(false)
      }
    } else {
      setItems((prevItems) => prevItems.filter((item) => item.id !== productId))
    }
  }

  const isInWishlist = (productId: number) => {
    return items.some((item) => item.id === productId)
  }

  const totalItems = items.length

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        totalItems,
        isLoading
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
