import { useState, useRef } from "react";
import { FiX, FiLoader, FiUser, FiMail, FiLock, FiGithub } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import api from "../utils/axios";

import { toast } from "react-toastify";

export function LoginModal({ onClose, setUser, initialMode = "LOGIN" }: any) {
  const [mode, setMode] = useState<"LOGIN" | "SIGNUP" | "VERIFY_EMAIL" | "VERIFY_OTP" | "FORGOT_PASSWORD" | "RESET_PASSWORD">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, ""); // Only numbers
    if (val.length > 1) return; // Ignore multiple chars, handled by paste

    const newOtp = (otp.padEnd(6, " ")).split("");
    newOtp[index] = val || " ";
    setOtp(newOtp.join("").trimEnd());

    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && index > 0 && !e.currentTarget.value) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(pastedData);
    if (pastedData.length > 0) {
      otpRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "SIGNUP") {
        await api.post("/api/auth/register", { name, email, password });
        setMode("VERIFY_EMAIL");
      } else if (mode === "VERIFY_EMAIL") {
        await api.post("/api/auth/verify-email", { email, otp });
        setMode("LOGIN");
        setOtp("");
      } else if (mode === "LOGIN") {
        const res = await api.post("/api/auth/login", { email, password });
        localStorage.setItem("accessToken", res.data.accessToken);

        try {
          const coinsRes = await api.get("/api/billing/coins");
          res.data.user.interviewCoin = coinsRes.data?.data?.interviewCoins || 0;
        } catch (e) {
          res.data.user.interviewCoin = 0;
        }

        setUser(res.data.user);
        onClose();
      } else if (mode === "FORGOT_PASSWORD") {
        await api.post("/api/auth/forgot-password", { email });
        setMode("RESET_PASSWORD");
      } else if (mode === "RESET_PASSWORD") {
        await api.post("/api/auth/reset-password", { email, otp, newPassword: password });
        toast.success("Password changed successfully!");
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4 py-8 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col md:flex-row min-h-[550px]">

        {/* Left Branding Side (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-blue-600 to-indigo-700 p-10 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBWMGg0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] pointer-events-none" />

          <div className="relative z-10 flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner border border-white/30">
              <span className="font-extrabold text-lg tracking-tight">P</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight">PrepSphere</span>
          </div>

          <div className="relative z-10 text-white mt-auto">
            <h3 className="text-3xl font-bold mb-3 tracking-tight">Ace Every<br />Interview.</h3>
            <p className="text-white/70 text-sm leading-relaxed max-w-[240px]">
              Join thousands of professionals landing their dream roles with AI-powered preparation.
            </p>
          </div>

          {/* Decorative Circles */}
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute top-1/4 -right-12 w-32 h-32 bg-blue-400/20 rounded-full blur-xl" />
        </div>

        {/* Right Form Side */}
        <div className="relative w-full md:w-7/12 bg-white p-8 sm:p-12 flex flex-col justify-center">
          <button onClick={onClose} className="absolute top-6 right-6 text-black/40 hover:text-black hover:bg-black/5 p-1.5 rounded-full transition-colors">
            <FiX size={20} />
          </button>

          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-2xl font-bold text-center mb-2 text-[#0A0A0A] tracking-tight">
              {mode === "LOGIN" && "Welcome back"}
              {mode === "SIGNUP" && "Create your account"}
              {mode === "VERIFY_EMAIL" && "Verify Email"}
              {mode === "FORGOT_PASSWORD" && "Reset Password"}
              {mode === "RESET_PASSWORD" && "Enter New Password"}
            </h2>

            <p className="text-black/50 text-center text-sm mb-8 font-medium">
              {mode === "LOGIN" && "Enter your credentials to access your account."}
              {mode === "SIGNUP" && "Join PrepSphere and start preparing today."}
              {mode === "VERIFY_EMAIL" && "Check your terminal (or email) for the verification OTP."}
              {mode === "FORGOT_PASSWORD" && "Enter your email to receive a reset OTP."}
              {mode === "RESET_PASSWORD" && "Check your terminal (or email) for the reset OTP."}
            </p>

            {/* Social Logins (Only on Login/Signup) */}
            {(mode === "LOGIN" || mode === "SIGNUP") && (
              <>
                <div className="flex flex-col gap-3 mb-6">
                  <button type="button" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-black/15 bg-white text-[#0A0A0A] font-semibold hover:bg-black/5 transition-all text-sm shadow-sm">
                    <FcGoogle size={18} /> Continue with Google
                  </button>
                  <button type="button" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-black/15 bg-white text-[#0A0A0A] font-semibold hover:bg-black/5 transition-all text-sm shadow-sm">
                    <FiGithub size={18} /> Continue with GitHub
                  </button>
                </div>

                <div className="w-full flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-black/10"></div>
                  <span className="text-[10px] text-black/40 font-bold tracking-wider uppercase">OR</span>
                  <div className="flex-1 h-px bg-black/10"></div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "SIGNUP" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0A0A0A] ml-1">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={16} />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-black/15 rounded-xl pl-11 pr-4 py-2.5 text-[#0A0A0A] text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-black/30"
                      required
                    />
                  </div>
                </div>
              )}

              {(mode === "LOGIN" || mode === "SIGNUP" || mode === "FORGOT_PASSWORD" || mode === "RESET_PASSWORD") && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0A0A0A] ml-1">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={16} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-black/15 rounded-xl pl-11 pr-4 py-2.5 text-[#0A0A0A] text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-black/30 disabled:opacity-50 disabled:bg-black/5"
                      required
                      disabled={mode === "RESET_PASSWORD"}
                    />
                  </div>
                </div>
              )}

              {(mode === "LOGIN" || mode === "SIGNUP" || mode === "RESET_PASSWORD") && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-semibold text-[#0A0A0A]">
                      {mode === "RESET_PASSWORD" ? "New Password" : "Password"}
                    </label>
                    {mode === "LOGIN" && (
                      <button type="button" onClick={() => setMode("FORGOT_PASSWORD")} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" size={16} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-black/15 rounded-xl pl-11 pr-4 py-2.5 text-[#0A0A0A] text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-black/30"
                      required
                    />
                  </div>
                </div>
              )}

              {(mode === "VERIFY_EMAIL" || mode === "RESET_PASSWORD") && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#0A0A0A] ml-1 mb-1 block">Verification Code</label>
                  <div className="flex gap-2 justify-between">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        value={otp[index] || ""}
                        onChange={(e) => handleOtpChange(index, e)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className="w-12 h-14 bg-white border border-black/15 rounded-xl text-[#0A0A0A] text-xl text-center outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold shadow-sm"
                        maxLength={1}
                        required
                      />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="text-red-500 text-xs font-medium text-center bg-red-50 py-2 rounded-lg">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-[0_4px_14px_rgba(37,99,235,0.25)] text-sm mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <FiLoader className="animate-spin" /> : "Continue"}
              </button>
            </form>

            <div className="mt-8 text-center text-xs font-medium text-black/50">
              {mode === "LOGIN" && (
                <p>Don't have an account? <button onClick={() => { setMode("SIGNUP"); setError(""); }} className="text-blue-600 font-bold hover:underline ml-1">Sign up</button></p>
              )}
              {mode === "SIGNUP" && (
                <p>Already have an account? <button onClick={() => { setMode("LOGIN"); setError(""); }} className="text-blue-600 font-bold hover:underline ml-1">Log in</button></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}