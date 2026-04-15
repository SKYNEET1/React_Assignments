import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleCallback } from "../services/auth.Service";
import { useDispatch } from "react-redux";
import { setAuth, setVpaList } from "../features/auth/authSlice";
import { decodeToken, merchantFetchAPI } from "../services/api";
import loadingIcon from "../assets/loading_logo.png";

export default function CallbackPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  useEffect(() => {
    async function run() {
      console.log("[CallbackPage.jsx:13] Starting auth callback process");
      try {
        const { profiles } = await handleCallback();
        const token = localStorage.getItem("token");
        console.log(`[CallbackPage.jsx:17] Token retrieved from localStorage: ${token?.substring(0, 10)}...`);

        dispatch(
          setAuth({
            user: profiles,
            token: token,
          })
        );

        // Fetch VPAs using mobile number from token
        try {
          console.log("[CallbackPage.jsx:28] Decoding token to get mobile number");
          const decoded = decodeToken(token);
          const mobileNo = decoded?.user_name || decoded?.preferred_username || "9348781833";
          console.log(`[CallbackPage.jsx:31] Mobile number identified: ${mobileNo}`);
          
          console.log(`[CallbackPage.jsx:33] Calling merchantFetchAPI for mobileNo: ${mobileNo}`);
          const response = await merchantFetchAPI({ mobileNo });
          console.log("[CallbackPage.jsx:35] API Response received:", response.data);

          const vpas = response.data?.vpaList || [
            "20260181163325-iservuqrsbrp@cbin",
            "Ankita83@cbin",
            "20250831305524-iservuqrsbrp@cbin",
            "si86@cbin",
            "74458@cbin",
            "20250529876004-iservuqrsbrp@cbin"
          ];
          console.log(`[CallbackPage.jsx:45] Final VPA List:`, vpas);
          dispatch(setVpaList(vpas));
        } catch (apiErr) {
          console.error("[CallbackPage.jsx:48] VPA Fetch Error:", apiErr.message);
          // Fallback to static data
          const fallbackVpas = [
            "20260181163325-iservuqrsbrp@cbin",
            "Ankita83@cbin",
            "20250831305524-iservuqrsbrp@cbin",
            "si86@cbin",
            "74458@cbin",
            "20250529876004-iservuqrsbrp@cbin"
          ];
          console.log("[CallbackPage.jsx:58] Using fallback VPA data");
          dispatch(setVpaList(fallbackVpas));
        }

        console.log("[CallbackPage.jsx:62] Navigating to Dashboard");
        navigate("/dashboard");
      } catch (err) {
        console.error("[CallbackPage.jsx:65] Auth Callback Failed:", err.message);
        setError(err.message);
        setTimeout(() => navigate("/login"), 3000);
      }
    }

    run();
  }, [dispatch, navigate]);


  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <img src={loadingIcon} alt="Error" className="w-16 h-16 animate-spin mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Login Failed</h2>
        <p className="text-slate-500">{error}</p>
        <p className="text-slate-400 mt-4 text-sm">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="flex justify-center items-center">
        <img src={loadingIcon} alt="Loading" className="w-[80px] h-[80px] animate-spin" />
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}