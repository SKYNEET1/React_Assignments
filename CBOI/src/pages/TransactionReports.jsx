import { useState } from "react";
import PageLoader from "../components/PageLoader";

export default function TransactionReports() {
  const [filter, setFilter] = useState("Today");
  const [search, setSearch] = useState("");

  // Placeholder: no data since no API available
  const transactions = [];

  const filtered = transactions.filter((t) =>
    t.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLoader>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">Transaction Reports</h1>
        </div>

        {/* Filter Section */}
        <div className="mb-5">
          <p className="text-sm text-slate-600 mb-3">
            Select a{" "}
            <span className="text-blue-600 font-medium">Report Filter</span>
          </p>
          <div className="flex items-center gap-6">
            {["Today", "Monthly", "Custom Range"].map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer group">
                <div
                  onClick={() => setFilter(option)}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    filter === option
                      ? "border-blue-600"
                      : "border-slate-300 group-hover:border-blue-400"
                  }`}
                >
                  {filter === option && (
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <span className="text-sm text-slate-600">{option}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-3 cursor-pointer hover:underline">
            Show {filter.toLowerCase()}'s transactions
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 mb-6" />

        {/* Table Controls */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search here..."
              className="text-sm text-slate-600 border border-slate-200 rounded-lg px-4 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-slate-300"
            />
            <button
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-colors"
              onClick={() => console.log("[TransactionReports.jsx:66] Download All clicked")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download All
            </button>
          </div>

          {/* Table Body */}
          <div className="min-h-[200px] flex items-center justify-center">
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-400 py-16">No results found</p>
            ) : (
              <table className="w-full text-sm text-slate-700">
                <tbody>
                  {filtered.map((txn) => (
                    <tr key={txn.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-5 py-3">{txn.id}</td>
                      <td className="px-5 py-3">{txn.amount}</td>
                      <td className="px-5 py-3">{txn.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </PageLoader>
  );
}
