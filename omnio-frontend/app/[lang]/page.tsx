"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPageBySlug, getFeaturedProducts } from '@/lib/api';
import { useLanguage } from '@/lib/language';
import DynamicZone from '@/components/DynamicZone';
import ProductCarousel from '../components/ProductCarousel';
import type { Page, Product } from '@/lib/types';

export default function Home() {
  const params = useParams();
  const locale = (params.lang as string) || 'en';
  const [page, setPage] = useState<Page | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [pageData, featuredProductsData] = await Promise.all([
          getPageBySlug('home', locale),
          getFeaturedProducts(locale)
        ]);

        const fetchedPage = pageData?.data?.[0] || null;
        const fetchedProducts = featuredProductsData?.data || [];

        setPage(fetchedPage);
        setFeaturedProducts(fetchedProducts);

        // These logs will now appear in browser console
        console.log('[Homepage] Locale:', locale);
        console.log('[Homepage] Page data:', fetchedPage);
        console.log('[Homepage] Featured products count:', fetchedProducts.length);
        console.log('[Homepage] Featured products:', fetchedProducts);
      } catch (err) {
        console.error('Failed to load home page:', err);
        setError('Failed to load page content');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [locale]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Render Dynamic Zone sections if page exists */}
      {page && page.sections && page.sections.length > 0 ? (
        <DynamicZone sections={page.sections} />
      ) : (
        /* Fallback Hero Section if no page found */
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to{" "}
            <span className="text-blue-600">
              omn<span className="text-orange-500">io</span>
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-6">Your ultimate shopping destination for everything you need</p>
          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <span>✓ Free Shipping</span>
            <span>✓ 30-Day Returns</span>
            <span>✓ Secure Payments</span>
          </div>
        </div>
      )}

      {/* Featured Products Carousel */}
      {featuredProducts && featuredProducts.length > 0 ? (
        <ProductCarousel products={featuredProducts} title="Featured Products" viewAllLink="/category/featured" />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">No featured products found. Make sure products have "isFeatured" set to true in Strapi.</p>
        </div>
      )}
    </div>
  );
}
