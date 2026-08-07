import { useState, useEffect } from "react";
import { useAppSelector } from "../redux/hooks";
import { motion, AnimatePresence } from "motion/react";
import {
  FiClock, FiX, FiCheck, FiChevronDown,
  FiHexagon, FiCode, FiDatabase, FiBriefcase, FiTrendingUp, FiUploadCloud, FiStar
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import RoadmapResult from "../components/roadmap/RoadmapResult";
import api from "../utils/axios";
import { getCurrentUser } from "../api/user.api";

const PACKAGE_OPTIONS = ["10 LPA", "15 LPA", "20 LPA", "30 LPA", "40 LPA"];

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onHistoryClick }: any) {
  const navigate = useNavigate();
  return (
    <nav className="fixed inset-x-0 top-0 z-40 border-b border-black/8 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div
          onClick={() => navigate("/dashboard")}
          className="flex cursor-pointer items-center gap-2"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
            <FiHexagon size={16} fill="currentColor" className="text-white" />
          </div>
          <span className="text-base sm:text-lg font-extrabold text-[#0A0A0A]">PrepSphere</span>
          <span className="hidden sm:block ml-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-blue-600">
            Roadmap Generator
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onHistoryClick}
          className="flex items-center gap-1.5 text-xs font-semibold text-black/60 hover:text-[#0A0A0A] px-4 py-2 rounded-full border border-black/10 hover:border-black/20 bg-white shadow-sm transition-all"
        >
          <FiClock size={12} />
          <span className="hidden sm:inline">History</span>
        </motion.button>
      </div>
    </nav>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Roadmap({setUser}: any) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [roadmap, setRoadmap]         = useState<any>(null);
  const [role, setRole]               = useState("");
  const [targetPackage, setTargetPackage] = useState(PACKAGE_OPTIONS[2]); // default "20 LPA"
  const [packageOpen, setPackageOpen] = useState(false);
  const [useResume, setUseResume]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory]         = useState<any[]>([]);
  const [error, setError]             = useState("");

  const {resume} = useAppSelector((state: any) => state.resume);

  useEffect(() => {
  getRoadmaps();
}, []);


const getRoadmaps = async () => {
  try {
    setHistoryLoading(true);

    const response= await api.get(
      "/api/roadmap"
      
    );
    setHistory(response.data.data || []);
  } catch (err) {
    console.error(err);
  } finally {
    setHistoryLoading(false);
  }
};


const getRoadmapById = async (id: any) => {
  try {
    const { data } = await api.get(
      `/api/roadmap/${id}`
    );
    setRoadmap(data.data);
  } catch (err) {
    console.error(err);
  }
};

  // ── Generate a new roadmap ──
  async function handleGenerate() {
    if (!role.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post(
        "/api/roadmap/generate",
        {
          role: role.trim(),
          targetPackage,
          useResume,
          resume,
        },
      );
      setRoadmap(data.data);
      // Fetch updated user stats since coins were deducted by the backend
      const meRes = await getCurrentUser();
      if (meRes?.user) {
        setUser(meRes.user);
      }
      // refresh history in the background so the new roadmap shows up
      getRoadmaps();
    } catch (err) {
      console.error("Failed to generate roadmap:", err);
      setError("Something went wrong while generating your roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-white text-[#0A0A0A] flex flex-col overflow-hidden">

      <Navbar onHistoryClick={() => setHistoryOpen(!historyOpen)} />

      {/* Main */}
      <main className="flex-1 overflow-y-auto pb-32 sm:pb-40 pt-16 sm:pt-24 bg-grid-glow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
          <AnimatePresence mode="wait">
            {!roadmap ? (
              /* ── Empty State ── */
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center px-2 sm:px-4"
              >
                <div className="mx-auto mb-6 flex items-center justify-center gap-1.5 rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-[11px] font-bold text-purple-600 shadow-sm">
                  AI-Powered Career Guidance ✨
                </div>
                <div className="text-5xl sm:text-6xl mb-4">🚀</div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0A0A0A] mb-2 tracking-tight">AI Roadmap Generator</h1>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Your Dream Job. Our AI Roadmap.</h2>
                <p className="text-black/50 text-sm sm:text-base max-w-sm sm:max-w-xl mb-10 mx-auto leading-relaxed">
                  Generate a personalised roadmap tailored to your dream role.
                  <br className="hidden sm:block" />
                  Select a role and let AI build a complete learning path for you.
                </p>

                {error && (
                  <p className="mt-4 text-xs text-red-500 max-w-xs sm:max-w-md">{error}</p>
                )}

                <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
                  {[
                    { id: "Frontend Developer", title: "Frontend Dev", desc: "Build modern web experiences", icon: FiCode },
                    { id: "Backend Developer", title: "Backend Eng", desc: "Design scalable backend systems", icon: FiDatabase },
                    { id: "Machine Learning Engineer", title: "ML Engineer", desc: "Build intelligent ML-powered apps", icon: FiBriefcase }
                  ].map((r) => {
                    const isSelected = role === r.id;
                    const Icon = r.icon;
                    return (
                      <motion.div
                        key={r.id}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setRole(role === r.id ? "" : r.id)}
                        className={`relative cursor-pointer flex flex-col p-5 sm:p-6 rounded-2xl border bg-white transition-all text-left ${
                          isSelected 
                            ? "border-blue-500 shadow-[0_8px_30px_rgba(37,99,235,0.12)]" 
                            : "border-black/5 hover:border-black/15 shadow-sm hover:shadow-md"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                            <FiCheck size={14} strokeWidth={3} />
                          </div>
                        )}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mb-4 shadow-sm">
                          <Icon size={20} />
                        </div>
                        <h3 className="text-[#0A0A0A] font-bold text-sm sm:text-base mb-1">{r.title}</h3>
                        <p className="text-black/45 text-[11px] sm:text-xs leading-relaxed pr-2">{r.desc}</p>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-[10px] sm:text-xs font-semibold text-black/40">
                  <span className="flex items-center gap-1.5"><FiStar className="text-blue-500" /> AI Personalized</span>
                  <span className="w-px h-3 bg-black/10 hidden sm:block"></span>
                  <span className="flex items-center gap-1.5"><FiTrendingUp className="text-blue-500" /> Skill Focused</span>
                  <span className="w-px h-3 bg-black/10 hidden sm:block"></span>
                  <span className="flex items-center gap-1.5"><FiBriefcase className="text-blue-500" /> Industry Relevant</span>
                  <span className="w-px h-3 bg-black/10 hidden sm:block"></span>
                  <span className="flex items-center gap-1.5"><FiClock className="text-blue-500" /> Up-to-date Content</span>
                </div>
              </motion.div>

            ) : (
              <RoadmapResult
                key="roadmap"
                roadmap={roadmap}
                onClear={() => setRoadmap(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── History Drawer ── */}
      <AnimatePresence>
        {historyOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />
            <motion.aside
              key="drawer"
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[280px] sm:w-[300px] max-w-[85vw] bg-white border-l border-black/8 flex flex-col overflow-y-auto shadow-[0_0_40px_rgba(0,0,0,0.1)]"
            >
              <div className="flex items-center justify-between px-4 py-3 sm:py-4 border-b border-black/8 sticky top-0 bg-white/90 backdrop-blur-xl">
                <span className="text-sm font-semibold text-[#0A0A0A]">Previous Roadmaps</span>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="text-black/35 hover:text-[#0A0A0A] transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-2 p-3">
                {historyLoading ? (
                  <p className="text-xs text-black/35 text-center py-6">Loading…</p>
                ) : history.length === 0 ? (
                  <p className="text-xs text-black/35 text-center py-6">No roadmaps yet.</p>
                ) : (
                  history.map((item) => (
  <motion.button
    key={item._id}
    onClick={() => {
      getRoadmapById(item._id);
      setHistoryOpen(false);
    }}
    className="relative overflow-hidden text-left p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
  >
      <h3 className="text-white font-semibold">
        {item.title}
      </h3>
    <div className="flex justify-between items-center my-1">
    
<span className="text-blue-400 text-xs">
        {item.targetPackage}
      </span>
    <p className="text-xs text-white/40">
      {item.duration}
    </p>
     
    </div>

 

    <p className="text-xs text-white/30 mt-1">
      {new Date(item.createdAt).toLocaleDateString()}
    </p>
  </motion.button>
))
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Fixed Bottom Input ── */}
      {!roadmap && (
        <div className="fixed bottom-0 left-0 right-0 z-30 pb-4 sm:pb-6 pt-4 px-3 sm:px-4 bg-gradient-to-t from-white via-white/95 to-transparent">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 sm:p-4 rounded-[20px] bg-zinc-900 border border-zinc-800 shadow-2xl"
            >
              {/* Left side text */}
              <div className="flex items-center gap-3 pl-1 sm:pl-2">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
                  <FiBriefcase size={16} />
                </div>
                <div className="flex flex-col flex-1 min-w-[200px] w-full max-w-[250px]">
                  <input
                    type="text"
                    placeholder="Type your targeted role..."
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="bg-transparent border-b border-white/10 text-white font-bold text-sm tracking-tight focus:outline-none focus:border-white/30 placeholder:text-white/40 pb-0.5 w-full"
                  />
                  <p className="text-white/40 text-[11px] mt-1">Adjust preferences and generate your plan.</p>
                </div>
              </div>

              {/* Right side controls */}
              <div className="flex flex-wrap md:flex-nowrap items-center gap-2 sm:gap-3 justify-start md:justify-end">
                {/* Target Package Dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPackageOpen(!packageOpen)}
                    type="button"
                    className="relative flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white/90 hover:border-white/20 transition-all whitespace-nowrap bg-white/5"
                  >
                    {targetPackage} Goal
                    <FiChevronDown size={11} className={`ml-1 transition-transform ${packageOpen ? "rotate-180" : ""}`} />
                  </motion.button>

                  <AnimatePresence>
                    {packageOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full mb-2 right-0 w-32 rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0A] shadow-[0_8px_24px_rgba(0,0,0,0.35)] z-10"
                      >
                        {PACKAGE_OPTIONS.map((pkg) => (
                          <button
                            key={pkg}
                            onClick={() => {
                              setTargetPackage(pkg);
                              setPackageOpen(false);
                            }}
                            className={`w-full text-left text-[11px] sm:text-xs px-3 py-2 transition-colors ${
                              pkg === targetPackage
                                ? "bg-blue-600/20 text-blue-400 font-semibold"
                                : "text-white/55 hover:bg-white/5 hover:text-white/90"
                            }`}
                          >
                            {pkg} Goal
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Use Resume Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setUseResume(!useResume)}
                  type="button"
                  className={`flex items-center text-[11px] sm:text-xs font-semibold gap-1.5 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                    useResume
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {useResume ? (
                    <><FiCheck size={14} /> Resume</>
                  ) : (
                    <><FiUploadCloud size={14} /> Upload Resume</>
                  )}
                </motion.button>

                {/* Generate Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={loading || !role}
                  className="relative flex items-center gap-1.5 text-[11px] sm:text-xs px-4 sm:px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? "Generating..." : "Generate Roadmap ✨"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

    </div>
  );
}