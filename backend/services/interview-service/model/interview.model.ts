import mongoose, { Document, Schema } from "mongoose";

export interface IFeedback {
  score: number;
  correctness: number;
  clarity: number;
  relevance: number;
  detail: number;
  efficiency: number;
  communication: number;
  problemSolving: number;
  creativity: number;
  feedback: string;
  improvements: any[];
}

export interface IQuestion {
  question: string;
  userAnswer: string;
  difficulty: "easy" | "medium" | "hard";
  timer: number;
  feedback: IFeedback;
}

export type InterviewType = "hr" | "technical";
export type InterviewStatus = "in-progress" | "completed";

export interface IInterview extends Document {
  userId: string;
  type: InterviewType;
  role: string;
  useResume: boolean;
  currentQuestion: number;
  questions: IQuestion[];
  overallScore: number;
  strengths: any[];
  weaknesses: any[];
  recommendations: any[];
  summary: string;
  status: InterviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    score: { type: Number, default: 0 },
    correctness: { type: Number, default: 0 },
    clarity: { type: Number, default: 0 },
    relevance: { type: Number, default: 0 },
    detail: { type: Number, default: 0 },
    efficiency: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    creativity: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
    improvements: { type: [], default: [] },
  },
  { _id: false }
);

const questionSchema = new Schema<IQuestion>(
  {
    question: { type: String, required: true },
    userAnswer: { type: String, default: "" },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    timer: { type: Number, default: 60 },
    feedback: {
      type: feedbackSchema,
      default: () => ({}),
    },
  },
  { _id: false }
);

const interviewSchema = new Schema<IInterview>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["hr", "technical"],
      required: true,
    },
    role: { type: String, required: true },
    useResume: { type: Boolean, default: false },
    currentQuestion: { type: Number, default: 0 },
    questions: {
      type: [questionSchema],
      default: [],
    },
    overallScore: { type: Number, default: 0 },
    strengths: { type: [], default: [] },
    weaknesses: { type: [], default: [] },
    recommendations: { type: [], default: [] },
    summary: { type: String, default: "" },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model<IInterview>("Interview", interviewSchema);

export default Interview;
