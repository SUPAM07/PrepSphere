import { motion } from "motion/react";
import { FiCalendar, FiHelpCircle, FiCheckCircle, FiStar } from "react-icons/fi";

const STAT_THEMES = [
  { icon: FiCalendar,    bg: "bg-blue-500/10",    text: "text-blue-500",    stroke: "#3b82f6", fill: "url(#gradBlue)" },
  { icon: FiHelpCircle,  bg: "bg-emerald-500/10", text: "text-emerald-500", stroke: "#10b981", fill: "url(#gradGreen)" },
  { icon: FiCheckCircle, bg: "bg-orange-500/10",  text: "text-orange-500",  stroke: "#f97316", fill: "url(#gradOrange)" },
  { icon: FiStar,        bg: "bg-purple-500/10",  text: "text-purple-500",  stroke: "#a855f7", fill: "url(#gradPurple)" },
];

export default function StatBox({ label, value, sub, subHighlight, index = 0 }: any) {
  const theme = STAT_THEMES[index % STAT_THEMES.length];
  const Icon = theme.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5 shadow-sm hover:border-zinc-700 hover:shadow-md transition-all flex flex-col justify-between min-h-[140px]"
    >
      {/* glass sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />

      {/* Top section: Icon */}
      <div className="relative mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${theme.bg} ${theme.text}`}>
          <Icon size={18} />
        </div>
      </div>

      {/* Middle section: Label and Chart container */}
      <div className="relative flex items-end justify-between mb-2">
        <div>
          <p className="text-white/50 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-white text-2xl md:text-3xl font-bold tracking-tight">
            {value}
          </p>
        </div>

        {/* Mock Sparkline SVG */}
        <div className="w-20 h-10 shrink-0 opacity-80">
          <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* A gentle rising curve pattern */}
            <path
              d="M0,35 Q15,35 30,25 T60,20 T100,5"
              fill="none"
              stroke={theme.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Bottom section: Sub text */}
      {sub && (
        <div className="relative flex items-center gap-1.5 flex-wrap">
          {subHighlight && (
            <span className="text-[10px] font-semibold bg-white/10 text-white/70 px-1.5 py-0.5 rounded">
              {subHighlight}
            </span>
          )}
          <span className="text-white/40 text-[10px] md:text-xs">{sub}</span>
        </div>
      )}
    </motion.div>
  );
}