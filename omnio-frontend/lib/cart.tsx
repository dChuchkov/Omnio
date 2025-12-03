"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth"
import { getCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart, updateCartItem as apiUpdateCartItem, createCart } from "./api"
import type { Product } from "./types"

interface CartItem {
  id?: number // Strapi ID
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity: number) => Promise<void>
  removeFromCart: (productId: number) => Promise<void>
  updateQuantity: (productId: number, quantity: number) => Promise<void>
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  // Fetch cart on load/login
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        setIsLoading(true)
        try {
          const token = localStorage.getItem("jwt")
          if (!token) return

          let cart = await getCart(token, user.id)

          if (!cart) {
            // Create cart if not exists
            const newCartRes = await createCart(token, user.id)
            cart = newCartRes.data
          }

          if (cart && cart.cart_items) {
            const mappedItems = cart.cart_items.map((item: any) => ({
              id: item.id,
              product: item.product,
              quantity: item.quantity
            }))
            setItems(mappedItems)
          }
        } catch (error) {
          console.error("Failed to fetch cart:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        // Load from local storage for guest
        const savedCart = localStorage.getItem("guest_cart")
        if (savedCart) {
          setItems(JSON.parse(savedCart))
        }
      }
    }

    fetchCart()
  }, [user])

  // Save to local storage for guest
  useEffect(() => {
    if (!user) {
      localStorage.setItem("guest_cart", JSON.stringify(items))
    }
  }, [items, user])

  const addToCart = async (product: Product, quantity: number) => {
    if (user) {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("jwt")
        if (!token) return

        // Check if item exists in current state to get its ID (if we want to update)
        // But for now, let's assume we just add new line item or backend handles merge?
        // Our backend schema allows multiple lines for same product (unidirectional many-to-one/one-to-one mess we fixed).
        // Actually, we should check if product is already in cart items.

        const existingItem = items.find(item => item.product.id === product.id)

        if (existingItem && existingItem.id) {
          // Update quantity
          await apiUpdateCartItem(token, existingItem.id, existingItem.quantity + quantity)
        } else {
          // Get cart ID first
          let cart = await getCart(token, user.id)
          if (!cart) {
            const newCartRes = await createCart(token, user.id)
            cart = newCartRes.data
          }
          await apiAddToCart(token, cart.id, product.id, quantity)
        }

        // Refresh cart
        const updatedCart = await getCart(token, user.id)
        if (updatedCart && updatedCart.cart_items) {
          const mappedItems = updatedCart.cart_items.map((item: any) => ({
            id: item.id,
            product: item.product,
            quantity: item.quantity
          }))
          setItems(mappedItems)
        }

      } catch (error) {
        console.error("Failed to add to cart:", error)
      } finally {
        setIsLoading(false)
      }
    } else {
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.product.id === product.id)
        if (existingItem) {
          return prevItems.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
          )
        } else {
          return [...prevItems, { product, quantity }]
        }
      })
    }
  }

  const removeFromCart = async (productId: number) => {
    if (user) {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("jwt")
        if (!token) return

        const item = items.find(i => i.product.id === productId)
        if (item && item.id) {
          await apiRemoveFromCart(token, item.id)

          // Refresh
          const updatedCart = await getCart(token, user.id)
          if (updatedCart && updatedCart.cart_items) {
            const mappedItems = updatedCart.cart_items.map((item: any) => ({
              id: item.id,
              product: item.product,
              quantity: item.quantity
            }))
            setItems(mappedItems)
          } else {
            setItems([])
          }
        }
      } catch (error) {
        console.error("Failed to remove from cart:", error)
      } finally {
        setIsLoading(false)
      }
    } else {
      setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId))
    }
  }

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId)
      return
    }

    if (user) {
      // Debouncing would be good here, but for simplicity direct call
      try {
        const token = localStorage.getItem("jwt")
        if (!token) return

        const item = items.find(i => i.product.id === productId)
        if (item && item.id) {
          // Optimistic update
          setItems((prevItems) => prevItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))

          await apiUpdateCartItem(token, item.id, quantity)
          // No need to refresh full cart for quantity update if we trust optimistic
        }
      } catch (error) {
        console.error("Failed to update quantity:", error)
        // Revert on error?
      }
    } else {
      setItems((prevItems) => prevItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
    }
  }

  const clearCart = () => {
    setItems([])
    if (!user) {
      localStorage.removeItem("guest_cart")
    }
    // For auth user, we might want to delete all items? Or just clear local state?
    // Usually clearCart implies emptying the cart.
    // Implementing delete all items is expensive loop.
    // For now just clear local state.
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
