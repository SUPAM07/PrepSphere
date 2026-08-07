import { motion } from "motion/react";
import {
  Radar, RadarChart, PolarGrid,
  PolarAngleAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { FiCode, FiUsers, FiArrowRight } from "react-icons/fi";

function CustomTooltip({ active, payload }: { active?: any, payload?: any }) {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white shadow-2xl">
        <p className="text-white/40 mb-0.5">{payload[0]?.payload?.skill}</p>
        <p className="font-bold text-white">{payload[0]?.value}%</p>
      </div>
    );
  }
  return null;
}

function RadarCard({ type, count, data, color, index }: any) {
  const isTechnical = type === "Technical";
  const Icon = isTechnical ? FiCode : FiUsers;
  const themeBg = isTechnical ? "bg-blue-500/10" : "bg-indigo-500/10";
  const themeText = isTechnical ? "text-blue-500" : "text-indigo-400";
  const themeBadge = isTechnical ? "bg-blue-500/20 text-blue-400" : "bg-indigo-500/20 text-indigo-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 + index * 0.1 }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5
                 flex flex-col shadow-sm hover:border-zinc-700 hover:shadow-md transition-all"
    >
      {/* glass sheen */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />

      {/* Top Header */}
      <div className="relative flex items-center gap-2.5 mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${themeBg} ${themeText}`}>
          <Icon size={14} />
        </div>
        <h3 className="text-white font-bold text-sm tracking-tight">{type} Interviews</h3>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${themeBadge}`}>
          {count}
        </span>
      </div>

      <div className="relative flex-1">
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="rgba(255,255,255,0.08)" gridType="circle" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: 500 }}
            />
            <Radar
              name={`${type} Interviews`}
              dataKey="score"
              stroke={color}
              fill={color}
              fillOpacity={0.15}
              strokeWidth={2}
              dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Footer Action */}
      <div className="relative flex justify-center mt-3 pt-4 border-t border-white/5">
        <button className="text-[11px] font-semibold text-white/80 bg-transparent border border-zinc-700 hover:border-blue-500 hover:text-white hover:bg-zinc-800 transition-colors px-6 py-2 rounded-lg flex items-center gap-1.5">
          View Details <FiArrowRight size={11} />
        </button>
      </div>
    </motion.div>
  );
}

export default function InterviewGraph({ technicalData, behaviouralData, technicalCount, hrCount }: any) {
  const techData = technicalData;
  const behData  = behaviouralData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <RadarCard type="Technical" count={technicalCount} data={techData} color="#2563eb" index={0} />
      <RadarCard type="HR"        count={hrCount}        data={behData}  color="#6366f1" index={1} />
    </div>
  );
}