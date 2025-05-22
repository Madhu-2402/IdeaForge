// This file defines the MongoDB schema for our application
// In a real implementation, you would use this with Mongoose or another ODM

/*
User Schema:
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  role: String (student/staff),
  department: String,
  createdAt: Date,
  updatedAt: Date
}

Project Idea Schema:
{
  _id: ObjectId,
  title: String,
  description: String,
  studentId: ObjectId (ref: User),
  areasOfInterest: [String],
  domainInterest: String,
  languagesKnown: [String],
  additionalInfo: String,
  status: String (pending/approved/rejected),
  feedback: String,
  isUnique: Boolean,
  uniquenessScore: Number,
  submittedAt: Date,
  reviewedAt: Date,
  reviewedBy: ObjectId (ref: User)
}

Feedback Schema:
{
  _id: ObjectId,
  ideaId: ObjectId (ref: ProjectIdea),
  staffId: ObjectId (ref: User),
  content: String,
  createdAt: Date
}
*/

export type User = {
  _id: string
  email: string
  password: string // hashed
  name: string
  role: "student" | "staff"
  department?: string
  createdAt: Date
  updatedAt: Date
}

export type ProjectIdea = {
  _id: string
  title: string
  description: string
  studentId: string
  areasOfInterest: string[]
  domainInterest: string
  languagesKnown: string[]
  additionalInfo?: string
  status: "pending" | "approved" | "rejected"
  feedback?: string
  isUnique: boolean
  uniquenessScore?: number
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
}

export type Feedback = {
  _id: string
  ideaId: string
  staffId: string
  content: string
  createdAt: Date
}
