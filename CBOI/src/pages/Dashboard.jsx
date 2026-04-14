import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { transactionReportAPI } from "../services/api";
import PageLoader from "../components/PageLoader";

function LargeStatCard({ label, value, icon, color = "blue" }) {
  const bgColors = {
    blue: "bg-blue-50/50",
    indigo: "bg-indigo-50/50",
  };
  const iconColors = {
    blue: "bg-blue-100 text-[#185bc5]",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  return (
    <div className="bg-white rounded-2xl p-8 flex items-center justify-between shadow-sm border border-slate-50 flex-1">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconColors[color]}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <span className="text-4xl font-bold text-slate-800">{value}</span>
    </div>
  );
}

export default function Dashboard() {
  const { selectedVpa, user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({ transactions: 0, amount: "0.00" });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("Today");

  useEffect(() => {
    async function fetchDashboardStats() {
      if (!selectedVpa) return;
      
      console.log(`[Dashboard.jsx:36] Fetching stats for VPA: ${selectedVpa} | Filter: ${filter}`);
      setLoading(true);

      const getFormattedDate = (offsetDays = 0) => {
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      };

      try {
        let sd = getFormattedDate(0); 
        let ed = getFormattedDate(0);

        if (filter === "Yesterday") {
          sd = getFormattedDate(-1);
          ed = getFormattedDate(-1);
        }

        const payload = { 
          startDate: sd,
          endDate: ed,
          vpa_id: selectedVpa, 
          mode: "both"
        };

        console.log("[Dashboard.jsx] Final Payload Prepared:", payload);

        const response = await transactionReportAPI(payload);
        console.log(`[Dashboard.jsx:41] Stats response for ${selectedVpa}:`, response.data);
        
        // Grab values directly from API response structure
        const totalAmountStr = response.data?.total_amount || 0;
        const totalRowsStr = response.data?.row_count || 0;

        const totalAmount = parseFloat(totalAmountStr) || 0;
        const accountCount = parseInt(totalRowsStr, 10) || 0;
        
        setStats({
          transactions: accountCount,
          amount: totalAmount.toFixed(2)
        });
      } catch (err) {
        console.error(`[Dashboard.jsx:49] Failed to fetch stats for ${selectedVpa}:`, err.message);
        setStats({ transactions: 0, amount: "0.00" });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, [selectedVpa, filter]);

  return (
    <PageLoader>
    <div className="animate-fade-in">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Dashboard</h1>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-slate-500 font-medium">VPA ID :</span>
            <span className="text-blue-600 font-semibold">{selectedVpa || "Not Selected"}</span>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="flex flex-col items-end gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pr-1">Filter Range</label>
          <select 
            className="flex items-center gap-3 px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-600 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex flex-col md:flex-row gap-6">
        <LargeStatCard
          label="Total No Of Transaction"
          value={loading ? "..." : stats.transactions}
          color="blue"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          }
        />
        <LargeStatCard
          label="Total Amount"
          value={loading ? "..." : stats.amount}
          color="indigo"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      </div>
      
      {/* Footer Log for visibility as requested */}
      <div className="mt-12 p-4 bg-slate-50 rounded-lg border border-slate-100">
        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          Dashboard Activity Log
        </p>
        <div className="space-y-1">
          <p className="text-[10px] text-slate-500 font-mono">
            {`[Dashboard.jsx:105] Stats rendered for VPA: ${selectedVpa} | Txns: ${stats.transactions} | Amt: ${stats.amount}`}
          </p>
        </div>
      </div>
    </div>
    </PageLoader>
  );
}