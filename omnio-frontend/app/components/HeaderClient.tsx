// app/components/HeaderClient.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "@/components/Link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Search, Globe, Menu, User, Heart, ChevronDown, Settings, LogOut } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth"
import { useCart } from "@/lib/cart"
import { useWishlist } from "@/lib/wishlist"
import { useLanguage, type Locale } from "@/lib/language"
import MegaMenu from "./MegaMenu"
import type { LinkItem, Category } from "@/lib/types"

const languages: { code: Locale; name: string }[] = [
    { code: "en", name: "English" },
    { code: "de", name: "Deutsch" },
]

interface HeaderClientProps {
    brandName: string;
    logoUrl: string | null;
    navigationLinks: LinkItem[];
    searchPlaceholder: string;
    categories?: Category[];
}

export default function HeaderClient({
    brandName,
    logoUrl,
    navigationLinks,
    searchPlaceholder,
    categories = []
}: HeaderClientProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [showMegaMenu, setShowMegaMenu] = useState(false)
    const router = useRouter()
    const { user, logout } = useAuth()
    const { totalItems } = useCart()
    const { totalItems: wishlistItems } = useWishlist()
    const { locale, setLocale } = useLanguage()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    const handleMenuToggle = () => {
        setShowMegaMenu(!showMegaMenu)
    }

    const handleCartClick = () => {
        if (user) {
            router.push("/cart")
        } else {
            router.push("/signin?redirect=/cart")
        }
    }

    const handleLogout = () => {
        logout()
        router.push("/")
    }

    const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

    return (
        <div className="flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            {logoUrl ? (
                                <>
                                    <Image src={logoUrl} alt={brandName} width={40} height={40} className="rounded" />
                                    <span className="text-2xl font-bold tracking-tight text-white">{brandName}</span>
                                </>
                            ) : (
                                <div className="text-3xl font-bold tracking-tight">
                                    <span className="text-white">omn</span>
                                    <span className="text-orange-400">io</span>
                                </div>
                            )}
                        </Link>
                    </div>

                    {/* Search Bar - Centered with proper spacing */}
                    <div className="flex-1 max-w-2xl mx-8">
                        <form onSubmit={handleSearch} className="flex items-center space-x-2">
                            <div className="relative flex-1">
                                <Input
                                    type="search"
                                    placeholder={searchPlaceholder}
                                    className="w-full bg-white/95 border-white/30 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-white/50 rounded-full pl-4 pr-12 h-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-blue-100 text-gray-600 hover:text-blue-700 rounded-full"
                                >
                                    <Search className="h-4 w-4" />
                                    <span className="sr-only">Search</span>
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Right Side Navigation */}
                    <nav className="flex items-center space-x-2">
                        {/* Language Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="hover:bg-white/10 rounded-full px-3">
                                    <Globe className="h-4 w-4 mr-1" />
                                    <span className="text-sm">{currentLanguage.code.toUpperCase()}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                {languages.map((lang) => (
                                    <DropdownMenuItem key={lang.code} onClick={() => setLocale(lang.code)}>
                                        {lang.name} ({lang.code.toUpperCase()})
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Navigation Links from Strapi - REMOVED per user request
                        <div className="hidden lg:flex items-center space-x-1">
                            {navigationLinks.map((link) => (
                                <Link
                                    key={link.id}
                                    href={link.url}
                                    target={link.isExternal ? '_blank' : undefined}
                                    className="text-white hover:bg-white/10 px-3 py-2 rounded-full text-sm"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        */}

                        {user ? (
                            <>
                                {/* Wishlist Button */}
                                <Link href="/wishlist">
                                    <Button variant="ghost" size="sm" className="hover:bg-white/10 relative rounded-full px-3">
                                        <Heart className="h-4 w-4 mr-1" />
                                        <span className="text-sm hidden sm:inline">Wishlist</span>
                                        {wishlistItems > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm">
                                                {wishlistItems}
                                            </span>
                                        )}
                                    </Button>
                                </Link>

                                {/* User Account Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="hover:bg-white/10 rounded-full px-3">
                                            <User className="h-4 w-4 mr-1" />
                                            <span className="text-sm hidden sm:inline">{user.firstName}</span>
                                            <ChevronDown className="h-3 w-3 ml-1" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuItem asChild>
                                            <Link href="/account" className="flex items-center cursor-pointer">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Account Settings
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout}>
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Sign Out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            /* Sign In Button for non-logged users */
                            <Link href="/signin">
                                <Button variant="ghost" size="sm" className="hover:bg-white/10 rounded-full px-3">
                                    <User className="h-4 w-4 mr-1" />
                                    <span className="text-sm hidden sm:inline">Sign In</span>
                                </Button>
                            </Link>
                        )}

                        {/* Cart Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-white/10 relative rounded-full px-3"
                            onClick={handleCartClick}
                        >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            <span className="text-sm hidden sm:inline">Cart</span>
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm">
                                    {totalItems}
                                </span>
                            )}
                            <span className="sr-only">Shopping Cart</span>
                        </Button>
                    </nav>
                </div>
            </header>

            {/* Categories Bar */}
            <div className="bg-gray-50 border-b">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
                    <div
                        className="relative inline-block"
                        onMouseEnter={() => setShowMegaMenu(true)}
                        onMouseLeave={() => setShowMegaMenu(false)}
                        onClick={handleMenuToggle}
                    >
                        <Button
                            variant="ghost"
                            className="h-12 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-none font-medium"
                        >
                            <Menu className="h-4 w-4 mr-2" />
                            All Categories
                        </Button>
                        <MegaMenu isVisible={showMegaMenu} categories={categories} />
                    </div>
                </div>
            </div>

            {/* Mobile overlay to close menu */}
            {showMegaMenu && (
                <div className="md:hidden fixed inset-0 bg-black/20 z-40" onClick={() => setShowMegaMenu(false)} />
            )}
        </div>
    )
}
