import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600">Last updated: December 2024</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            By accessing and using Omnio's website and services, you accept and agree to be bound by the terms and
            provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Use License</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Permission is granted to temporarily download one copy of the materials on Omnio's website for personal,
            non-commercial transitory viewing only.
          </p>
          <p className="text-gray-600">Under this license you may not:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained on the website</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            We strive to provide accurate product information, including descriptions, prices, and availability.
            However, we do not warrant that product descriptions or other content is accurate, complete, reliable,
            current, or error-free.
          </p>
          <p className="text-gray-600">
            Prices for our products are subject to change without notice. We reserve the right to modify or discontinue
            any product at any time without notice.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders and Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            By placing an order, you represent that you are at least 18 years old and have the legal capacity to enter
            into this agreement.
          </p>
          <p className="text-gray-600">
            We reserve the right to refuse or cancel any order for any reason, including but not limited to product
            availability, errors in product or pricing information, or suspected fraudulent activity.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping and Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            We will make every effort to deliver products within the estimated timeframe. However, delivery dates are
            estimates and we are not liable for delays caused by shipping carriers or other circumstances beyond our
            control.
          </p>
          <p className="text-gray-600">
            Risk of loss and title for products pass to you upon delivery to the shipping carrier.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Returns and Refunds</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Our return policy allows returns within 30 days of purchase for most items in original condition. Certain
            items may have different return policies as specified on the product page. Refunds will be processed to the
            original payment method within 3-5 business days of receiving the returned item.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            In no event shall Omnio or its suppliers be liable for any damages (including, without limitation, damages
            for loss of data or profit, or due to business interruption) arising out of the use or inability to use the
            materials on Omnio's website, even if Omnio or an authorized representative has been notified orally or in
            writing of the possibility of such damage.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            If you have any questions about these Terms of Service, please contact us at legal@omnio.com or call us at
            +1 (555) 123-4567.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
