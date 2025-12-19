import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600">Last updated: December 2024</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            We collect information you provide directly to us, such as when you create an account, make a purchase, or
            contact us for support.
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Personal information (name, email address, phone number)</li>
            <li>Payment information (credit card details, billing address)</li>
            <li>Shipping information (delivery address)</li>
            <li>Account preferences and settings</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">We use the information we collect to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your purchases</li>
            <li>Provide customer support</li>
            <li>Send you promotional offers (with your consent)</li>
            <li>Improve our services and user experience</li>
            <li>Comply with legal obligations</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Information Sharing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            We do not sell, trade, or otherwise transfer your personal information to third parties without your
            consent, except as described in this policy.
          </p>
          <p className="text-gray-600">We may share your information with:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Service providers who assist in our operations</li>
            <li>Payment processors for transaction processing</li>
            <li>Shipping companies for order delivery</li>
            <li>Legal authorities when required by law</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Security</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            We implement appropriate security measures to protect your personal information against unauthorized access,
            alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">You have the right to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and personal data</li>
            <li>Opt-out of marketing communications</li>
            <li>Request data portability</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            If you have any questions about this Privacy Policy, please contact us at privacy@omnio.com or call us at +1
            (555) 123-4567.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
