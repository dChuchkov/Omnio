import type React from "react"
import { Inter } from "next/font/google"
import "../globals.css"
import ClientLayout from "../components/ClientLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Omnio - Your Ultimate Shopping Destination",
  description:
    "Discover amazing products across all categories at Omnio. From electronics to fashion, books to home appliances - find everything you need in one place.",
  generator: "v0.app",
}

import { getParentCategories } from "@/lib/api"
import Header from "../components/Header"
import Footer from "../components/Footer"



export default async function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  const categoriesResponse = await getParentCategories(lang);
  const categories = categoriesResponse.data;

  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout
          categories={categories}
          header={<Header />}
          footer={<Footer />}
        >
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
