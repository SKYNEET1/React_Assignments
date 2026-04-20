import { useEffect } from "react";
import { login } from "../services/auth.Service";
import logoImg from "../assets/cboi_logo.png";
import loadingLogo from "../assets/loading_logo.png";

export default function Login() {
  useEffect(() => {
    // Automatically trigger login process after a short splash screen delay
    const timer = setTimeout(() => {
      login();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#0B7EB5] relative overflow-hidden">
      <div className="flex flex-col items-center mt-[-5%] z-10 w-full max-w-4xl px-4 animate-slide-up">
        
        {/* Large Rectangular Core Banking Logo */}
        <div className="mb-6 flex justify-center w-full max-w-[340px] md:max-w-[400px]">
          <img 
            src={logoImg} 
            alt="Central Bank of India" 
            className="w-full object-contain" 
          />
        </div>

        {/* Text exactly as in Image 1 */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-10">
          CBOI UPI Web_ V2
        </h1>
        
        {/* Small Rotating Loading Logo Below */}
        <div className="flex flex-col items-center gap-3">
          <img 
            src={loadingLogo} 
            alt="Loading securely..." 
            className="w-14 h-14 md:w-16 md:h-16 object-contain animate-spin" 
            style={{ animationDuration: '2s' }}
          />
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-8 text-center text-white/50 text-xs font-medium w-full">
        © 2026 iServeU Technology. All Rights Reserved.
      </p>
    </div>
  );
}