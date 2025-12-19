"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
  {
    category: "Orders & Shipping",
    questions: [
      {
        question: "How long does shipping take?",
        answer:
          "Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days. Free shipping is available on orders over $50.",
      },
      {
        question: "Can I track my order?",
        answer:
          "Yes! Once your order ships, you'll receive a tracking number via email. You can also track your order in your account dashboard.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Currently, we only ship within the United States. We're working on expanding to international shipping soon.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    questions: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 30-day return policy for most items. Items must be in original condition with tags attached. Some restrictions apply to electronics and personal care items.",
      },
      {
        question: "How do I return an item?",
        answer:
          "Log into your account, go to 'My Orders', and select 'Return Item'. We'll provide a prepaid return label for your convenience.",
      },
      {
        question: "When will I receive my refund?",
        answer:
          "Refunds are processed within 3-5 business days after we receive your returned item. The refund will appear on your original payment method.",
      },
    ],
  },
  {
    category: "Account & Payment",
    questions: [
      {
        question: "Do I need an account to make a purchase?",
        answer:
          "While you can checkout as a guest, creating an account allows you to track orders, save addresses, and access exclusive deals.",
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay.",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Yes, we use industry-standard SSL encryption to protect your payment information. We never store your credit card details on our servers.",
      },
    ],
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-600">Find answers to common questions about shopping with Omnio</p>
      </div>

      {faqs.map((category, categoryIndex) => (
        <div key={categoryIndex} className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">{category.category}</h2>
          {category.questions.map((faq, questionIndex) => {
            const itemId = `${categoryIndex}-${questionIndex}`
            const isOpen = openItems.includes(itemId)

            return (
              <Card key={questionIndex} className="cursor-pointer" onClick={() => toggleItem(itemId)}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between items-center text-lg">
                    {faq.question}
                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </CardTitle>
                </CardHeader>
                {isOpen && (
                  <CardContent className="pt-0">
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      ))}

      <Card className="bg-blue-50">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-4">Our customer support team is here to help!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@omnio.com" className="text-blue-600 hover:underline">
              Email: support@omnio.com
            </a>
            <a href="tel:+15551234567" className="text-blue-600 hover:underline">
              Phone: +1 (555) 123-4567
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
