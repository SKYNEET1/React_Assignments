import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import VpaModal from "./VpaModal";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <VpaModal />
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300">
        <Topbar isOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-6 overflow-y-auto bg-slate-50 relative border-t border-gray-100">
          <div className="max-w-6xl mx-auto pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
