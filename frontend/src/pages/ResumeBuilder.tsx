import { useState } from "react";
import { FiArrowLeft, FiArrowRight, FiEye, FiUser, FiStar, FiShield } from "react-icons/fi";
import { GiArtificialHive } from "react-icons/gi";
import ResumePreview from "../components/resume/ResumePreview";
import ResumeForm from "../components/resume/ResumeForm";
import initialData from "../components/resume/initialData";
import { useNavigate } from "react-router-dom";


// Step config — title + subtitle for each step
const STEPS = [
  { step: 1, title: "Personal Information", subtitle: "Your basic contact details" },
  { step: 2, title: "Professional Summary", subtitle: "A quick intro about yourself" },
  { step: 3, title: "Skills", subtitle: "Your technical skills" },
  { step: 4, title: "Work Experience", subtitle: "Your past jobs & internships" },
  { step: 5, title: "Projects", subtitle: "Projects you have built" },
  { step: 6, title: "Education", subtitle: "Your academic background" },
];

const TOTAL_STEPS = STEPS.length;

export default function ResumeBuilder({setUser}: any) {
  const [data, setData] = useState(initialData);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  const navigate = useNavigate()
  const goNext = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep(currentStep + 1);
  };

  const goPrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isLastStep = currentStep === TOTAL_STEPS;
  const progressPct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;

  const activeStep = STEPS.find((s) => s.step === currentStep) || STEPS[0];

  // ── Show Preview Page ──────────────────────────────────────────────────────
  if (showPreview) {
    return <ResumePreview data={data} setUser={setUser}  onBack={() => setShowPreview(false)} />;
  }

  // ── Show Form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50 text-[#0A0A0A] flex flex-col relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBWMGg0MCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="sticky top-0 z-20 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div
            onClick={() => navigate("/dashboard")}
            className="flex cursor-pointer items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_4px_14px_rgba(37,99,235,0.4)]">
              <GiArtificialHive size={16} color="white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              PrepSphere
            </span>
            <div className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100 sm:block ml-2">
              Resume Builder
            </div>
          </div>

          <button
            onClick={() => setShowPreview(true)}
            className="flex h-9 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white text-black/70 shadow-sm transition px-4 hover:border-black/20 hover:text-black hover:bg-black/5 font-medium text-sm"
          >
            <FiEye size={15} />
            Preview
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-8 sm:py-12 relative z-10 flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Left Form Card */}
        <div className="w-full lg:max-w-[800px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 p-6 sm:p-10">

          {/* Top Bar (Step Info) */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-xs font-bold tracking-wider text-blue-600 uppercase">
              STEP {currentStep} OF {TOTAL_STEPS}
            </p>
            <p className="text-xs font-medium text-black/50">{Math.round(progressPct)}% complete</p>
          </div>

          {/* Timeline Progress */}
          <div className="relative flex items-center justify-between w-full mb-12 px-1">
            <div className="absolute left-0 right-0 top-1/2 h-[3px] bg-black/5 -z-10 -translate-y-1/2 rounded-full"></div>
            <div 
              className="absolute left-0 top-1/2 h-[3px] bg-blue-600 -z-10 -translate-y-1/2 transition-all duration-500 ease-out rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
              style={{ width: `${progressPct}%` }}
            ></div>
            {STEPS.map((s) => {
              const isCompleted = s.step < currentStep;
              const isActive = s.step === currentStep;
              return (
                <div 
                  key={s.step} 
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-[0_0_0_4px_white,0_4px_10px_rgba(37,99,235,0.4)] scale-110" 
                      : isCompleted 
                        ? "bg-blue-600 text-white shadow-[0_0_0_4px_white]" 
                        : "bg-[#E5E7EB] text-black/40 shadow-[0_0_0_4px_white]"
                  }`}
                >
                  {s.step}
                </div>
              );
            })}
          </div>

          {/* Step Header (Icon + Title) */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_4px_14px_rgba(37,99,235,0.4)] shrink-0">
              <FiUser size={20} color="white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">{activeStep.title}</h1>
              <p className="mt-1 text-sm text-black/50 font-medium">{activeStep.subtitle}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-black/5 mb-8" />

          {/* Form */}
          <div className="min-h-[300px]">
            <ResumeForm step={currentStep} data={data} setData={setData} />
          </div>

          {/* Divider */}
          <div className="border-t border-black/5 mt-10 mb-6" />

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                currentStep === 1
                  ? "border-black/5 text-black/20 cursor-not-allowed bg-black/5"
                  : "border-black/10 text-black/60 hover:border-black/20 hover:text-[#0A0A0A] hover:bg-black/5 bg-white shadow-sm"
              }`}
            >
              <FiArrowLeft size={16} />
              Previous
            </button>

            {/* Bottom Dots (Optional, keeping for mobile if timeline hides, else standard dots) */}
            <div className="flex items-center gap-1.5 sm:hidden">
              {STEPS.map((s) => (
                <div
                  key={s.step}
                  className={`rounded-full transition-all ${
                    s.step === currentStep
                      ? "w-4 h-1.5 bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                      : s.step < currentStep
                        ? "w-1.5 h-1.5 bg-blue-600/40"
                        : "w-1.5 h-1.5 bg-black/10"
                  }`}
                />
              ))}
            </div>

            {isLastStep ? (
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:bg-blue-700 transition-all hover:scale-[1.02]"
              >
                Preview Resume
                <FiEye size={16} />
              </button>
            ) : (
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:bg-blue-700 transition-all hover:scale-[1.02]"
              >
                Next
                <FiArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right Side Info Card (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-[280px] shrink-0 flex-col gap-4">
          <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-black/5 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
              <FiStar size={16} />
            </div>
            <h3 className="font-bold text-[#0A0A0A] mb-2 tracking-tight text-[15px]">Why we ask this?</h3>
            <p className="text-black/60 text-xs leading-relaxed font-medium mb-6">
              This helps us personalize your resume and tailor suggestions that match your specific profile and target roles.
            </p>
            <div className="flex items-start gap-2 pt-4 border-t border-black/5">
              <FiShield className="text-blue-600 shrink-0 mt-0.5" size={14} />
              <p className="text-[11px] text-black/50 font-medium leading-relaxed">
                Your data is secure and private.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}