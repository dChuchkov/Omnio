export interface ProductVariant {
  color: string
  colorCode: string // Hex color code for display
  image?: string // Optional: different image for each color variant
  availableStock?: number
}

export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  category: string
  subCategory: string
  brand: string
  description: string
  features: string[]
  specifications: Record<string, string>
  image: string
  // Color variants - when integrated with Strapi, this will come from the API
  // Strapi schema should include: variants: { color, colorCode, image?, availableStock? }[]
  variants?: ProductVariant[]
}

export const products: Product[] = [
  // Food & Beverages
  {
    id: 1,
    name: "Gourmet Potato Chips",
    price: 3.99,
    originalPrice: 4.99,
    category: "food",
    subCategory: "snacks",
    brand: "Crunch Master",
    description: "Crispy, hand-cut potato chips with a blend of herbs and spices.",
    features: ["All-natural ingredients", "Gluten-free", "No artificial flavors"],
    specifications: {
      Weight: "150g",
      Flavor: "Sea Salt & Rosemary",
      Packaging: "Resealable bag",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 2,
    name: "Organic Green Tea",
    price: 12.99,
    originalPrice: 15.99,
    category: "food",
    subCategory: "beverages",
    brand: "Tea Haven",
    description: "Premium organic green tea leaves for a refreshing and healthy drink.",
    features: ["USDA Organic", "Rich in antioxidants", "Sustainably sourced"],
    specifications: {
      Weight: "100g",
      Origin: "Japan",
      "Brewing Temperature": "80°C",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 3,
    name: "Artisanal Cheese Selection",
    price: 24.99,
    category: "food",
    subCategory: "dairy",
    brand: "Fromage Finest",
    description: "A curated selection of premium artisanal cheeses from around the world.",
    features: ["Assortment of 4 cheeses", "Includes pairing guide", "Perfect for gatherings"],
    specifications: {
      Weight: "500g",
      Types: "Brie, Gouda, Cheddar, Blue Cheese",
      Storage: "Refrigerate",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 4,
    name: "Gourmet Tomato Sauce",
    price: 5.99,
    category: "food",
    subCategory: "canned-goods",
    brand: "Nonna's Kitchen",
    description: "Authentic Italian tomato sauce made from sun-ripened tomatoes and herbs.",
    features: ["No added preservatives", "Versatile for various dishes", "Rich flavor"],
    specifications: {
      Volume: "500ml",
      Ingredients: "Tomatoes, Olive Oil, Basil, Garlic",
      "Shelf Life": "2 years",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 5,
    name: "Premium Baking Chocolate",
    price: 8.99,
    originalPrice: 11.99,
    category: "food",
    subCategory: "baking",
    brand: "Cocoa Creations",
    description: "High-quality dark chocolate perfect for baking and desserts.",
    features: ["70% cocoa content", "Single-origin cocoa", "Easy to melt"],
    specifications: {
      Weight: "200g",
      Form: "Chocolate chips",
      Origin: "Ecuador",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 6,
    name: "Gourmet Mustard Set",
    price: 15.99,
    category: "food",
    subCategory: "condiments",
    brand: "Flavor Fusion",
    description: "A set of three artisanal mustards for the discerning palate.",
    features: ["Includes Dijon, Whole Grain, and Honey Mustard", "No artificial flavors", "Great gift idea"],
    specifications: {
      Volume: "3 x 100ml",
      Ingredients: "Mustard seeds, Vinegar, Spices",
      "Shelf Life": "1 year",
    },
    image: "/placeholder.svg?height=300&width=300",
  },

  // Clothes - WITH COLOR VARIANTS
  {
    id: 7,
    name: "Classic Oxford Shirt",
    price: 49.99,
    originalPrice: 69.99,
    category: "clothes",
    subCategory: "mens-wear",
    brand: "Urban Gentleman",
    description: "A timeless Oxford shirt perfect for both casual and semi-formal occasions.",
    features: ["100% cotton", "Button-down collar", "Available in various colors"],
    specifications: {
      Material: "Cotton",
      Fit: "Regular",
      Care: "Machine washable",
    },
    image: "/white-oxford-shirt.png",
    // When Strapi is integrated, variants will come from API
    variants: [
      { color: "White", colorCode: "#FFFFFF" },
      { color: "Light Blue", colorCode: "#ADD8E6" },
      { color: "Navy", colorCode: "#000080" },
      { color: "Pink", colorCode: "#FFC0CB" },
    ],
  },
  {
    id: 8,
    name: "Floral Summer Dress",
    price: 59.99,
    category: "clothes",
    subCategory: "womens-wear",
    brand: "Bloom Boutique",
    description: "A light and breezy floral dress perfect for summer days.",
    features: ["Floral print", "V-neck", "Midi length"],
    specifications: {
      Material: "Viscose",
      Closure: "Button",
      Care: "Hand wash cold",
    },
    image: "/floral-dress.png",
    // When Strapi is integrated, variants will come from API
    variants: [
      { color: "Blue Floral", colorCode: "#4169E1" },
      { color: "Pink Floral", colorCode: "#FF69B4" },
      { color: "Yellow Floral", colorCode: "#FFD700" },
    ],
  },
  {
    id: 9,
    name: "Dinosaur Print T-Shirt",
    price: 19.99,
    originalPrice: 24.99,
    category: "clothes",
    subCategory: "childrens-wear",
    brand: "Little Explorers",
    description: "A fun and comfortable t-shirt featuring colorful dinosaur prints.",
    features: ["Soft cotton blend", "Crew neck", "Easy to wash"],
    specifications: {
      Material: "60% Cotton, 40% Polyester",
      "Age Range": "4-8 years",
      Care: "Machine washable",
    },
    image: "/dinosaur-tshirt.jpg",
  },
  {
    id: 10,
    name: "Classic Leather Sneakers",
    price: 89.99,
    originalPrice: 119.99,
    category: "clothes",
    subCategory: "shoes",
    brand: "Urban Walker",
    description: "Versatile and stylish leather sneakers suitable for various occasions.",
    features: ["Genuine leather upper", "Cushioned insole", "Durable rubber outsole"],
    specifications: {
      Material: "Leather, Rubber",
      Closure: "Lace-up",
      Care: "Wipe with a damp cloth",
    },
    image: "/white-leather-sneakers.png",
    // When Strapi is integrated, variants will come from API
    variants: [
      { color: "White", colorCode: "#FFFFFF" },
      { color: "Black", colorCode: "#000000" },
      { color: "Navy", colorCode: "#000080" },
      { color: "Tan", colorCode: "#D2B48C" },
    ],
  },
  {
    id: 11,
    name: "Leather Belt",
    price: 34.99,
    category: "clothes",
    subCategory: "accessories",
    brand: "Classic Styles",
    description: "A high-quality leather belt with a classic buckle design.",
    features: ["Genuine leather", "Adjustable", "Suitable for casual and formal wear"],
    specifications: {
      Material: "Full-grain leather",
      Width: "3.5 cm",
      Buckle: "Silver-toned metal",
    },
    image: "/leather-belt.png",
    // When Strapi is integrated, variants will come from API
    variants: [
      { color: "Black", colorCode: "#000000" },
      { color: "Brown", colorCode: "#8B4513" },
      { color: "Tan", colorCode: "#D2B48C" },
    ],
  },
  {
    id: 12,
    name: "Performance Running Shorts",
    price: 29.99,
    originalPrice: 39.99,
    category: "clothes",
    subCategory: "sports-wear",
    brand: "ActiveLife",
    description: "Lightweight and breathable running shorts for optimal performance.",
    features: ["Moisture-wicking fabric", "Built-in brief", "Reflective details"],
    specifications: {
      Material: "88% Polyester, 12% Spandex",
      Inseam: "5 inches",
      Care: "Machine wash cold",
    },
    image: "/athletic-running-shorts.png",
  },

  // Hardware and Home Appliances
  {
    id: 13,
    name: "Smart Refrigerator",
    price: 1299.99,
    originalPrice: 1599.99,
    category: "hardware-and-home-appliances",
    subCategory: "fridges",
    brand: "TechCool",
    description: "A state-of-the-art smart refrigerator with advanced features and ample storage.",
    features: ["Wi-Fi enabled", "Touch screen display", "Energy efficient"],
    specifications: {
      Capacity: "25 cu. ft.",
      Color: "Stainless Steel",
      Dimensions: '36" W x 70" H x 33" D',
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 14,
    name: "Front Load Washing Machine",
    price: 699.99,
    originalPrice: 899.99,
    category: "hardware-and-home-appliances",
    subCategory: "washing-machines",
    brand: "CleanTech",
    description: "An efficient and quiet front-loading washing machine with multiple wash cycles.",
    features: ["Large capacity", "Steam cleaning option", "Quiet operation"],
    specifications: {
      Capacity: "4.5 cu. ft.",
      Cycles: "12",
      "Energy Rating": "Energy Star Certified",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 15,
    name: "Countertop Microwave Oven",
    price: 89.99,
    category: "hardware-and-home-appliances",
    subCategory: "microwaves",
    brand: "QuickHeat",
    description: "A compact and efficient microwave oven perfect for small kitchens.",
    features: ["Multiple power levels", "Defrost function", "Child safety lock"],
    specifications: {
      Capacity: "0.7 cu. ft.",
      Power: "700 watts",
      Dimensions: '17.3" W x 10.2" H x 13.0" D',
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 16,
    name: "Electric Range Stove",
    price: 549.99,
    originalPrice: 699.99,
    category: "hardware-and-home-appliances",
    subCategory: "stoves",
    brand: "CookMaster",
    description: "A versatile electric range stove with a smooth cooktop and spacious oven.",
    features: ["Smooth glass cooktop", "Self-cleaning oven", "Delay bake option"],
    specifications: {
      Cooktop: "4 elements",
      "Oven Capacity": "5.3 cu. ft.",
      Dimensions: '30" W x 47" H x 28" D',
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 17,
    name: "Tankless Water Heater",
    price: 499.99,
    category: "hardware-and-home-appliances",
    subCategory: "water-heaters",
    brand: "EcoWarm",
    description: "An energy-efficient tankless water heater providing endless hot water on demand.",
    features: ["On-demand hot water", "Space-saving design", "Digital temperature control"],
    specifications: {
      "Flow Rate": "6.6 GPM",
      "Energy Factor": "0.93",
      Dimensions: '27.5" H x 18.5" W x 9.8" D',
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 18,
    name: "Portable Air Conditioner",
    price: 349.99,
    originalPrice: 449.99,
    category: "hardware-and-home-appliances",
    subCategory: "air-conditioners",
    brand: "CoolBreeze",
    description: "A versatile portable air conditioner suitable for various room sizes.",
    features: ["Multiple cooling modes", "Remote control", "Easy-to-clean filter"],
    specifications: {
      "Cooling Capacity": "10,000 BTU",
      "Coverage Area": "Up to 300 sq. ft.",
      "Noise Level": "52 dB",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 19,
    name: "Stand Mixer",
    price: 279.99,
    category: "hardware-and-home-appliances",
    subCategory: "small-appliances",
    brand: "KitchenPro",
    description: "A powerful and versatile stand mixer for all your baking needs.",
    features: ["10-speed settings", "Tilt-head design", "Includes 3 attachments"],
    specifications: {
      Capacity: "5 quarts",
      Power: "325 watts",
      Color: "Metallic Chrome",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 20,
    name: "Cordless Drill Set",
    price: 129.99,
    originalPrice: 179.99,
    category: "hardware-and-home-appliances",
    subCategory: "tools",
    brand: "PowerCraft",
    description: "A versatile cordless drill set with multiple accessories for various DIY projects.",
    features: ["20V lithium-ion battery", "2-speed gearbox", "LED work light"],
    specifications: {
      "Chuck Size": "1/2 inch",
      "Torque Settings": "21",
      Includes: "Carrying case, charger, and 30-piece accessory kit",
    },
    image: "/placeholder.svg?height=300&width=300",
  },

  // Books
  {
    id: 21,
    name: "The Midnight Library",
    price: 14.99,
    category: "books",
    subCategory: "fiction",
    brand: "Penguin Books",
    description: "A novel about life, choices, and regret by bestselling author Matt Haig.",
    features: ["New York Times Bestseller", "Thought-provoking storyline", "Explores themes of purpose and happiness"],
    specifications: {
      Format: "Hardcover",
      Pages: "288",
      Language: "English",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 22,
    name: "Atomic Habits",
    price: 11.99,
    originalPrice: 16.99,
    category: "books",
    subCategory: "non-fiction",
    brand: "Penguin Random House",
    description: "A guide to building good habits and breaking bad ones by James Clear.",
    features: ["Practical strategies", "Based on scientific research", "Includes real-life examples"],
    specifications: {
      Format: "Paperback",
      Pages: "320",
      Language: "English",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 23,
    name: "Introduction to Algebra",
    price: 39.99,
    category: "books",
    subCategory: "educational",
    brand: "Academic Press",
    description: "A comprehensive textbook covering fundamental concepts of algebra.",
    features: ["Clear explanations", "Numerous practice problems", "Suitable for high school and college students"],
    specifications: {
      Format: "Hardcover",
      Pages: "624",
      Edition: "8th",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 24,
    name: "The Very Hungry Caterpillar",
    price: 8.99,
    category: "books",
    subCategory: "childrens-books",
    brand: "Puffin Books",
    description: "A beloved children's picture book by Eric Carle about a caterpillar's week-long journey of eating.",
    features: [
      "Colorful illustrations",
      "Interactive die-cut pages",
      "Educational content about days of the week and foods",
    ],
    specifications: {
      Format: "Board book",
      Pages: "26",
      "Age Range": "2-5 years",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 25,
    name: "Batman: The Killing Joke",
    price: 17.99,
    originalPrice: 22.99,
    category: "books",
    subCategory: "comics",
    brand: "DC Comics",
    description:
      "A critically acclaimed graphic novel exploring the complex relationship between Batman and the Joker.",
    features: ["Written by Alan Moore", "Illustrated by Brian Bolland", "Deluxe hardcover edition"],
    specifications: {
      Format: "Hardcover",
      Pages: "64",
      Publisher: "DC Comics",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 26,
    name: "National Geographic Magazine Subscription",
    price: 39.99,
    category: "books",
    subCategory: "magazines",
    brand: "National Geographic",
    description:
      "A yearly subscription to the renowned National Geographic magazine, featuring stunning photography and in-depth articles.",
    features: ["12 monthly issues", "Digital access included", "Wide range of topics covered"],
    specifications: {
      Format: "Print and Digital",
      Frequency: "Monthly",
      Language: "English",
    },
    image: "/placeholder.svg?height=300&width=300",
  },

  // Office Supplies
  {
    id: 27,
    name: "Ergonomic Ballpoint Pen Set",
    price: 12.99,
    category: "office-supplies",
    subCategory: "writing",
    brand: "ScribeEase",
    description: "A set of comfortable, smooth-writing ballpoint pens designed for extended use.",
    features: ["Ergonomic grip", "Quick-drying ink", "Available in black, blue, and red"],
    specifications: {
      Quantity: "Pack of 6",
      "Ink Color": "2 each of black, blue, and red",
      "Tip Size": "1.0mm",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 28,
    name: "Premium Printer Paper",
    price: 9.99,
    originalPrice: 12.99,
    category: "office-supplies",
    subCategory: "paper",
    brand: "WhiteSheet",
    description: "High-quality, multipurpose printer paper suitable for various printing needs.",
    features: ["Bright white", "Jam-free", "Acid-free for archival quality"],
    specifications: {
      Size: '8.5" x 11"',
      Weight: "20 lb",
      "Sheets per Ream": "500",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 29,
    name: "Expanding File Organizer",
    price: 15.99,
    category: "office-supplies",
    subCategory: "filing",
    brand: "OrganizerPro",
    description: "A versatile expanding file organizer with multiple pockets for efficient document management.",
    features: ["13 expandable pockets", "Elastic cord closure", "Durable polypropylene material"],
    specifications: {
      Size: '13" x 9.5"',
      "Expandable to": "7 inches",
      Color: "Assorted colors",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 30,
    name: "Desk Organizer Set",
    price: 24.99,
    originalPrice: 34.99,
    category: "office-supplies",
    subCategory: "desk-accessories",
    brand: "NeatDesk",
    description: "A comprehensive desk organizer set to keep your workspace tidy and efficient.",
    features: ["Multiple compartments", "Pen holder", "Letter tray"],
    specifications: {
      Material: "Mesh metal",
      Color: "Black",
      Pieces: "5-piece set",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 31,
    name: "Wireless Laser Printer",
    price: 199.99,
    category: "office-supplies",
    subCategory: "printing",
    brand: "PrintMaster",
    description: "A fast and efficient wireless laser printer for home or small office use.",
    features: ["Wireless connectivity", "Duplex printing", "High-yield toner option"],
    specifications: {
      "Print Speed": "Up to 30 ppm",
      Resolution: "Up to 2400 x 600 dpi",
      "Paper Capacity": "250 sheets",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 32,
    name: "File Cabinet",
    price: 89.99,
    originalPrice: 119.99,
    category: "office-supplies",
    subCategory: "storage",
    brand: "StorageMaster",
    description: "A sturdy and spacious file cabinet for organizing and storing important documents.",
    features: ["2 drawers", "Lock for security", "Smooth drawer operation"],
    specifications: {
      Material: "Steel",
      Dimensions: '15" W x 22" D x 28" H',
      Color: "Light Gray",
    },
    image: "/placeholder.svg?height=300&width=300",
  },
]

export function getAllProducts(): Promise<Product[]> {
  return Promise.resolve(products)
}

export function getProductById(id: number): Promise<Product | undefined> {
  return Promise.resolve(products.find((p) => p.id === id))
}

export function searchProducts(query: string): Promise<Product[]> {
  const lowercaseQuery = query.toLowerCase()
  return Promise.resolve(
    products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery) ||
        product.subCategory.toLowerCase().includes(lowercaseQuery) ||
        product.brand.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery),
    ),
  )
}

export function getProductsByCategory(category: string, subCategory?: string): Promise<Product[]> {
  return Promise.resolve(
    products.filter(
      (product) => product.category === category && (!subCategory || product.subCategory === subCategory),
    ),
  )
}
