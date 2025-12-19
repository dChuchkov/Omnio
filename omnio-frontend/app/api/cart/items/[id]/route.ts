import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function forwardRequest(method: string, id: string, token: string | undefined, body?: any) {
    try {
        const res = await fetch(`${STRAPI_URL}/api/carts/me/items/${id}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: token ? `Bearer ${token}` : '',
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        // Try to parse JSON, but fall back to text if none
        const text = await res.text().catch(() => '');
        let data = null;
        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            data = text;
        }

        return NextResponse.json(data ?? {}, { status: res.status });
    } catch (error) {
        console.error('cart proxy error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const token = cookies().get('jwt')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json().catch(() => undefined);
    return forwardRequest('PUT', params.id, token, body);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const token = cookies().get('jwt')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    return forwardRequest('DELETE', params.id, token);
}
