'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center p-4">
            <h2 className="text-2xl font-bold text-gray-900">Something went wrong!</h2>
            <p className="text-gray-600 max-w-md">
                We encountered an error while loading this page. This might be due to a connection issue with our backend services.
            </p>
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm font-mono text-left max-w-lg overflow-auto">
                {error.message}
            </div>
            <Button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Try again
            </Button>
        </div>
    )
}
