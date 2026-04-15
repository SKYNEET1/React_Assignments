import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import logoImg from "../assets/cboi_logo.png";
import loadingIcon from "../assets/loading_logo.png";

const widgetItems = [
  { 
    path: "/dashboard", 
    label: "Dashboard", 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ) 
  },
  { 
    path: "/transaction-reports", 
    label: "Transaction Reports", 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ) 
  },
  { 
    path: "/qr-details", 
    label: "QR Details", 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ) 
  },
  { 
    path: "/language-update", 
    label: "Language Update", 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 17.5h3.498" />
      </svg>
    ) 
  },
];

export default function Sidebar({ isOpen }) {
  const location = useLocation();
  const [helpExpanded, setHelpExpanded] = useState(false);

  return (
    <aside 
      className={`h-full bg-white flex flex-col shrink-0 overflow-y-auto transition-all duration-300 shadow-[2px_0_10px_rgba(0,0,0,0.03)] z-50 ${
        isOpen ? "w-[240px]" : "w-[64px]"
      }`}
    >
      {/* Logo container */}
      <div className={`relative flex items-center shrink-0 border-b border-slate-100 transition-all duration-300 z-10 ${
        isOpen ? "w-[240px] px-3 h-[60px]" : "justify-center h-[60px] w-full"
      }`}>
        {isOpen ? (
          <img
            src={logoImg}
            alt="Central Bank of India"
            className="w-full h-auto object-contain"
          />
        ) : (
          <img
            src={loadingIcon}
            alt="CBOI Icon"
            className="w-8 h-8 object-contain shrink-0"
          />
        )}
      </div>

      <div className="flex-1">
        <nav className="space-y-1">
          {widgetItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={!isOpen ? item.label : undefined}
              className={({ isActive }) =>
                `group flex items-center py-4 text-[14px] font-medium transition-all duration-200 border-r-[3px] ${
                  isActive
                    ? "bg-[#f2f6fc] text-[#185bc5] border-[#185bc5]"
                    : "text-[#3e4c5e] hover:bg-slate-50 border-transparent"
                } ${!isOpen ? "justify-center px-0" : "pl-8 pr-4"}`
              }
            >
              <div className="flex items-center gap-4">
                <div className="shrink-0 text-[20px]">
                  {item.icon}
                </div>
                {isOpen && <span className="truncate">{item.label}</span>}
              </div>
            </NavLink>
          ))}

          {/* NavGroup: Help & Support Dropdown */}
          <div className="relative">
            <button
              onClick={() => isOpen && setHelpExpanded(!helpExpanded)}
              title={!isOpen ? "Help & Support" : undefined}
              className={`w-full flex items-center justify-between py-4 text-[14px] font-medium transition-all duration-200 border-r-[3px] ${
                helpExpanded && isOpen ? "text-[#185bc5] border-[#185bc5] bg-[#f2f6fc]" : "text-[#3e4c5e] hover:bg-slate-50 border-transparent"
              } ${!isOpen ? "justify-center px-0" : "pl-8 pr-4"}`}
            >
              <div className="flex items-center gap-4">
                <div className="shrink-0 text-[20px]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-[18px] h-[18px] ${helpExpanded && isOpen ? "text-[#185bc5]" : "text-[#3e4c5e]"}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {isOpen && <span>Help & Support</span>}
              </div>
              {isOpen && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-4 h-4 transition-transform duration-200 ${helpExpanded ? "rotate-180 text-[#185bc5]" : "text-[#8898aa]"}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {/* Dropdown Items (only when open) */}
            {helpExpanded && isOpen && (
              <div className="bg-slate-50/30 py-1">
                <NavLink
                  to="/raise-ticket"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-[45px] py-2.5 text-[12.5px] font-medium transition-all border-l-[3px] ${
                      isActive
                        ? "text-[#185bc5] border-[#185bc5] bg-[#eef5ff]"
                        : "text-slate-500 hover:text-slate-800 border-transparent"
                    }`
                  }
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px] shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Raise Ticket
                </NavLink>
                <NavLink
                  to="/view-tickets"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-[45px] py-2.5 text-[12.5px] font-medium transition-all border-l-[3px] ${
                      isActive
                        ? "text-[#185bc5] border-[#185bc5] bg-[#eef5ff]"
                        : "text-slate-500 hover:text-slate-800 border-transparent"
                    }`
                  }
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px] shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  View Tickets
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
}
