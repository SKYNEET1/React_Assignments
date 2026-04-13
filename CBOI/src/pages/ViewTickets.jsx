import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "../components/PageLoader";

const MOCK_TICKETS = Array(8).fill({
  id: "372817",
  vpa: "87288268@cnrb",
  serial: "738978927897923",
  type: "QR",
  subType: "Damaged QR",
  subject: "Damaged QR",
  date: "02-09-2025",
  status: "Solved"
}).map((t, i) => ({ ...t, status: i === 6 ? "New" : "Solved" }));

export default function ViewTickets() {
  const navigate = useNavigate();

  return (
    <PageLoader>
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-slate-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold text-slate-700">View Tickets</h1>
      </div>

      {/* Filter Row */}
      <div className="flex items-end gap-6 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
          <div className="relative">
            <input type="text" placeholder="21-07-2025" className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 absolute right-3 top-2.5 text-slate-400 pointer-events-none">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
          <div className="relative">
            <input type="text" placeholder="21-07-2025" className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 absolute right-3 top-2.5 text-slate-400 pointer-events-none">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-700 mb-2">Ticket Status</label>
          <select className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option>All</option>
            <option>Solved</option>
            <option>New</option>
          </select>
        </div>
        
        <div className="flex items-center gap-4 ml-4">
          <button className="px-8 py-2.5 bg-[#185bc5] text-white font-medium rounded-md hover:bg-blue-700 transition">Reset</button>
          <button className="px-8 py-2.5 bg-[#185bc5] text-white font-medium rounded-md hover:bg-blue-700 transition">Submit</button>
        </div>
      </div>

      {/* Table Actions */}
      <div className="flex items-center justify-between mt-8">
        <div className="relative w-80">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 absolute left-3 top-3.5 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search Here" className="w-full border border-slate-200 rounded-md pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" />
        </div>
        <button className="flex items-center gap-2 border border-slate-300 bg-white px-4 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
          Export To CSV
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
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
            {MOCK_TICKETS.map((ticket, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3.5 border-x border-slate-100">{ticket.id}</td>
                <td className="px-4 py-3.5 border-x border-slate-100">{ticket.vpa}</td>
                <td className="px-4 py-3.5 border-x border-slate-100">{ticket.serial}</td>
                <td className="px-4 py-3.5 border-x border-slate-100">{ticket.type}</td>
                <td className="px-4 py-3.5 border-x border-slate-100">{ticket.subType}</td>
                <td className="px-4 py-3.5 border-x border-slate-100">{ticket.subject}</td>
                <td className="px-4 py-3.5 border-x border-slate-100">{ticket.date}</td>
                <td className="px-4 py-3.5 border-x border-slate-100 flex justify-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-max ${ticket.status === 'Solved' ? 'bg-[#eefcf4] text-[#1f9d55] border border-[#1f9d55]/20' : 'bg-[#e0f2fe] text-[#0284c7] border border-[#0284c7]/20'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'Solved' ? 'bg-[#1f9d55]' : 'bg-[#0284c7]'}`}></span>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 border-x border-slate-100 text-center text-slate-400">
                  <button className="hover:text-slate-700">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mx-auto">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c-1.1 0-2 .9-2 2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
    </PageLoader>
  );
}
