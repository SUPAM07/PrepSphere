import React, { useState } from "react";
import { motion } from "motion/react";
import { FiMic, FiFileText, FiBarChart2, FiMap, FiArrowRight } from "react-icons/fi";
import { GiArtificialHive } from "react-icons/gi";
import { LoginModal } from "../components/LoginModel";
import img from "../assets/home_page.png"


export default function Home({ setUser }: any) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authMode, setAuthMode] = useState<"LOGIN" | "SIGNUP">("LOGIN");

  return (
    <div className="bg-white text-[#0A0A0A] font-sans min-h-screen overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-6 bg-white/70 backdrop-blur-xl border-b border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
      >
        {/* Logo & Links */}
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_4px_14px_rgba(37,99,235,0.4)]">
              <GiArtificialHive size={16} color="white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-[#0A0A0A]">
              PrepSphere
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-black/60">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#agents" className="hover:text-blue-600 transition-colors">AI Agents</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#docs" className="hover:text-blue-600 transition-colors">Docs</a>
          </div>
        </div>

        {/* Nav Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setAuthMode("SIGNUP"); setShowLoginModal(true); }}
            className="text-sm font-semibold text-[#0A0A0A] bg-transparent border border-black/10 rounded-md px-4 py-2 cursor-pointer transition-all hover:bg-black/5 hover:border-black/20"
          >
            Sign up
          </button>
          <motion.button
            onClick={() => { setAuthMode("LOGIN"); setShowLoginModal(true); }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-blue-600 text-white font-semibold rounded-md px-4 py-2 text-sm cursor-pointer transition-all shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:bg-blue-700 hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)] flex items-center gap-1"
          >
            Log In <FiArrowRight size={14} className="mt-0.5"/>
          </motion.button>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-8 overflow-hidden bg-white">
        {/* Background Grid Texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBWMGg0MCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMDMiLz4KPC9zdmc+')] pointer-events-none" />
        
        {/* Electric Blue Glow */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-[100%] bg-blue-600/10 blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 text-center z-10">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-600/20 bg-blue-50 text-blue-700 text-xs font-semibold mb-6 tracking-wide uppercase shadow-sm"
          >
            Multi-Agent Interview Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-5 text-[#0A0A0A]"
          >
            Practice. Improve.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              Get Hired.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="text-black/50 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-8"
          >
            PrepSphere is the premier AI-powered interview preparation platform. Run hyper-realistic mock interviews, polish your resume, and land your dream job faster.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28 }}
            className="flex items-center justify-center"
          >
            <motion.button
              onClick={() => { setAuthMode("SIGNUP"); setShowLoginModal(true); }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative overflow-hidden bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl text-base cursor-pointer shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all hover:bg-blue-700 flex items-center gap-2 group"
            >
              Start for free
              <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              <span className="absolute inset-0 bg-gradient-to-br from-white/[0.15] via-transparent to-transparent pointer-events-none rounded-xl" />
            </motion.button>
          </motion.div>

          {/* Hero Image (Dashboard) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
            className="mt-14 rounded-xl overflow-hidden border border-black/5 shadow-[0_50px_120px_rgba(0,0,0,0.18)] max-w-5xl mx-auto bg-white"
          >
            <img
              src={img}
              alt="PrepSphere Dashboard"
              className="w-full h-auto object-cover block"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/1000x600/F3F4F6/0A0A0A?text=PrepSphere+Dashboard";
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* ── AGENTS ── */}
      <section id="agents" className="py-24 bg-[#F8F9FA] relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBWMGg0MCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">

          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-blue-600/20 bg-blue-50 text-blue-700 text-xs font-semibold mb-5 tracking-wide uppercase">
              AI Powered Agents
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0A0A0A]">
              Specialized Agents For<br />
              <span className="text-black/40">
                Every Interview Stage
              </span>
            </h2>

            <p className="text-black/50 text-base max-w-2xl mx-auto mt-5 leading-relaxed">
              PrepSphere combines multiple AI agents that work together
              to help you build your resume, practice interviews,
              receive detailed feedback, and follow a personalized roadmap.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <FiFileText size={20} />,
                title: "Resume Agent",
                desc: "Create ATS-friendly resumes, improve profile strength and maximize interview opportunities.",
              },
              {
                icon: <FiMic size={20} />,
                title: "Interview Agent",
                desc: "Conduct realistic HR, Technical and Coding interviews with AI-powered simulations.",
              },
              {
                icon: <FiBarChart2 size={20} />,
                title: "Feedback Agent",
                desc: "Get detailed answer analysis, scoring reports and improvement recommendations.",
              },
              {
                icon: <FiMap size={20} />,
                title: "Roadmap Agent",
                desc: "Generate personalized learning roadmaps based on goals, skills and performance.",
              },
            ].map((agent, i) => (
              <motion.div
                key={agent.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative overflow-hidden bg-[#18181B] border border-[#323232] rounded-2xl p-6 shadow-xl hover:bg-[#242424] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:border-[#444] transition-all cursor-default"
              >
                {/* hover glow inside card */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 shadow-inner group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                    {agent.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-white tracking-tight">{agent.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{agent.desc}</p>
                  
                  <div className="flex items-center text-blue-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                    Learn more <FiArrowRight className="ml-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          initialMode={authMode}
          onClose={() => setShowLoginModal(false)}
          setUser={setUser}
        />
      )}

      {/* ── FOOTER ── */}
      <footer className="border-t border-black/5 py-8 bg-white text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
            <GiArtificialHive size={12} color="white" />
          </div>
          <span className="font-extrabold text-sm text-[#0A0A0A]">PrepSphere</span>
        </div>
        <div className="text-black/40 text-xs">© {new Date().getFullYear()} PrepSphere. All rights reserved.</div>
      </footer>

    </div>
  );
}