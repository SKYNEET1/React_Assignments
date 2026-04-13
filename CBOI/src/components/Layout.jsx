import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import VpaModal from "./VpaModal";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <VpaModal />
      <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && <Sidebar />}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-50 relative">
          <div className="max-w-6xl mx-auto pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
