"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Grid, List, ChevronLeft, ChevronRight } from "lucide-react"
import type { Product } from "@/lib/data"

interface CategoryPageClientProps {
  products: Product[]
  categoryName: string
}

type SortOption = "newest" | "price-low" | "price-high" | "name-asc" | "name-desc"

export default function CategoryPageClient({ products, categoryName }: CategoryPageClientProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)

  // Price filter
  const minPrice = Math.min(...products.map((p) => p.price))
  const maxPrice = Math.max(...products.map((p) => p.price))
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice])

  // Brand filter
  const availableBrands = useMemo(() => {
    const brands = new Set(products.map((p) => p.brand))
    return Array.from(brands).sort()
  }, [products])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const inPriceRange = product.price >= priceRange[0] && product.price <= priceRange[1]
      const inBrandFilter = selectedBrands.length === 0 || selectedBrands.includes(product.brand)
      return inPriceRange && inBrandFilter
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "newest":
        default:
          return b.id - a.id
      }
    })

    return filtered
  }, [products, priceRange, selectedBrands, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [priceRange, selectedBrands, sortBy, itemsPerPage])

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="space-y-6">
      {/* Category Title with Refined Styling */}
      <div className="bg-white border-l-4 border-blue-600 rounded-lg px-6 py-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">{categoryName}</h1>
        <p className="text-gray-600 mt-2">Browse our selection of {filteredAndSortedProducts.length} products</p>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className="w-64 flex-shrink-0 space-y-6">
          {/* Price Filter */}
          <div className="bg-white p-4 rounded-lg border-2 border-blue-100 shadow-sm">
            <h3 className="font-semibold mb-4 text-gray-800 flex items-center">
              <span className="w-1 h-5 bg-blue-600 mr-2 rounded"></span>
              Price Range
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-24 border-blue-200 focus:border-blue-500"
                  min={minPrice}
                  max={maxPrice}
                />
                <span className="text-gray-500">-</span>
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-24 border-blue-200 focus:border-blue-500"
                  min={minPrice}
                  max={maxPrice}
                />
              </div>
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                min={minPrice}
                max={maxPrice}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Brand Filter */}
          <div className="bg-white p-4 rounded-lg border-2 border-blue-100 shadow-sm">
            <h3 className="font-semibold mb-4 text-gray-800 flex items-center">
              <span className="w-1 h-5 bg-blue-600 mr-2 rounded"></span>
              Brands
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableBrands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2 hover:bg-blue-50 p-1 rounded transition-colors">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => handleBrandToggle(brand)}
                  />
                  <Label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer flex-1">
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {(selectedBrands.length > 0 || priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800 text-sm">Active Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPriceRange([minPrice, maxPrice])
                    setSelectedBrands([])
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                >
                  Clear All
                </Button>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                {selectedBrands.length > 0 && <div>Brands: {selectedBrands.length} selected</div>}
                {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                  <div>
                    Price: ${priceRange[0]} - ${priceRange[1]}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Controls Bar with Enhanced Styling */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border-2 border-gray-200 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-300">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-gray-100"}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-gray-100"}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-sm font-medium text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-300">
                  <span className="text-blue-600 font-semibold">
                    {startIndex + 1}-{Math.min(endIndex, filteredAndSortedProducts.length)}
                  </span>{" "}
                  of <span className="text-blue-600 font-semibold">{filteredAndSortedProducts.length}</span> results
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger className="w-44 bg-white border-gray-300 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="name-asc">Name: A to Z</SelectItem>
                      <SelectItem value="name-desc">Name: Z to A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Show:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                    <SelectTrigger className="w-20 bg-white border-gray-300 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="40">40</SelectItem>
                      <SelectItem value="60">60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {currentProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔍</span>
                </div>
                <p className="text-gray-600 mb-4 text-lg font-medium">No products match your filters.</p>
                <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search criteria</p>
                <Button
                  onClick={() => {
                    setPriceRange([minPrice, maxPrice])
                    setSelectedBrands([])
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentProducts.map((product) => (
                <Card key={product.id} className="flex flex-col h-full hover:shadow-xl transition-shadow">
                  <CardHeader className="flex-shrink-0">
                    <div className="relative aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      {product.originalPrice && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </div>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 min-h-[3rem] text-sm">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-xs text-gray-600">{product.brand}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                      {product.originalPrice && (
                        <p className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="mt-auto pt-4">
                    <Link href={`/product/${product.id}`} className="w-full">
                      <Button className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white">View Product</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {currentProducts.map((product) => (
                <Card key={product.id} className="flex flex-row p-4 hover:shadow-lg transition-shadow">
                  <div className="relative w-32 h-32 overflow-hidden rounded-lg flex-shrink-0">
                    <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 ml-4 flex flex-col justify-between">
                    <div>
                      <Link href={`/product/${product.id}`} className="font-semibold hover:text-blue-600">
                        {product.name}
                      </Link>
                      <p className="text-xs text-gray-600 mt-1">{product.brand}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="text-xl font-bold">${product.price.toFixed(2)}</p>
                        {product.originalPrice && (
                          <p className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</p>
                        )}
                      </div>
                      <Link href={`/product/${product.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">View Product</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination with Enhanced Styling */}
          {totalPages > 1 && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border-2 border-gray-200 shadow-md">
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-white hover:bg-blue-50 disabled:opacity-50 border-gray-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber: number
                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      onClick={() => handlePageChange(pageNumber)}
                      className={
                        currentPage === pageNumber
                          ? "bg-blue-600 hover:bg-blue-700 text-white font-semibold min-w-[40px]"
                          : "bg-white hover:bg-blue-50 border-gray-300 min-w-[40px]"
                      }
                    >
                      {pageNumber}
                    </Button>
                  )
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-gray-500 font-medium">...</span>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(totalPages)}
                      className="bg-white hover:bg-blue-50 border-gray-300 min-w-[40px]"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-white hover:bg-blue-50 disabled:opacity-50 border-gray-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
