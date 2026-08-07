import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";

dotenv.config();

const llm = new ChatGroq({
  model: "llama-3.1-8b-instant",
  temperature: 0,
});

export default llm;
