import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { fetchMerchant } from "../slices/merchantSlice";
import { decodeToken } from "../services/api";
import CboiLogo from "./CboiLogo";
import ProfileModal from "./ProfileModal";
import logoImg from "../assets/cboi_logo.png";

export default function Topbar({ onToggleSidebar }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const { data: merchantData, loading } = useSelector((state) => state.merchant);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Auto-fetch profile using the token's embedded mobile number
  useEffect(() => {
    if (token && !merchantData) {
      const payload = decodeToken(token);
      const mobileNumber = payload?.preferred_username || payload?.user_name;
      
      console.log("Auto-Fetch Triggered. Extracted Mobile:", mobileNumber);
      
      if (mobileNumber) {
        dispatch(fetchMerchant({ mobile_number: mobileNumber }));
      } else {
        console.warn("Could not extract mobile number from token payload", payload);
      }
    }
  }, [token, merchantData, dispatch]);

  // Keep Redux data synced for merchant without screaming in console about expected Gateway errors
  const error = useSelector((state) => state.merchant.error);
  useEffect(() => {
     // Intentionally suppressing console error for tokenProperties since we use JWT fallback
  }, [merchantData, error]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const openProfile = () => {
    setIsProfileModalOpen(true);
    setMenuOpen(false);
  };

  // Safely extract merchant info for display
  const merchant = Array.isArray(merchantData?.data) 
    ? merchantData.data[0] 
    : (merchantData?.data || merchantData?.merchant || merchantData || null);
    
  // JWT Fallback
  const jwtPayload = token ? decodeToken(token) : null;
  const jwtName = jwtPayload?.name || jwtPayload?.given_name || jwtPayload?.preferred_username;
  
  const displayName = merchant?.merchant_name || merchant?.name || merchant?.merchName || jwtName || "Your Profile";
  // Generate initials for generic avatar fallback
  const avatarName = encodeURIComponent(displayName);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between pr-6 shrink-0 shadow-sm z-50 relative">
      <div className="flex items-center gap-4 h-full pl-5">
        {/* Logo: fills full header height, fixed width so it's visible and prominent */}
        <div className=" w-[200px] pt-2 shrink-0 overflow-hidden">
          <img
            src={logoImg}
            alt="Central Bank of India"
            className="h-full w-full object-cover object-left"
          />
        </div>
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 transition-colors rounded-md hover:bg-slate-50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white">
            9
          </span>
        </button>

        <div className="relative">
          <div 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 border-l border-gray-200 pl-6 cursor-pointer group"
          >
            <img 
              src={`https://ui-avatars.com/api/?name=${avatarName}&background=eff6ff&color=1d4ed8`} 
              alt="User" 
              className="w-8 h-8 rounded-full shadow-sm"
            />
            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
              {loading ? "Loading..." : displayName}
            </span>
          </div>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
              <button 
                onClick={openProfile}
                className="w-full text-left px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                View Profile
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 flex items-center gap-2"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        merchantData={merchant} 
      />
    </header>
  );
}
