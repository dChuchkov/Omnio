import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Mock data for products
interface Product {
  id: number
  name: string
  price: number
}

interface ProductCategories {
  [key: string]: Product[] | { [key: string]: Product[] }
}

const products: ProductCategories = {
  food: [
    { id: 1, name: "Premium Coffee Beans", price: 15.99 },
    { id: 2, name: "Organic Avocados", price: 5.99 },
    { id: 3, name: "Artisanal Cheese Selection", price: 24.99 },
  ],
  clothes: [
    { id: 1, name: "Cotton T-Shirt", price: 19.99 },
    { id: 2, name: "Denim Jeans", price: 49.99 },
    { id: 3, name: "Wool Sweater", price: 59.99 },
  ],
  "hardware-and-home-appliances": {
    all: [
      { id: 1, name: "Smart Thermostat", price: 149.99 },
      { id: 2, name: "Robot Vacuum Cleaner", price: 299.99 },
      { id: 3, name: "Wireless Headphones", price: 89.99 },
    ],
    fridges: [
      { id: 4, name: "Smart Fridge", price: 999.99 },
      { id: 5, name: "Mini Fridge", price: 199.99 },
    ],
    "washing-machines": [
      { id: 6, name: "Front Load Washer", price: 549.99 },
      { id: 7, name: "Top Load Washer", price: 449.99 },
    ],
    microwaves: [
      { id: 8, name: "Countertop Microwave", price: 89.99 },
      { id: 9, name: "Over-the-Range Microwave", price: 199.99 },
    ],
    stoves: [
      { id: 10, name: "Electric Stove", price: 399.99 },
      { id: 11, name: "Gas Range", price: 499.99 },
    ],
    "water-heaters": [
      { id: 12, name: "Tank Water Heater", price: 399.99 },
      { id: 13, name: "Tankless Water Heater", price: 599.99 },
    ],
  },
  books: [
    { id: 1, name: "Bestselling Novel", price: 12.99 },
    { id: 2, name: "Cookbook Collection", price: 34.99 },
    { id: 3, name: "Science Fiction Anthology", price: 19.99 },
  ],
  "office-supplies": [
    { id: 1, name: "Ergonomic Office Chair", price: 199.99 },
    { id: 2, name: "Wireless Keyboard and Mouse Set", price: 79.99 },
    { id: 3, name: "Desk Organizer Set", price: 29.99 },
  ],
}

export default function CategoryPage({ params }: { params: { slug: string[] } }) {
  const [mainCategory, subCategory] = params.slug
  let categoryProducts: Product[] = []
  let categoryName = ""

  if (mainCategory === "hardware-and-home-appliances") {
    const hardwareProducts = products[mainCategory] as { [key: string]: Product[] }
    if (subCategory) {
      categoryProducts = hardwareProducts[subCategory] || []
      categoryName = subCategory.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    } else {
      categoryProducts = hardwareProducts.all
      categoryName = "Hardware and Home Appliances"
    }
  } else {
    categoryProducts = (products[mainCategory] as Product[]) || []
    categoryName = mainCategory.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{categoryName}</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categoryProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter>
              <Button>Add to Cart</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
