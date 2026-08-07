import mongoose, { Document, Schema } from "mongoose";

export interface IModule {
  title: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  youtube: string;
  article: string;
}

export type RoadmapLevel = "Beginner" | "Intermediate" | "Advanced";

export interface IRoadmap extends Document {
  userId: string;
  title: string;
  targetPackage: string;
  duration: string;
  level: RoadmapLevel;
  modules: IModule[];
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new Schema<IModule>(
  {
    title: { type: String, required: true },
    duration: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    description: { type: String, required: true },
    youtube: { type: String, default: "" },
    article: { type: String, default: "" },
  },
  { _id: false }
);

const roadmapSchema = new Schema<IRoadmap>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    targetPackage: { type: String, required: true },
    duration: { type: String, required: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    modules: {
      type: [moduleSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Roadmap = mongoose.model<IRoadmap>("Roadmap", roadmapSchema);

export default Roadmap;
