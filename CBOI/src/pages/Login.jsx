import { login } from "../services/auth.Service";
import CboiLogo from "../components/CboiLogo";

export default function Login() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Animated Background Elements */}
      <div className="animated-bg" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />

      {/* Main Login Card */}
      <div className="w-full max-w-md animate-slide-up">
        <div className="glass-card rounded-[2rem] p-8 md:p-12 border border-white/10 relative overflow-hidden">
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-30" />

          <div className="flex flex-col items-center gap-8">
            {/* Logo / Brand Icon */}
            <div className="flex items-center justify-center">
              <CboiLogo className="w-56 sm:w-64 animate-float" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-3xl font-extrabold tracking-tight text-white">
                Welcome to <span className="text-primary-400">CBOI</span>
              </h1>
              <p className="text-slate-400 text-sm font-medium">
                Soundbox Management Portal
              </p>
            </div>

            <div className="w-full space-y-4">
              <button
                onClick={login}
                className="w-full h-14 glass-button rounded-xl flex items-center justify-center gap-3 group cursor-pointer"
              >
                <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-primary-400">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
                  </svg>
                </div>
                <span className="text-white font-semibold tracking-wide">
                  Login
                </span>
              </button>

              <p className="text-[10px] text-center text-slate-500 uppercase tracking-[0.2em]">
                Secure Enterprise Login
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center mt-8 text-slate-500 text-xs font-medium">
          © 2026 iServeU Technology. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}