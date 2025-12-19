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
  removeFromCart: (cartItemId: number) => Promise<void>
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>
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
          // No token needed for client-side proxy calls
          let cart = await getCart()
          console.log('CartProvider: Fetched cart:', cart)

          if (!cart) {
            // Create cart if not exists
            console.log('CartProvider: Cart not found, creating new cart...')
            const newCartRes = await createCart()
            cart = newCartRes.data
            console.log('CartProvider: Created new cart:', cart)
          }

          if (cart && cart.cart_items) {
            console.log('CartProvider: Mapping items:', cart.cart_items)
            const mappedItems = (cart.cart_items ?? []).map((item: any) => {
              const prod = item.product?.data ?? item.product;
              if (!prod) {
                console.warn('CartProvider: cart_item has no product relation', item.id);
              }
              return {
                id: item.id,
                product: prod,
                quantity: item.quantity
              };
            });
            console.log('CartProvider: Mapped items:', mappedItems)
            setItems(mappedItems)
          } else {
            console.log('CartProvider: No items found in cart')
            setItems([])
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
        // Check if item exists in current state to get its ID (if we want to update)
        const existingItem = items.find(item => item.product?.id === product.id)

        if (existingItem && existingItem.id) {
          // Update quantity
          await apiUpdateCartItem(existingItem.id, existingItem.quantity + quantity)
        } else {
          // Add new item
          // Prefer documentId (Strapi v5) if available, otherwise numeric id
          const identifier = (product as any).documentId ?? product.id;
          if (!(product as any).documentId) {
            console.warn('Product missing documentId; sending numeric id. Product:', product.id);
          }
          await apiAddToCart(identifier, quantity)
        }

        // Refresh cart
        const updatedCart = await getCart()
        if (updatedCart && updatedCart.cart_items) {
          const mappedItems = (updatedCart.cart_items ?? []).map((item: any) => {
            const prod = item.product?.data ?? item.product;
            if (!prod) {
              console.warn('CartProvider: cart_item has no product relation', item.id);
            }
            return {
              id: item.id,
              product: prod,
              quantity: item.quantity
            };
          });
          setItems(mappedItems)
        } else {
          setItems([])
        }

      } catch (error) {
        console.error("Failed to add to cart:", error)
      } finally {
        setIsLoading(false)
      }
    } else {
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.product?.id === product.id)
        if (existingItem) {
          return prevItems.map((item) =>
            item.product?.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
          )
        } else {
          return [...prevItems, { product, quantity }]
        }
      })
    }
  }

  const removeFromCart = async (cartItemId: number) => {
    if (user) {
      setIsLoading(true)
      try {
        if (cartItemId) {
          await apiRemoveFromCart(cartItemId)

          // Refresh
          const updatedCart = await getCart()
          if (updatedCart && updatedCart.cart_items) {
            const mappedItems = (updatedCart.cart_items ?? []).map((item: any) => {
              const prod = item.product?.data ?? item.product;
              if (!prod) {
                console.warn('CartProvider: cart_item has no product relation', item.id);
              }
              return {
                id: item.id,
                product: prod,
                quantity: item.quantity
              };
            });
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
      setItems((prev) => prev.filter((item) => item.product?.id !== cartItemId)) // guest path unchanged if you keep productId for guests
    }
  }

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId)
      return
    }

    if (user) {
      try {
        // optimistic update by cartItemId
        setItems((prev) => prev.map((it) => (it.id === cartItemId ? { ...it, quantity } : it)))
        await apiUpdateCartItem(cartItemId, quantity)

        // re-fetch to ensure canonical state:
        const updatedCart = await getCart()
        if (updatedCart && updatedCart.cart_items) {
          const mappedItems = (updatedCart.cart_items ?? []).map((item: any) => {
            const prod = item.product?.data ?? item.product;
            if (!prod) {
              console.warn('CartProvider: cart_item has no product relation', item.id);
            }
            return {
              id: item.id,
              product: prod,
              quantity: item.quantity
            };
          });
          setItems(mappedItems)
        }
      } catch (error) {
        console.error("Failed to update quantity:", error)
        // optionally re-fetch on error to revert optimistic update
      }
    } else {
      setItems((prev) => prev.map((it) => (it.product?.id === cartItemId ? { ...it, quantity } : it)))
    }
  }

  const clearCart = () => {
    setItems([])
    if (!user) {
      localStorage.removeItem("guest_cart")
    }
  }

  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0), 0)

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
