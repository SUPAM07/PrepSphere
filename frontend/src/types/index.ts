export interface Resume {
  _id: string;
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
  role?: string;
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
}
