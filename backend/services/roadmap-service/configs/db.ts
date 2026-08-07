import mongoose from "mongoose";

export const connectDb = async (): Promise<void> => {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
      throw new Error("MONGODB_URL is not defined");
    }
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB (Roadmap Service)");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};
