"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/lib/language"
import { getProducts, getProductsByCategory, getFeaturedProducts } from "@/lib/api"
import ProductCarousel from "@/app/components/ProductCarousel"
import { Product } from "@/lib/types"

interface ProductCarouselSectionProps {
    title?: string;
    categoryId?: number;
    categorySlug?: string;
    showFeaturedOnly?: boolean;
    displayCount?: number;
}

export default function ProductCarouselSection({
    title = "Products",
    categoryId,
    categorySlug,
    showFeaturedOnly,
    displayCount = 8
}: ProductCarouselSectionProps) {
    const { locale } = useLanguage()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true)
            try {
                let response;

                if (showFeaturedOnly) {
                    response = await getFeaturedProducts(locale)
                } else if (categorySlug) {
                    response = await getProductsByCategory(categorySlug, locale)
                } else {
                    response = await getProducts(locale)
                }

                if (response && response.data) {
                    let fetchedProducts = response.data;

                    // Filter by category ID if slug wasn't available but ID was
                    if (categoryId && !categorySlug) {
                        fetchedProducts = fetchedProducts.filter(p => p.category?.id === categoryId)
                    }

                    // Limit count
                    if (displayCount) {
                        fetchedProducts = fetchedProducts.slice(0, displayCount)
                    }

                    setProducts(fetchedProducts)
                }
            } catch (error) {
                console.error("Error fetching products for carousel:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [categoryId, categorySlug, showFeaturedOnly, displayCount, locale])

    if (loading) {
        return <div className="py-12 text-center">Loading products...</div>
    }

    if (products.length === 0) {
        return null
    }

    return (
        <ProductCarousel
            products={products}
            title={title}
            viewAllLink={categorySlug ? `/category/${categorySlug}` : '/products'}
        />
    )
}
