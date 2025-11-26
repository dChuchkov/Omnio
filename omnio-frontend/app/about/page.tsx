import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          About{" "}
          <span className="text-blue-600">
            omn<span className="text-orange-500">io</span>
          </span>
        </h1>
        <p className="text-xl text-gray-600">Your ultimate shopping destination for everything you need</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              At Omnio, we believe shopping should be simple, enjoyable, and accessible to everyone. Our mission is to
              provide a comprehensive marketplace where customers can find everything they need in one convenient
              location.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              We envision a world where online shopping is seamless, secure, and satisfying. By connecting customers
              with quality products from trusted sellers, we're building the future of e-commerce.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Our Story</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Founded in 2024, Omnio started with a simple idea: create an online marketplace that truly serves its
            customers. We noticed that shopping online often meant visiting multiple websites, comparing prices across
            different platforms, and dealing with inconsistent service quality.
          </p>
          <p className="text-gray-600">
            Our team of passionate entrepreneurs and technology experts came together to build something better. Today,
            Omnio offers thousands of products across multiple categories, all backed by our commitment to quality,
            affordability, and exceptional customer service.
          </p>
          <p className="text-gray-600">
            From electronics and fashion to home goods and books, we've carefully curated our selection to ensure every
            product meets our high standards. We work directly with manufacturers and trusted suppliers to bring you the
            best prices without compromising on quality.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
          <div className="text-gray-600">Products Available</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">50,000+</div>
          <div className="text-gray-600">Happy Customers</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
          <div className="text-gray-600">Uptime Guarantee</div>
        </div>
      </div>
    </div>
  )
}
