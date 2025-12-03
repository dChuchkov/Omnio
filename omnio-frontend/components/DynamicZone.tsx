import Image from "next/image"
import Link from "@/components/Link"
import { getStrapiMedia } from "@/lib/api"
import { BlocksRenderer } from "@strapi/blocks-react-renderer"
import ProductCarouselSection from "./ProductCarouselSection"
import type { DynamicZoneComponent, FeatureItem } from "@/lib/types"

interface DynamicZoneProps {
    sections: DynamicZoneComponent[]
}

export default function DynamicZone({ sections }: DynamicZoneProps) {
    return (
        <>
            {sections.map((section: DynamicZoneComponent, index: number) => {
                switch (section.__component) {
                    case 'dynamic-zone.hero-section':
                        return (
                            <section key={index} className="relative min-h-[500px] flex items-center">
                                {section.backgroundImage && (
                                    <Image
                                        src={getStrapiMedia(section.backgroundImage.url) || ''}
                                        alt={section.backgroundImage.alternativeText || section.title}
                                        fill
                                        className="object-cover"
                                        priority={index === 0}
                                    />
                                )}
                                <div className="relative z-10 container mx-auto px-4">
                                    <h1 className="text-5xl font-bold text-white">{section.title}</h1>
                                    {section.subtitle && (
                                        <p className="text-xl text-white/90 mt-4">{section.subtitle}</p>
                                    )}
                                    {section.ctaText && section.ctaUrl && (
                                        <Link
                                            href={section.ctaUrl}
                                            className="inline-block mt-6 bg-primary text-white px-8 py-3 rounded-lg"
                                        >
                                            {section.ctaText}
                                        </Link>
                                    )}
                                </div>
                            </section>
                        );

                    case 'dynamic-zone.feature-grid':
                        return (
                            <section key={index} className="py-16 container mx-auto px-4">
                                {section.title && (
                                    <h2 className="text-3xl font-bold text-center mb-12">{section.title}</h2>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {section.features.map((feature: FeatureItem) => (
                                        <div key={feature.id} className="text-center">
                                            <div className="text-4xl mb-4">{feature.icon}</div>
                                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                            {feature.description && (
                                                <p className="text-gray-600">{feature.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );

                    case 'dynamic-zone.content-block':
                        const bgClasses: Record<string, string> = {
                            white: 'bg-white',
                            gray: 'bg-gray-100',
                            primary: 'bg-primary text-white'
                        };
                        return (
                            <section key={index} className={`py-16 ${bgClasses[section.backgroundColor]}`}>
                                <div className="container mx-auto px-4 max-w-4xl">
                                    {section.title && (
                                        <h2 className="text-3xl font-bold mb-8">{section.title}</h2>
                                    )}
                                    {section.content && (
                                        <div className="prose max-w-none">
                                            <BlocksRenderer content={section.content as any} />
                                        </div>
                                    )}
                                </div>
                            </section>
                        );

                    case 'dynamic-zone.product-carousel':
                        return (
                            <section key={index} className="py-16 container mx-auto px-4">
                                <ProductCarouselSection
                                    title={section.title || undefined}
                                    categoryId={section.category?.id}
                                    categorySlug={section.category?.slug}
                                    showFeaturedOnly={section.showFeaturedOnly}
                                    displayCount={section.displayCount}
                                />
                            </section>
                        );

                    default:
                        console.warn(`Unknown component: ${(section as any).__component}`);
                        return null;
                }
            })}
        </>
    );
}
