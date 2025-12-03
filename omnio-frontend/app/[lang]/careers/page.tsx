import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Users, Heart, Zap, Target } from "lucide-react"

const jobOpenings = [
  {
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "New York, NY / Remote",
    type: "Full-time",
    description: "Join our engineering team to build the next generation of e-commerce experiences.",
  },
  {
    title: "Product Manager",
    department: "Product",
    location: "New York, NY",
    type: "Full-time",
    description: "Lead product strategy and development for our core marketplace platform.",
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Remote",
    type: "Full-time",
    description: "Help our customers succeed and grow their businesses on our platform.",
  },
  {
    title: "Marketing Specialist",
    department: "Marketing",
    location: "New York, NY / Remote",
    type: "Full-time",
    description: "Drive growth through creative marketing campaigns and customer acquisition strategies.",
  },
  {
    title: "Data Analyst",
    department: "Analytics",
    location: "New York, NY",
    type: "Full-time",
    description: "Turn data into insights that drive business decisions and improve customer experience.",
  },
]

const benefits = [
  {
    icon: Heart,
    title: "Health & Wellness",
    description: "Comprehensive health insurance, dental, vision, and wellness programs",
  },
  {
    icon: Zap,
    title: "Professional Growth",
    description: "Learning budget, conference attendance, and career development opportunities",
  },
  {
    icon: Users,
    title: "Work-Life Balance",
    description: "Flexible hours, remote work options, and generous PTO policy",
  },
  {
    icon: Target,
    title: "Competitive Package",
    description: "Competitive salary, equity options, and performance bonuses",
  },
]

export default function CareersPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Help us build the future of e-commerce. We're looking for passionate, talented individuals who want to make a
          difference.
        </p>
      </div>

      {/* Company Culture */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              At Omnio, we're building more than just an e-commerce platform. We're creating a marketplace that empowers
              businesses and delights customers. Our team is passionate about innovation, customer success, and making
              online shopping better for everyone.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>
                • <strong>Customer First:</strong> Everything we do starts with our customers
              </li>
              <li>
                • <strong>Innovation:</strong> We embrace new ideas and technologies
              </li>
              <li>
                • <strong>Integrity:</strong> We do the right thing, always
              </li>
              <li>
                • <strong>Collaboration:</strong> We achieve more together
              </li>
              <li>
                • <strong>Excellence:</strong> We strive for quality in everything we do
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Benefits */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">Why Work at Omnio?</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <benefit.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Job Openings */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">Open Positions</h2>
        <div className="space-y-4">
          {jobOpenings.map((job, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-3">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {job.department}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {job.type}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <Button>Apply Now</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Application Process */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Our Hiring Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <h4 className="font-semibold mb-2">Application</h4>
              <p className="text-sm text-gray-600">Submit your application and resume</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h4 className="font-semibold mb-2">Phone Screen</h4>
              <p className="text-sm text-gray-600">Initial conversation with our team</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <h4 className="font-semibold mb-2">Interview</h4>
              <p className="text-sm text-gray-600">Meet with the hiring manager and team</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                4
              </div>
              <h4 className="font-semibold mb-2">Offer</h4>
              <p className="text-sm text-gray-600">Welcome to the Omnio team!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="bg-blue-50">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-semibold mb-4">Don't see the right role?</h3>
          <p className="text-gray-600 mb-6">
            We're always looking for talented people. Send us your resume and tell us how you'd like to contribute to
            Omnio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <a href="mailto:careers@omnio.com">Email Us</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/contact">Contact Us</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
