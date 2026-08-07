import mongoose, { Document, Schema } from "mongoose";

export interface IResume extends Document {
  userId: string;
  extractedText: string;
  score: number;
  summary: string;
  name: string;
  email: string;
  phone: string;
  education: any[];
  skills: string[];
  projects: any[];
  experience: any[];
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  suggestedRole: string;
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    extractedText: { type: String, required: true },
    score: { type: Number, default: 0 },
    summary: { type: String, default: "" },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    education: { type: [], default: [] },
    skills: { type: [String], default: [] },
    projects: { type: [], default: [] },
    experience: { type: [], default: [] },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    suggestedRole: { type: String, default: "" },
    recommendations: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Resume = mongoose.model<IResume>("Resume", resumeSchema);

export default Resume;
