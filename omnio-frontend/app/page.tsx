// app/page.tsx
import { getPageBySlug, getFeaturedProducts } from '@/lib/api';
import DynamicZone from '@/components/DynamicZone';
import ProductCarousel from './components/ProductCarousel';

export default async function Home() {
  try {
    const [pageData, featuredProductsData] = await Promise.all([
      getPageBySlug('home', 'en'),
      getFeaturedProducts('en')
    ]);

    const page = pageData.data[0];
    const featuredProducts = featuredProductsData.data;

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
        {featuredProducts.length > 0 && (
          <ProductCarousel products={featuredProducts} title="Featured Products" viewAllLink="/category/featured" />
        )}
      </div>
    );
  } catch (error) {
    console.error('Failed to load home page:', error);
    // Fallback UI if Strapi is unavailable
    return (
      <div className="space-y-8">
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
      </div>
    );
  }
}

export async function generateMetadata() {
  try {
    const pageData = await getPageBySlug('home', 'en');
    const page = pageData.data[0];

    return {
      title: page?.seo?.metaTitle || 'Omnio - E-commerce',
      description: page?.seo?.metaDescription || 'Welcome to Omnio',
    };
  } catch (error) {
    return {
      title: 'Omnio - E-commerce',
      description: 'Welcome to Omnio',
    };
  }
}
