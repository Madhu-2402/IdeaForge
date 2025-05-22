import Link from "next/link"
import { Button } from "@/components/ui/button"
import "./globals.css"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">AI-Powered Project Idea Generator</h1>
        <p className="text-xl text-muted-foreground">
          Generate unique project ideas based on your interests and expertise
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Student Portal</CardTitle>
            <CardDescription>Generate and submit project ideas based on your interests</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Log in to generate unique project ideas tailored to your interests, domain expertise, and programming
              languages. Submit your ideas for staff review and feedback.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href="/student/login" className="w-full">
              <Button className="w-full" variant="black">Student Login</Button>
            </Link>
            <Link href="/student/register" className="w-full">
              <Button className="w-full" variant="blackOutline">
                Student Register
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Portal</CardTitle>
            <CardDescription>Review and manage student project ideas</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Log in to review submitted project ideas, provide feedback, manage the database, and ensure the uniqueness
              and quality of student projects.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href="/staff/login" className="w-full">
              <Button className="w-full" variant="black">
                Staff Login
              </Button>
            </Link>
            <Link href="/staff/register" className="w-full">
              <Button className="w-full" variant="blackOutline">
                Staff Register
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}