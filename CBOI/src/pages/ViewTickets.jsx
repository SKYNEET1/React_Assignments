// ViewTickets.jsx
import React, { useState } from "react";
import PageLoader from "../components/PageLoader";

const STATUS_OPTIONS = ["ALL", "New", "Open", "In Progress", "Solved", "Closed"];

const todayStr = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const toInputDate = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

export default function ViewTickets() {
  // [ViewTickets.jsx:18]
  const [status, setStatus] = useState("ALL");
  const [startDate, setStartDate] = useState(toInputDate());
  const [endDate, setEndDate] = useState(toInputDate());
  const [submitted, setSubmitted] = useState(false);
  const [tickets, setTickets] = useState([]);

  const handleSubmit = () => {
    // [ViewTickets.jsx:27] — filter logic hook point
    console.log("[ViewTickets.jsx:27] Submitting filter:", { status, startDate, endDate });
    setSubmitted(true);
    setTickets([]); // Replace with real API call
  };

  const handleReset = () => {
    // [ViewTickets.jsx:33]
    setStatus("ALL");
    setStartDate(toInputDate());
    setEndDate(toInputDate());
    setSubmitted(false);
    setTickets([]);
  };

  const formatDisplayDate = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <PageLoader>
      {/* [ViewTickets.jsx:47] */}
      <div className="animate-fade-in space-y-0">

        {/* Page Header */}
        <div className="flex items-center gap-2 mb-5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-slate-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-base font-bold text-slate-800">Help &amp; Support</h1>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-5">
          <div className="flex items-end gap-5 flex-wrap">

            {/* Select Status */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Status</label>
              <div className="relative">
                <select
                  id="vt_status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none appearance-none bg-white pr-8"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Start Date */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
              <div className="relative">
                <input
                  id="vt_start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
              <div className="relative">
                <input
                  id="vt_end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pb-0.5">
              <button
                id="vt_submit_btn"
                onClick={handleSubmit}
                className="px-7 py-2.5 bg-[#185bc5] text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition"
              >
                Submit
              </button>
              <button
                id="vt_reset_btn"
                onClick={handleReset}
                className="px-7 py-2.5 bg-[#185bc5] text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        {submitted && tickets.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            {/* Illustration */}
            <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 opacity-90">
              {/* Sky / ground blobs */}
              <ellipse cx="100" cy="145" rx="80" ry="12" fill="#dbeafe" opacity="0.5"/>
              {/* Back blob */}
              <ellipse cx="80" cy="110" rx="60" ry="50" fill="#bfdbfe" opacity="0.5"/>
              {/* Dome top */}
              <ellipse cx="80" cy="68" rx="38" ry="38" fill="#93c5fd" opacity="0.7"/>
              <rect x="44" y="68" width="72" height="10" rx="2" fill="#93c5fd" opacity="0.5"/>
              {/* Question mark circle */}
              <circle cx="80" cy="72" r="18" fill="white" opacity="0.85"/>
              <text x="80" y="79" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#3b82f6">?</text>
              {/* Person silhouette */}
              <circle cx="148" cy="75" r="14" fill="#93c5fd"/>
              <ellipse cx="148" cy="108" rx="18" ry="28" fill="#60a5fa"/>
              {/* Person hair */}
              <ellipse cx="148" cy="67" rx="10" ry="6" fill="#1e3a5f"/>
              {/* Person face */}
              <circle cx="148" cy="76" r="10" fill="#fcd9b6"/>
              {/* Arm extended */}
              <line x1="131" y1="100" x2="110" y2="85" stroke="#60a5fa" strokeWidth="7" strokeLinecap="round"/>
            </svg>
            <p className="text-slate-400 text-sm">No tickets found for the selected filters.</p>
          </div>
        ) : !submitted ? (
          /* Default idle state illustration */
          <div className="flex flex-col items-center justify-center py-20">
            <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 opacity-90">
              <ellipse cx="100" cy="145" rx="80" ry="12" fill="#dbeafe" opacity="0.5"/>
              <ellipse cx="80" cy="110" rx="60" ry="50" fill="#bfdbfe" opacity="0.5"/>
              <ellipse cx="80" cy="68" rx="38" ry="38" fill="#93c5fd" opacity="0.7"/>
              <rect x="44" y="68" width="72" height="10" rx="2" fill="#93c5fd" opacity="0.5"/>
              <circle cx="80" cy="72" r="18" fill="white" opacity="0.85"/>
              <text x="80" y="79" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#3b82f6">?</text>
              <circle cx="148" cy="75" r="14" fill="#93c5fd"/>
              <ellipse cx="148" cy="108" rx="18" ry="28" fill="#60a5fa"/>
              <ellipse cx="148" cy="67" rx="10" ry="6" fill="#1e3a5f"/>
              <circle cx="148" cy="76" r="10" fill="#fcd9b6"/>
              <line x1="131" y1="100" x2="110" y2="85" stroke="#60a5fa" strokeWidth="7" strokeLinecap="round"/>
            </svg>
            <p className="text-slate-400 text-sm">Select filters and click Submit to view tickets.</p>
          </div>
        ) : (
          /* Ticket Table */
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mt-5">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#185bc5] text-white font-medium text-[13px]">
                <tr>
                  <th className="px-4 py-4 font-medium border-x border-blue-600">Ticket ID</th>
                  <th className="px-4 py-4 font-medium border-x border-blue-600">VPA ID</th>
                  <th className="px-4 py-4 font-medium border-x border-blue-600">Device Serial Number</th>
                  <th className="px-4 py-4 font-medium border-x border-blue-600">Issue Type</th>
                  <th className="px-4 py-4 font-medium border-x border-blue-600">Issue Sub Type</th>
                  <th className="px-4 py-4 font-medium border-x border-blue-600">Subject</th>
                  <th className="px-4 py-4 font-medium border-x border-blue-600">Created Date</th>
                  <th className="px-4 py-4 font-medium border-x border-blue-600 text-center">Status</th>
                  <th className="px-4 py-4 font-medium border-x border-blue-600 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 text-[13px] font-medium">
                {tickets.map((ticket, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 border-x border-slate-100">{ticket.id}</td>
                    <td className="px-4 py-3.5 border-x border-slate-100">{ticket.vpa}</td>
                    <td className="px-4 py-3.5 border-x border-slate-100">{ticket.serial}</td>
                    <td className="px-4 py-3.5 border-x border-slate-100">{ticket.type}</td>
                    <td className="px-4 py-3.5 border-x border-slate-100">{ticket.subType}</td>
                    <td className="px-4 py-3.5 border-x border-slate-100">{ticket.subject}</td>
                    <td className="px-4 py-3.5 border-x border-slate-100">{ticket.date}</td>
                    <td className="px-4 py-3.5 border-x border-slate-100 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-max ${
                        ticket.status === "Solved"
                          ? "bg-[#eefcf4] text-[#1f9d55] border border-[#1f9d55]/20"
                          : "bg-[#e0f2fe] text-[#0284c7] border border-[#0284c7]/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ticket.status === "Solved" ? "bg-[#1f9d55]" : "bg-[#0284c7]"}`} />
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-x border-slate-100 text-center text-slate-400">
                      <button className="hover:text-slate-700">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mx-auto">
                          <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLoader>
  );
}
