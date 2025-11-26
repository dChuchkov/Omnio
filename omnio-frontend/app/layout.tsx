import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./components/ClientLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Omnio - Your Ultimate Shopping Destination",
  description:
    "Discover amazing products across all categories at Omnio. From electronics to fashion, books to home appliances - find everything you need in one place.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
