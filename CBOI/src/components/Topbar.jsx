import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { fetchMerchant } from "../slices/merchantSlice";
import { decodeToken } from "../services/api";
import ProfileModal from "./ProfileModal";
import { RiMenuFold3Line, RiMenuUnfold3Line } from "react-icons/ri";

export default function Topbar({ isOpen, onToggleSidebar }) {
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

  const error = useSelector((state) => state.merchant.error);
  useEffect(() => {
  }, [merchantData, error]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const openProfile = () => {
    setIsProfileModalOpen(true);
    setMenuOpen(false);
  };

  const merchant = Array.isArray(merchantData?.data) 
    ? merchantData.data[0] 
    : (merchantData?.data || merchantData?.merchant || merchantData || null);
    
  const jwtPayload = token ? decodeToken(token) : null;
  const jwtName = jwtPayload?.name || jwtPayload?.given_name || jwtPayload?.preferred_username;
  
  const displayName = merchant?.merchant_name || merchant?.name || merchant?.merchName || jwtName || "Stebin Ben";
  const avatarName = encodeURIComponent(displayName);

  return (
    <header className="h-[60px] bg-white flex items-center justify-between px-6 shrink-0 z-40 relative">
      <div className="flex items-center h-full">
        <button 
          onClick={onToggleSidebar}
          title={isOpen ? "Collapse Menu" : "Expand Menu"}
          className="p-1 text-slate-600 hover:text-slate-800 transition-colors rounded-md hover:bg-slate-100"
        >
          {isOpen ? (
            <RiMenuFold3Line className="w-[22px] h-[22px]" />
          ) : (
            <RiMenuUnfold3Line className="w-[22px] h-[22px]" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <div 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img 
              src={`https://ui-avatars.com/api/?name=${avatarName}&background=4dabf7&color=fff&rounded=true&font-size=0.35&length=2`} 
              alt="User" 
              className="w-8 h-8 rounded-full"
            />
            <span className="text-[13.5px] font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
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
