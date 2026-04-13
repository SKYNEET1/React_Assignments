import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PageLoader from "../components/PageLoader";

const ISSUE_TYPES = ["Hardware", "Software", "Network", "Payment", "Other"];

const ISSUE_SUB_TYPES = {
  Hardware: ["Device Not Working", "Battery Issue", "Display Problem", "Speaker Issue"],
  Software: ["App Crash", "Update Failed", "Configuration Error", "Login Issue"],
  Network: ["No Internet", "Slow Connection", "VPN Issue"],
  Payment: ["QR Damaged", "Transaction Failed", "Settlement Issue"],
  Other: ["General Query", "Feedback"],
};

export default function RaiseTicket() {
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const { selectedVpa } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [issueSubType, setIssueSubType] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [callType, setCallType] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);

  const subTypes = issueType ? (ISSUE_SUB_TYPES[issueType] || []) : [];

  const handleIssueTypeChange = (e) => {
    setIssueType(e.target.value);
    setIssueSubType("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setAttachedFile(file);
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleCancel = () => {
    setIssueType("");
    setIssueSubType("");
    setSubject("");
    setDescription("");
    setPhone("");
    setCallType("");
    setAttachedFile(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + "KB";
    return (bytes / (1024 * 1024)).toFixed(1) + "MB";
  };

  return (
    <PageLoader>
      <div className="min-h-[80vh] flex flex-col items-center animate-fade-in">

        {/* Top Bar: Back + Contact Info */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition shadow-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div className="flex items-center gap-6 bg-white border border-slate-100 shadow-sm rounded-full px-6 py-2.5 text-[13px] font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Merchant Support No. : 9124573230
            </div>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email : cboisupport@iserveu.in
            </div>
          </div>

          {/* Spacer to balance the back button */}
          <div className="w-9" />
        </div>

        {/* Main Form Card */}
        <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          {/* Card Title */}
          <div className="flex items-center gap-2 mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-slate-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h2 className="text-base font-bold text-slate-800">Raise a Ticket</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Subject */}
            <div>
              <label className="block text-sm text-slate-700 mb-1.5">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter Subject"
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-slate-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                placeholder="Any additional details..."
                required
                rows={4}
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">Describe your issue within 300 characters</p>
            </div>

            {/* VPA Id */}
            <div>
              <label className="block text-sm text-slate-700 mb-1.5">
                VPA Id <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={selectedVpa || ""}
                readOnly
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-400 bg-slate-50 cursor-not-allowed focus:outline-none"
                placeholder="Enter VPA Id"
              />
            </div>

            {/* Issue Type */}
            <div>
              <label className="block text-sm text-slate-700 mb-1.5">
                Issue Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={issueType}
                  onChange={handleIssueTypeChange}
                  required
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition appearance-none bg-white"
                >
                  <option value="">Select Issue Type</option>
                  {ISSUE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Issue Sub Type */}
            <div>
              <label className="block text-sm text-slate-700 mb-1.5">
                Issue Sub-type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={issueSubType}
                  onChange={(e) => setIssueSubType(e.target.value)}
                  required
                  disabled={!issueType}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition appearance-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">Select Issue Sub-type</option>
                  {subTypes.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Phone number */}
            <div>
              <label className="block text-sm text-slate-700 mb-1.5">
                Phone number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Enter Phone number"
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
              />
            </div>

            {/* Call Type */}
            <div>
              <label className="block text-sm text-slate-700 mb-1.5">
                Call Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={callType}
                onChange={(e) => setCallType(e.target.value)}
                placeholder="Enter Call Type"
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
              />
            </div>

            {/* Attachment */}
            <div>
              <label className="block text-sm text-slate-700 mb-1.5">Attachment</label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                id="raise_ticket_file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="raise_ticket_file"
                className="w-full flex items-center gap-3 border border-dashed border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-400 cursor-pointer hover:bg-slate-50 transition"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Please Add Attachment
              </label>

              {/* Attached file row */}
              {attachedFile && (
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center text-[10px] font-bold shrink-0">
                    {attachedFile.name.split(".").pop().toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{attachedFile.name}</p>
                    <p className="text-[10px] text-slate-400">Just now</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
                    {formatFileSize(attachedFile.size)}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition shrink-0"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
              <button
                type="button"
                onClick={handleCancel}
                className="px-7 py-2.5 bg-white border border-slate-300 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-[#a31b2b] text-white text-sm font-semibold rounded-lg hover:bg-[#851320] transition"
              >
                Submit
              </button>
            </div>
          </form>
        </div>

        {/* Success Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-[380px] overflow-hidden text-center pb-8 pt-10 px-8 relative animate-slide-up">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-300 hover:text-slate-500"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Checkmark icon */}
              <div className="w-16 h-16 mx-auto mb-5 bg-green-50 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8 text-green-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2">Ticket Created!</h3>
              <p className="text-sm text-slate-500 mb-8">
                Your ticket has been submitted. Track it with ID:{" "}
                <span className="font-semibold text-blue-600">#{Math.floor(10000 + Math.random() * 90000)}</span>
              </p>

              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-[#185bc5] text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLoader>
  );
}
