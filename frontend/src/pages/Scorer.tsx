import { useState } from "react";

import { useDispatch } from "react-redux";
import { useAppSelector } from "../redux/hooks";
import { useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiAlertCircle, FiTrendingUp, FiUser, FiZap,
  FiHexagon, FiClock, FiFileText, FiLock, FiArrowUp
} from "react-icons/fi";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

import { getCurrentUser } from "../api/user.api";
import { setResume } from "../redux/resumeSlice";

import api from "../utils/axios";

// ─── Score Ring ──────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#2563eb" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center">
      <RadialBarChart
        width={110}
        height={110}
        cx={55}
        cy={55}
        innerRadius={40}
        outerRadius={53}
        startAngle={90}
        endAngle={-270}
        data={[{ value: score, fill: color }]}
        barSize={8}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar background={{ fill: "#e5e7eb" }} dataKey="value" cornerRadius={8} />
      </RadialBarChart>

      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold text-white leading-none">{score}</span>
        <span className="text-[9px] text-gray-200 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ─── Tag ─────────────────────────────────────────────────────
function Tag({ text, color }: { text: string; color: "purple" | "red" | "green" | "yellow" }) {
  const styles = {
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    red:    "bg-red-50    text-red-700    border-red-200",
    green:  "bg-green-50  text-green-700  border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };
  return (
    <span className={`text-[10px] px-1.5 py-1 rounded-md border font-medium ${styles[color]}`}>
      {text}
    </span>
  );
}

// ─── Navbar ───────────────────────────────────────────────────
function Navbar({ label }: { label: string }) {
  const navigate = useNavigate();
  return (
    <nav className="fixed inset-x-0 top-0 z-20 border-b border-black/8 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div
          onClick={() => navigate("/dashboard")}
          className="flex cursor-pointer items-center gap-2"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
            <FiHexagon size={16} fill="currentColor" className="text-white" />
          </div>
          <span className="text-base sm:text-lg font-extrabold text-[#0A0A0A]">
            PrepSphere
          </span>
          <span className="hidden sm:block ml-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-indigo-600">
            {label}
          </span>
        </div>
        <button
          className="flex items-center gap-1.5 text-xs font-semibold text-black/60 hover:text-[#0A0A0A] px-4 py-2 rounded-full border border-black/10 hover:border-black/20 bg-white shadow-sm transition-all"
        >
          <FiClock size={12} />
          <span className="hidden sm:inline">History</span>
        </button>
      </div>
    </nav>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function Scorer({setUser}: any) {
  const [file, setFile]       = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch  = useDispatch();
  const { resume } = useAppSelector((s: any) => s.resume);


  const uploadResume = async () => {
    if (!file) return alert("Please select a PDF");
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", file);
      const response = await api.post(
        "/api/resume/upload",
        formData,
      );
      dispatch(setResume(response.data.data));

      // Fetch updated user stats since coins were deducted by the backend
      const meRes = await getCurrentUser();
      if (meRes?.user) {
        setUser(meRes.user);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Upload Failed");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Results ─────────────────────────────────────────
  if (resume) return (
    <div className="min-h-screen bg-white text-[#0A0A0A]">
      <Navbar label="Resume Scorer" />

      <div className="max-w-6xl mx-auto px-3 pt-18 sm:pt-20 pb-8 space-y-3.5">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] text-black/40 tracking-widest uppercase mb-0.5">
              Resume Analysis
            </p>
            <h1 className="text-lg font-bold">{resume.name}</h1>
          </div>
          <button
            onClick={() => dispatch(setResume(null))}
            className="text-[10px] sm:text-xs text-black/50 hover:text-[#0A0A0A] border border-black/15 hover:border-black/35 px-2.5 py-1 rounded-lg transition-colors"
          >
            Re-upload
          </button>
        </div>

        {/* Score Card */}
        <div className="relative overflow-hidden bg-[#000000]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-4 sm:flex-row shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
          <div className="relative">
            <ScoreRing score={resume.score}/>
          </div>
          <div className="relative">
            <p className="text-white/50 text-xs mb-0.5">Resume Score</p>
            <p className="text-lg sm:text-xl font-bold mb-1.5 text-white">
              {resume.score >= 75 ? "Strong" : resume.score >= 50 ? "Average" : "Needs Work"}
            </p>
            <div className="flex items-center gap-1.5">
              <FiUser className="text-blue-400 text-xs" />
              <span className="text-xs text-blue-300">{resume.suggestedRole}</span>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-1.5 mb-2.5">
              <FiCheckCircle className="text-green-400" size={14} />
              <p className="text-xs font-semibold text-white">Strengths</p>
            </div>
            <div className="relative flex flex-wrap gap-1.5">
              {resume.strengths?.map((s: string) => <Tag key={s} text={s} color="green" />)}
            </div>
          </div>

          <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-1.5 mb-2.5">
              <FiAlertCircle className="text-yellow-400" size={14} />
              <p className="text-xs font-semibold text-white">Weaknesses</p>
            </div>
            <div className="relative flex flex-wrap gap-1.5">
              {resume.weaknesses?.map((w: string) => <Tag key={w} text={w} color="yellow" />)}
            </div>
          </div>
        </div>

        {/* Missing Skills */}
        <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-1.5 mb-2.5">
            <FiZap className="text-red-400" size={14} />
            <p className="text-xs font-semibold text-white">Missing Skills</p>
          </div>
          <div className="relative flex flex-wrap gap-1.5 overflow-hidden">
            {resume.missingSkills?.map((s: string) => <Tag key={s} text={s} color="red" />)}
          </div>
        </div>

        {/* Recommendations */}
        <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-1.5 mb-2.5">
            <FiTrendingUp className="text-blue-400" size={14} />
            <p className="text-xs font-semibold text-white">Recommendations</p>
          </div>
          <ul className="relative space-y-2">
            {resume.recommendations?.map((r: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/60">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-white/10 border border-white/15 text-white/80 text-[10px] flex items-center justify-center shrink-0 font-semibold">
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );

  // ── Step 1: Upload ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-grid-glow text-[#0A0A0A]">
      <Navbar label="Resume Scorer" />

      <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-10">
        <div className="relative w-full max-w-[500px] rounded-[32px] overflow-hidden bg-zinc-900 border border-zinc-800 p-6 sm:p-8 shadow-2xl shadow-blue-900/10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />

          {/* Progress */}
          <p className="relative text-[10px] text-white/40 tracking-widest uppercase font-semibold mb-2">
            Step 1 of 2
          </p>
          <div className="relative w-full h-1.5 bg-white/10 rounded-full mb-6">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-1/2 shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
          </div>

          <h1 className="relative text-2xl font-bold mb-2 text-white tracking-tight">Upload Your Resume ✨</h1>
          <p className="relative text-white/50 text-xs sm:text-sm mb-8 leading-relaxed">
            We'll analyze your resume and provide actionable feedback to help you stand out.
          </p>

          {/* Drop Zone */}
          <label
            className={`relative flex flex-col items-center justify-center w-full min-h-[260px] rounded-[24px] border border-dashed cursor-pointer transition-all p-6
              ${file
                ? "border-blue-500/50 bg-blue-500/[0.03]"
                : "border-white/20 bg-white/[0.02] hover:border-indigo-400/60 hover:bg-white/[0.04]"
              }`}
          >
            {/* Custom Illustration */}
            <div className="relative w-24 h-24 flex items-center justify-center mb-5">
              {/* Stars behind */}
              <div className="absolute top-0 right-2 w-1.5 h-1.5 bg-white/20 rounded-full"></div>
              <div className="absolute top-4 left-0 w-2 h-2 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-2 left-3 w-1 h-1 bg-white/30 rounded-full"></div>
              <div className="absolute top-10 -right-2 w-1 h-1 bg-white/20 rounded-full"></div>

              {/* Folder Back */}
              <div className="absolute bottom-2 w-16 h-12 bg-indigo-700 rounded-lg transform -skew-x-6"></div>
              {/* Paper */}
              <div className="absolute bottom-4 w-12 h-14 bg-white rounded flex flex-col p-1.5 shadow-sm transform -rotate-2">
                 <div className="w-full h-1 bg-black/10 rounded mb-1.5"></div>
                 <div className="w-full h-1 bg-black/10 rounded mb-1"></div>
                 <div className="w-3/4 h-1 bg-black/10 rounded mb-1"></div>
                 <div className="w-1/2 h-1 bg-black/10 rounded"></div>
              </div>
              {/* Folder Front */}
              <div className="absolute bottom-2 w-18 h-9 bg-indigo-500 rounded-lg shadow-lg"></div>

              {/* Upload Action Badge */}
              <div className="absolute -bottom-1 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.4)] ring-4 ring-zinc-900 transition-transform duration-300 group-hover:scale-110">
                <FiArrowUp size={14} className="text-white stroke-[3]" />
              </div>
            </div>

            <p className="text-sm font-semibold text-white/90 mb-1">
              {file ? file.name : "Drag & drop your resume here"}
            </p>
            <p className="text-[11px] text-white/40 mb-6 font-medium tracking-wide">PDF only • Max 20MB</p>
            
            <div className="w-full flex items-center gap-3 mb-5 px-6">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[10px] text-white/30 font-semibold tracking-wider">OR</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <div className="bg-transparent border border-white/15 text-white/80 hover:bg-white/10 hover:border-white/30 px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors">
              <FiFileText size={14} /> Choose File
            </div>

            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
            />
          </label>

          {/* Submit */}
          <button
            onClick={uploadResume}
            disabled={loading || !file}
            className="relative mt-5 w-full h-12 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Analyzing..." : "✨ Analyze Resume →"}
          </button>
        </div>
        
        {/* Footer */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-black/40 font-medium">
          <FiLock size={12} /> Your data is secure and confidential. We never share your resume.
        </div>
      </div>
    </div>
  );
}