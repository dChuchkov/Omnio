"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/lib/language"
import { getPageBySlug } from "@/lib/api"
import DynamicZone from "@/components/DynamicZone"
import { Page } from "@/lib/types"

export default function AboutPage() {
  const { locale } = useLanguage()
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPage() {
      setLoading(true)
      try {
        const response = await getPageBySlug('about', locale)
        if (response.data && response.data.length > 0) {
          setPage(response.data[0])
        }
      } catch (error) {
        console.error("Error fetching about page:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [locale])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Omnio</h1>
        <p className="text-gray-600">Content not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.title}</h1>
      </div>

      <div className="space-y-12">
        {page.sections && page.sections.length > 0 && (
          <DynamicZone sections={page.sections} />
        )}
      </div>
    </div>
  )
}
