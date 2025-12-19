import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const body = await request.json();
    const { identifier, password } = body;

    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

    try {
        const strapiRes = await fetch(`${strapiUrl}/api/auth/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password }),
        });

        const data = await strapiRes.json();

        if (!strapiRes.ok) {
            return NextResponse.json(
                { error: data.error?.message || 'Login failed' },
                { status: strapiRes.status }
            );
        }

        // Set HTTP-only cookie
        cookies().set('jwt', data.jwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
            sameSite: 'lax',
        });

        return NextResponse.json({ user: data.user });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
