import mongoose, { Schema, type Document } from "mongoose"

export interface IProjectIdea extends Document {
  title: string
  description: string
  studentId: mongoose.Types.ObjectId
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
  reviewedBy?: mongoose.Types.ObjectId
}

const ProjectIdeaSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  areasOfInterest: { type: [String], required: true },
  domainInterest: { type: String, required: true },
  languagesKnown: { type: [String], required: true },
  additionalInfo: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    required: true,
  },
  feedback: { type: String },
  isUnique: { type: Boolean, default: true },
  uniquenessScore: { type: Number },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
})

export default mongoose.models.ProjectIdea || mongoose.model<IProjectIdea>("ProjectIdea", ProjectIdeaSchema)
