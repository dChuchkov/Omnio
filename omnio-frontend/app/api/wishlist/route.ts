import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function forwardRequest(method: string, path: string, body?: any, searchParams?: URLSearchParams) {
    const token = cookies().get('jwt')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const queryString = searchParams ? `?${searchParams.toString()}` : '';
    const url = `${STRAPI_URL}${path}${queryString}`;

    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: body ? JSON.stringify(body) : undefined,
            cache: 'no-store',
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    return forwardRequest('GET', '/api/wishlists', undefined, searchParams);
}

export async function POST(request: Request) {
    const body = await request.json();
    return forwardRequest('POST', '/api/wishlists', body);
}
