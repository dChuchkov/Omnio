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
                            <section key={index} className="mb-8">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
                                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                        Welcome to <span className="text-blue-600">omn<span className="text-orange-500">io</span></span>
                                    </h1>
                                    {section.subtitle && (
                                        <p className="text-lg text-gray-600 mb-6">{section.subtitle}</p>
                                    )}
                                    {section.features && section.features.length > 0 && (
                                        <div className="flex justify-center space-x-4 text-sm text-gray-500">
                                            {section.features.map((feature, i) => (
                                                <span key={i}>✓ {feature.title}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        );

                    case 'dynamic-zone.feature-grid':
                        return null;

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
                            <section key={index} className="py-8">
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
