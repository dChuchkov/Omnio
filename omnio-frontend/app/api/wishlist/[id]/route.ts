import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

async function forwardRequest(method: string, id: string, body?: any) {
    const token = cookies().get('jwt')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const res = await fetch(`${STRAPI_URL}/api/wishlists/${id}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const body = await request.json();
    return forwardRequest('PUT', params.id, body);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    return forwardRequest('DELETE', params.id);
}
