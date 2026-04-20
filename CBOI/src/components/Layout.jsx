import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import VpaModal from "./VpaModal";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    // Outer wrapper: locked to 1440px design width (260px sidebar + 1180px content)
    // min-h-[1024px] matches the full-page height spec
    <div
      className="flex overflow-hidden bg-slate-50"
      style={{ minWidth: '1440px', minHeight: '1024px', height: '100vh' }}
    >
      <VpaModal />
      {/* Sidebar: fixed 260px wide (variable when collapsed) */}
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      {/* Right panel: dynamic width based on sidebar state */}
      <div
        className="flex flex-col overflow-hidden transition-all duration-300"
        style={{ flex: 1, minHeight: '1024px', opacity: 1 }}
      >
        <Topbar isOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto bg-slate-50 relative border-t border-gray-100 flex flex-col items-center">
          <div 
            className="flex flex-col animate-fade-in"
            style={{ 
              width: '100%',
              maxWidth: '1320px',
              minWidth: '1128px',
              height: '770px', 
              gap: '10px', 
              padding: '14px 24px', 
              opacity: 1,
              transition: 'all 0.3s ease'
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
