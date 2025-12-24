import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

export async function POST(request: Request) {
    const token = cookies().get('jwt')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        // We don't expect a body for this specific request based on previous context, 
        // but if there is one, we should forward it.
        // The user request showed "Content-Length: 0" so likely no body.
        // However, let's be safe and try to read it if it exists.
        let body = undefined;
        try {
            const text = await request.text();
            if (text) {
                body = text; // Forward raw text or parse JSON if needed. 
                // But fetch body takes string or object.
            }
        } catch (e) {
            // No body
        }

        const res = await fetch(`${STRAPI_URL}/api/orders/place`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: body,
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(data, { status: res.status });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
