"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import StudentHeader from "@/components/student-header"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"

type Idea = {
  _id: string
  title: string
  description: string
  status: "pending" | "approved" | "rejected"
  feedback?: string
  submittedAt: string
}

export default function StudentDashboard() {
  const [formData, setFormData] = useState({
    areasOfInterest: "",
    domainInterest: "",
    languagesKnown: "",
    additionalInfo: "",
  })

  const [generatedIdea, setGeneratedIdea] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedIdeas, setSubmittedIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    // Fetch submitted ideas
    const fetchIdeas = async () => {
  try {
    const response = await fetch("/api/student/ideas")

    if (response.status === 401) {
      // Unauthorized, redirect to login
      router.push("/student/login")
      return
    }

    const data = await response.json()

    if (response.ok) {
      setSubmittedIdeas(data.ideas)
    } else {
      toast.error(data.error || "Failed to fetch ideas")
    }
  } catch (error) {
    toast.error("Failed to fetch ideas")
  } finally {
    setIsLoading(false)
  }
}

    fetchIdeas()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenerateIdea = async () => {
  setIsGenerating(true)
  try {
    const response = await fetch("/api/student/generate-idea", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (response.status === 401) {
      // Unauthorized, redirect to login
      router.push("/student/login")
      return
    }

    const data = await response.json()

    if (response.ok) {
      setGeneratedIdea(data.idea)
      toast.success("Your project idea has been generated successfully.")
    } else {
      toast.error(data.error || "Failed to generate idea")
    }
  } catch (error) {
    toast.error("Failed to generate idea")
  } finally {
    setIsGenerating(false)
  }
}

  const handleSubmitIdea = async () => {
  if (!generatedIdea) return

  setIsSubmitting(true)

  try {
    // Extract title and description from the markdown
    const lines = generatedIdea.split("\n")
    let title = lines[0].replace(/^#\s+/, "")

    // If no title found, use the first line
    if (!title || title === lines[0]) {
      title = lines[0].substring(0, 100)
    }

    const description = generatedIdea.substring(generatedIdea.indexOf("\n") + 1)

    // Prepare the data
    const submissionData = {
      title,
      description,
      areasOfInterest: formData.areasOfInterest,
      domainInterest: formData.domainInterest,
      languagesKnown: formData.languagesKnown,
      additionalInfo: formData.additionalInfo,
    }

    console.log("Submitting idea:", submissionData)

    const response = await fetch("/api/student/submit-idea", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submissionData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to submit idea")
    }

    toast.success("Your project idea has been submitted for review.")

    // Add the new idea to the list
    setSubmittedIdeas((prev) => [data.idea, ...prev])

    // Clear the generated idea and form
    setGeneratedIdea("")
    setFormData({
      areasOfInterest: "",
      domainInterest: "",
      languagesKnown: "",
      additionalInfo: "",
    })
  } catch (error: any) {
    console.error("Error submitting idea:", error)
    toast.error(error.message || "Failed to submit idea")
  } finally {
    setIsSubmitting(false)
  }
}

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

        <Tabs defaultValue="generate">
          <TabsList className="mb-6">
            <TabsTrigger value="generate">Generate Ideas</TabsTrigger>
            <TabsTrigger value="submitted">My Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Project Idea</CardTitle>
                  <CardDescription>
                    Fill in your interests and expertise to generate a unique project idea
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="areasOfInterest">Areas of Interest</Label>
                    <Input
                      id="areasOfInterest"
                      name="areasOfInterest"
                      placeholder="e.g., AI, Web Development, Mobile Apps"
                      value={formData.areasOfInterest}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domainInterest">Domain Interest</Label>
                    <Select
                      onValueChange={(value) => handleSelectChange("domainInterest", value)}
                      value={formData.domainInterest}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="ecommerce">E-Commerce</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="productivity">Productivity</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="languagesKnown">Programming Languages</Label>
                    <Input
                      id="languagesKnown"
                      name="languagesKnown"
                      placeholder="e.g., JavaScript, Python, Java"
                      value={formData.languagesKnown}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      placeholder="Any specific requirements or constraints"
                      value={formData.additionalInfo}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleGenerateIdea} disabled={isGenerating} className="w-full">
                    {isGenerating ? "Generating..." : "Generate Idea"}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generated Idea</CardTitle>
                  <CardDescription>Review your generated project idea and submit for approval</CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedIdea ? (
                    <div className="p-4 bg-gray-50 rounded-md min-h-[200px] prose prose-sm max-w-none">
                      <ReactMarkdown>{generatedIdea}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-md min-h-[200px] flex items-center justify-center text-gray-400">
                      Generated idea will appear here
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSubmitIdea} disabled={!generatedIdea || isSubmitting} className="w-full">
                    {isSubmitting ? "Submitting..." : "Submit for Review"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="submitted">
            <Card>
              <CardHeader>
                <CardTitle>My Submitted Ideas</CardTitle>
                <CardDescription>Track the status of your submitted project ideas</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : submittedIdeas.length > 0 ? (
                  <div className="space-y-4">
                    {submittedIdeas.map((idea) => (
                      <div key={idea._id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{idea.title}</h3>
                          <Badge
                            variant={
                              idea.status === "approved"
                                ? "default"
                                : idea.status === "rejected"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{idea.description}</p>
                        <div className="text-xs text-gray-500">
                          Submitted: {new Date(idea.submittedAt).toLocaleDateString()}
                        </div>
                        {idea.feedback && (
                          <div className="mt-2 text-sm">
                            <p className="font-medium">Feedback:</p>
                            <p className="text-gray-600">{idea.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">You haven't submitted any ideas yet</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
