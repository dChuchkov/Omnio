import { searchProducts } from "@/lib/data"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default async function SearchPage({ searchParams }: { searchParams: { q: string } }) {
  const query = searchParams.q?.toLowerCase() || ""
  const searchResults = await searchProducts(query)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Search Results for "{query}"</h1>
      {searchResults.length === 0 ? (
        <p>No products found matching your search.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {searchResults.map((product) => (
            <Card key={product.id} className="flex flex-col h-full">
              <CardHeader className="flex-shrink-0">
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                </div>
                <CardTitle className="line-clamp-2 min-h-[3rem] text-sm">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-xs text-gray-600">{product.brand}</p>
                <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter className="mt-auto pt-4">
                <Link href={`/product/${product.id}`} className="w-full">
                  <Button className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white">View Product</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
