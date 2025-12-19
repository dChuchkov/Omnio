"use client"

import Link, { LinkProps } from 'next/link';
import { useLanguage } from '@/lib/language';
import React from 'react';

interface Props extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>, LinkProps {
    children: React.ReactNode;
}

export default function LocaleLink({ href, children, ...props }: Props) {
    const { locale } = useLanguage();

    // If href is a string and starts with /, prepend locale
    // If it's an external link (http), leave it alone
    let newHref = href;

    if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('http')) {
        // Remove existing locale prefix if present (just in case)
        const cleanPath = href.replace(/^\/(en|de)/, '');
        newHref = `/${locale}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
    }

    return (
        <Link href={newHref} {...props}>
            {children}
        </Link>
    );
}
