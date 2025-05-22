import mongoose, { Schema, type Document } from "mongoose"

export interface IFeedback extends Document {
  ideaId: mongoose.Types.ObjectId
  staffId: mongoose.Types.ObjectId
  content: string
  createdAt: Date
}

const FeedbackSchema: Schema = new Schema({
  ideaId: { type: Schema.Types.ObjectId, ref: "ProjectIdea", required: true },
  staffId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema)
