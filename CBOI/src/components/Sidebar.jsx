import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import CboiLogo from "./CboiLogo";

const widgetItems = [
  { 
    path: "/dashboard", 
    label: "Dashboard", 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ) 
  },
  { 
    path: "/transaction-reports", 
    label: "Transaction Reports", 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ) 
  },
  { 
    path: "/qr-details", 
    label: "QR Details", 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ) 
  },
  { 
    path: "/language-update", 
    label: "Language Update", 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 17.5h3.498" />
      </svg>
    ) 
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [helpExpanded, setHelpExpanded] = useState(false);

  return (
    <aside className="w-[300px] h-full bg-white border-r border-gray-100 flex flex-col shrink-0 overflow-y-auto">
      <div className="flex-1 py-4">
        <nav className="space-y-1">
          {widgetItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center justify-between px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50/50 text-blue-600 border-r-4 border-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <div className="flex items-center gap-4">
                <div className="text-current">
                  {item.icon}
                </div>
                {item.label}
              </div>
            </NavLink>
          ))}

          {/* NavGroup: Help & Support Dropdown */}
          <div className="space-y-1">
            <button
              onClick={() => setHelpExpanded(!helpExpanded)}
              className={`w-full flex items-center justify-between px-6 py-4 text-sm font-medium transition-all duration-200 ${
                helpExpanded ? "text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Question mark circle icon */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-slate-500">
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
                </svg>
                Help &amp; Support
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${helpExpanded ? "rotate-180" : ""}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {helpExpanded && (
              <div className="py-1">
                {/* Raise Ticket */}
                <NavLink
                  to="/raise-ticket"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-8 py-3 text-[13px] font-medium transition-all ${
                      isActive
                        ? "text-blue-600 border-r-4 border-blue-600 bg-blue-50/50"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`
                  }
                >
                  {/* Arrow/raise icon */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                  </svg>
                  Raise Ticket
                </NavLink>

                {/* View Tickets */}
                <NavLink
                  to="/view-tickets"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-8 py-3 text-[13px] font-medium transition-all ${
                      isActive
                        ? "text-blue-600 border-r-4 border-blue-600 bg-blue-50/50"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`
                  }
                >
                  {/* Ticket/document icon */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px] shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
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
