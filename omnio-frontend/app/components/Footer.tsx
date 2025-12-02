// app/components/Footer.tsx
import { getGlobalSettings } from '@/lib/api';
import FooterClient from './FooterClient';

export default async function Footer() {
  try {
    const settings = await getGlobalSettings('en');
    const footer = settings.data.footer;

    return (
      <FooterClient
        siteName={settings.data.siteName}
        companyDescription={footer.companyDescription}
        quickLinks={footer.quickLinks}
        legalLinks={footer.legalLinks}
        newsletterTitle={footer.newsletterTitle}
        copyrightText={footer.copyrightText}
      />
    );
  } catch (error) {
    console.error('Failed to fetch footer settings:', error);
    // Fallback to default footer if Strapi is unavailable
    return (
      <FooterClient
        siteName="omnio"
        companyDescription="Your ultimate shopping destination for everything you need."
        quickLinks={[]}
        legalLinks={[]}
        newsletterTitle="Subscribe to our Newsletter"
        copyrightText="© 2025 Omnio. All rights reserved."
      />
    );
  }
}
