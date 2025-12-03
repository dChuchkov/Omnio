"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { login as apiLogin, register as apiRegister, fetchUser } from "./api"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for token on app start
    const token = localStorage.getItem("jwt")
    if (token) {
      fetchUser(token)
        .then((userData) => {
          setUser(userData)
        })
        .catch(() => {
          // If token is invalid, clear it
          localStorage.removeItem("jwt")
          localStorage.removeItem("user")
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const data = await apiLogin(email, password)

      localStorage.setItem("jwt", data.jwt)
      localStorage.setItem("user", JSON.stringify(data.user))

      setUser(data.user)
      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (firstName: string, lastName: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const username = `${firstName} ${lastName}`.trim()
      const data = await apiRegister(username, email, password)

      localStorage.setItem("jwt", data.jwt)
      localStorage.setItem("user", JSON.stringify(data.user))

      setUser(data.user)
      return true
    } catch (error) {
      console.error("Registration failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("jwt")
    localStorage.removeItem("user")
    // Optional: Clear cart/wishlist if we want to reset state
    // localStorage.removeItem("cart")
    // localStorage.removeItem("wishlist")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
