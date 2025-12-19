"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { login as apiLogin, register as apiRegister, fetchUser, logout as apiLogout } from "./api"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for session on app start via proxy (cookie)
    const checkSession = async () => {
      try {
        const userData = await fetchUser()
        if (userData) {
          setUser(userData)
        } else {
          // Try guest fallback or just clear user
          setUser(null)
        }
      } catch (error) {
        console.error("Session check failed:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const data = await apiLogin(email, password)
      // data.user is returned from login proxy
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
      // data.user is returned from register proxy
      setUser(data.user)
      return true
    } catch (error) {
      console.error("Registration failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch (e) {
      console.error("Logout failed", e)
    }
    setUser(null)
    // Clear guest data if needed
    localStorage.removeItem("jwt")
    localStorage.removeItem("user")
    // localStorage.removeItem("guest_cart")
    // localStorage.removeItem("guest_wishlist")
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
