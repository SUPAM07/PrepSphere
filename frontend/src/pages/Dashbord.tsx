import { useState, useEffect } from "react";

import { motion } from "motion/react";

import { FiSidebar, FiBell, FiCalendar, FiClock, FiChevronDown } from "react-icons/fi";

import Sidebar from "../components/Sidebar";

import StatBox from "../components/Statbox";

import InterviewGraph from "../components/InterviewGraph";



import { useNavigate } from "react-router-dom";

import { getAllInterviews } from "../api/interview.api";
import api from "../utils/axios";









export default function Dashboard({ user, setUser }: any) {

  const [collapsed, setCollapsed] = useState(false);   // desktop collapse

  const [mobileOpen, setMobileOpen] = useState(false);   // mobile drawer



  const [stats, setStats] = useState({

    totalInterviews: 0,

    totalQuestions: 0,

    completed: 0,

    averageScore: 0,

  });

  const [technicalData, setTechnicalData] = useState([]);

  const [behaviouralData, setBehaviouralData] = useState([]);

  const [technicalCount, setTechnicalCount] = useState(0);

  const [hrCount, setHrCount] = useState(0);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const navigate = useNavigate()
  useEffect(() => {

    

    const fetchInterviews = async () => {
    
       const response = await getAllInterviews();
       
        setStats(response.stats);

        setTechnicalData(response.technicalData);

        setBehaviouralData(response.behaviouralData);

        setTechnicalCount(response.technicalCount);

        setHrCount(response.hrCount);
      
    };
    fetchInterviews()
    
  }, []);

  const handleLogout = () => {
    // Instantly clear UI state for maximum responsiveness
    setUser(null);
    localStorage.removeItem("accessToken");
    navigate("/");

    // Background call to invalidate session on the server
    api.post("/api/auth/logout").catch((error) => {
      console.log("Background logout error:", error);
    });
  };
  return (

    <div className="bg-white min-h-screen text-[#0A0A0A] font-sans flex">
      <Sidebar

        user={user}

        onNewInterview={() => navigate("/interview")}

        onLogout={handleLogout}

        collapsed={collapsed}

        setCollapsed={setCollapsed}

        mobileOpen={mobileOpen}

        setMobileOpen={setMobileOpen}

      />
      {/* Main — desktop margin matches sidebar width */}
      <motion.main
        className={`flex-1 min-h-screen px-3 sm:px-4 md:px-6 py-4 md:py-6 transition-all duration-300 ${collapsed ? "md:ml-[72px]" : "md:ml-[260px]"
          }`}
      >
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-5 md:mb-6 gap-4">
          <div className="flex items-start gap-2.5">
            {/* Mobile hamburger — FiSidebar */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-black/40 hover:text-[#0A0A0A] transition-colors mt-1"
            >
              <FiSidebar size={17} />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-black/40 text-[11px] md:text-xs font-medium mb-0.5">
                Overview
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A0A0A] tracking-tight">
                Hello, {firstName} 👋
              </h1>
              <p className="text-black/50 text-sm mt-1">
                Track your progress, review performance and get interview-ready.
              </p>
            </motion.div>
          </div>

          {/* Top Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            <button className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-full text-xs font-bold transition-colors">
              🚀 Upgrade to Pro
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-black/5 text-black/60 hover:bg-black/10 transition-colors">
              <FiBell size={15} />
            </button>
            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-700">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
            </div>
          </div>
        </div>



        {/* Divider */}

        <div className="h-px bg-black/8 mb-5 md:mb-6" />



        {/* Stat Boxes */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 md:gap-3">

          <StatBox

            label="Total Interviews"

            value={stats?.totalInterviews}

            subHighlight="All Time"

            sub="Interviews Created"

            index={0}

          />



          <StatBox

            label="Questions Solved"

            value={stats?.totalQuestions}

            subHighlight="Answered"

            sub="Across All Interviews"

            index={1}

          />



          <StatBox

            label="Completed"

            value={stats?.completed}

            subHighlight={`${stats?.totalInterviews || 0} Total`}

            sub="Interviews Finished"

            index={2}

          />



          <StatBox

            label="Average Score"

            value={`${Math.round(stats?.averageScore || 0)}/100`}

            subHighlight="Completed Only"

            sub="Average Performance"

            index={3}

          />

        </div>



        {/* Graph Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-3 md:mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3"
        >
          <div>
            <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest mt-2.5 mb-1">
              PERFORMANCE
            </p>
            <h2 className="text-[#0A0A0A] font-extrabold text-lg md:text-xl tracking-tight">
              Interview History
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 text-xs font-medium text-black/60 bg-white border border-black/10 hover:border-black/20 hover:text-black/80 px-3 py-1.5 rounded-lg transition-colors">
              <FiCalendar size={13} className="text-black/40" /> All Interviews <FiChevronDown size={14} className="text-black/40" />
            </button>
            <button className="flex items-center gap-2 text-xs font-medium text-black/60 bg-white border border-black/10 hover:border-black/20 hover:text-black/80 px-3 py-1.5 rounded-lg transition-colors">
              <FiClock size={13} className="text-black/40" /> Last 30 Days <FiChevronDown size={14} className="text-black/40" />
            </button>
          </div>
        </motion.div>



        <div className="w-full overflow-x-auto">

          <InterviewGraph

            technicalData={technicalData}

            behaviouralData={behaviouralData}

            technicalCount={technicalCount}

            hrCount={hrCount}

          />

        </div>



      </motion.main>

    </div>

  );

}