// app/components/Header.tsx
import { getGlobalSettings, getStrapiMedia, getParentCategories } from '@/lib/api';
import HeaderClient from './HeaderClient';

export default async function Header() {
  try {
    const [settings, categoriesResponse] = await Promise.all([
      getGlobalSettings('en'),
      getParentCategories('en')
    ]);

    const header = settings.data.header;
    const categories = categoriesResponse.data;

    return (
      <HeaderClient
        brandName={header.brandName}
        logoUrl={getStrapiMedia(header.logo?.url ?? null)}
        navigationLinks={header.navigationLinks}
        searchPlaceholder={header.searchPlaceholder}
        categories={categories}
      />
    );
  } catch (error) {
    console.error('Failed to fetch header settings:', error);
    // Fallback to default header if Strapi is unavailable
    return (
      <HeaderClient
        brandName="omnio"
        logoUrl={null}
        navigationLinks={[]}
        searchPlaceholder="Search products, brands, categories..."
      />
    );
  }
}
