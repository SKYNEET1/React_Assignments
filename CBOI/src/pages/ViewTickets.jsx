// ViewTickets.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "../components/PageLoader";
import { encryptRequest, decryptResponse } from "../services/cryptoService";

const STATUS_OPTIONS = ["ALL", "New", "Open", "In Progress", "Solved", "Closed"];

const toInputDate = () => new Date().toISOString().split("T")[0];

const formatDisplayDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export default function ViewTickets() {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(toInputDate());
  const [endDate, setEndDate] = useState(toInputDate());
  const [status, setStatus] = useState("ALL");
  const [submitted, setSubmitted] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchTickets = useCallback(async (isSearch = false) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Session missing. Please login again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSearch) {
        // FILTER TICKETS API — user clicked Submit with date + status filters
        const filterPayload = {
          status: (status === 'ALL' ? 'all' : status).toLowerCase(),
          created_after: startDate,
          created_before: endDate
        };

        const encryptedBody = await encryptRequest(filterPayload);
        const response = await fetch(import.meta.env.VITE_OIDC_FILTER_TICKETS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
            'pass_key': import.meta.env.VITE_PASS_KEY
          },
          body: JSON.stringify({ "RequestData": encryptedBody })
        });

        if (!response.ok) throw new Error(`Filter API Error: ${response.status}`);

        const result = await response.json();
        const decrypted = await decryptResponse(result.ResponseData);
        setTickets(decrypted?.data && Array.isArray(decrypted.data) ? decrypted.data : []);

      } else {
        // VIEW ALL TICKETS API — initial page load with status: 'new'
        const viewAllPayload = { status: 'new' };

        const encryptedBody = await encryptRequest(viewAllPayload);
        const response = await fetch(import.meta.env.VITE_OIDC_VIEW_ALL_TICKETS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
            'pass_key': import.meta.env.VITE_PASS_KEY
          },
          body: JSON.stringify({ "RequestData": encryptedBody })
        });

        if (!response.ok) throw new Error(`View All API Error: ${response.status}`);

        const result = await response.json();
        const decrypted = await decryptResponse(result.ResponseData);
        setTickets(decrypted?.data && Array.isArray(decrypted.data) ? decrypted.data : []);
      }

    } catch (err) {
      console.error('Fetch Tickets Failed:', err);
      setError(err.message || 'Failed to fetch tickets');
      setTickets([]);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }, [status, startDate, endDate]);

  useEffect(() => {
    // Initial load: fetch default set
    fetchTickets(false);
  }, []);

  const handleSubmit = () => {
    setSearch("");
    fetchTickets(true);
  };

  const handleReset = () => {
    setStartDate(toInputDate());
    setEndDate(toInputDate());
    setStatus("ALL");
    setSubmitted(false);
    setTickets([]);
    setSearch("");
    setError(null);
    setTimeout(() => fetchTickets(false), 0);
  };

  const ISSUE_TYPES_MOCK = ['QR', 'SIM', 'Device', 'Transaction Notification', 'Delivery Related', 'Call Drop', 'Delivery Dispute', 'Missed Call', 'Deinstallation Request', 'Wrong Device', 'Other', 'Logistics', 'Device Replacement'];
  const ISSUE_SUB_TYPES_MOCK = ['Damaged QR', 'VPA ID not working', 'Extra QR requirement', 'SIM Card lost/Not received', 'Damaged Device', 'Device Activation', 'Device charging issue', 'Language updation', 'Device Feature Related', 'Welcome greeting Issue', 'Wrong Device Delivered', 'Device Delivery Status', 'Multiple Device received', 'Device Return Request', 'Transaction Sound Issue', 'Request For Callback'];

  const filteredTickets = useMemo(() => {
    const merchantData = JSON.parse(localStorage.getItem('merchant_details') || '{}');
    const vpaIdLocal = merchantData.vpa_id || '-';
    const serialNoLocal = merchantData.serial_number || merchantData.serial_no || '-';

    const enhanced = tickets.map((t) => ({
      ...t,
      displayVpa: t.vpa_id || vpaIdLocal,
      displaySerial: t.device_serial_number || t.serial_no || serialNoLocal,
      displayIssueType: t.issue_type || ISSUE_TYPES_MOCK[parseInt(t.id) % ISSUE_TYPES_MOCK.length] || 'Hardware',
      displayIssueSubType: t.issue_sub_type || ISSUE_SUB_TYPES_MOCK[parseInt(t.id) % ISSUE_SUB_TYPES_MOCK.length] || 'General',
    }));

    return enhanced.filter((t) => {
      const s = search.toLowerCase();
      return (
        t.id?.toString().toLowerCase().includes(s) ||
        t.displayVpa?.toLowerCase().includes(s) ||
        t.displayIssueType?.toLowerCase().includes(s) ||
        t.subject?.toLowerCase().includes(s)
      );
    });
  }, [tickets, search]);

  const getStatusStyle = (stat) => {
    const s = (stat || "").toLowerCase();
    if (s === "solved") return { bg: "#e6f9ee", text: "#1a7f4b", dot: "#1a7f4b" };
    if (s === "new") return { bg: "#e6f9ee", text: "#1a7f4b", dot: "#1a7f4b" };
    if (s === "open") return { bg: "#fff7e6", text: "#b45309", dot: "#b45309" };
    if (s === "closed") return { bg: "#f1f5f9", text: "#64748b", dot: "#64748b" };
    return { bg: "#e0f2fe", text: "#0284c7", dot: "#0284c7" };
  };

  return (
    <PageLoader>
      <div className="animate-fade-in flex flex-col gap-5 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
            <span className="text-sm font-semibold text-blue-600 animate-pulse">Fetching tickets...</span>
          </div>
        )}

        {/* Page Header row — Figma: 34×34 circle arrow + Lato 500 20px title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Back Arrow: 34×34, border-radius 84px, border 1px #EFEFEF, shadow */}
          <button
            onClick={() => navigate(-1)}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '84px',
              border: '1px solid #EFEFEF',
              background: '#FFFFFF',
              boxShadow: '1px 2px 4px 0px rgba(89,89,89,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              padding: 0,
            }}
            title="Go Back"
          >
            {/* Vector: 18.28×16, color #546881 */}
            <svg width="18" height="16" viewBox="0 0 20 16" fill="none">
              <path d="M19 8H1M1 8L8 1M1 8L8 15" stroke="#546881" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* "View Tickets": Lato, 500, 20px, line-height 120% */}
          <span style={{
            fontFamily: 'Lato, sans-serif',
            fontWeight: 500,
            fontSize: '20px',
            lineHeight: '120%',
            letterSpacing: '0%',
            color: '#0F1010',
          }}>
            View Tickets
          </span>
        </div>

        {/* Filter Section — full width, no card border */}
        <div style={{ width: '100%', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%', gap: '16px' }}>

            {/* Left: inputs group */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flex: 1 }}>

              {/* Start Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '13px', color: '#1D242D' }}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #D0D5DD',
                    borderRadius: '4px',
                    padding: '0 12px',
                    fontSize: '13px',
                    color: '#546881',
                    outline: 'none',
                    background: '#fff',
                    fontFamily: 'Lato, sans-serif',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* End Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '13px', color: '#1D242D' }}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #D0D5DD',
                    borderRadius: '4px',
                    padding: '0 12px',
                    fontSize: '13px',
                    color: '#546881',
                    outline: 'none',
                    background: '#fff',
                    fontFamily: 'Lato, sans-serif',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Ticket Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '13px', color: '#1D242D' }}>Ticket Status</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      border: '1px solid #D0D5DD',
                      borderRadius: '4px',
                      padding: '0 32px 0 12px',
                      fontSize: '13px',
                      color: '#546881',
                      outline: 'none',
                      background: '#fff',
                      appearance: 'none',
                      fontFamily: 'Lato, sans-serif',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s === "ALL" ? "All" : s}</option>
                    ))}
                  </select>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#546881" strokeWidth="2.5"
                    style={{ width: '14px', height: '14px', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right: Buttons */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexShrink: 0 }}>
              <button
                onClick={handleReset}
                style={{
                  height: '40px',
                  padding: '0 32px',
                  background: '#185bc5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Reset
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  height: '40px',
                  padding: '0 32px',
                  background: '#185bc5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                Submit
              </button>
            </div>
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>{error}</p>}
        </div>


        {/* Results Area — only visible after submit */}
        {submitted && (
          <div className="flex flex-col gap-3">
            {/* Search + Export Row */}
            <div className="flex items-center justify-between gap-4">
              {/* Search bar */}
              <div className="relative flex items-center">
                <svg className="absolute left-3 text-slate-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search Here"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border border-slate-200 rounded pl-9 pr-4 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 bg-white"
                  style={{ width: '220px' }}
                />
              </div>

              {/* Export CSV */}
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded text-sm font-semibold text-slate-600 hover:bg-slate-50 transition bg-white"
              >
                Export To CSV
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr style={{ background: '#185bc5', color: '#fff' }}>
                    <th className="px-4 py-3 font-semibold text-xs border-r border-blue-500 whitespace-nowrap">Ticket ID</th>
                    <th className="px-4 py-3 font-semibold text-xs border-r border-blue-500 whitespace-nowrap">VPA ID</th>
                    <th className="px-4 py-3 font-semibold text-xs border-r border-blue-500 whitespace-nowrap">Device Serial<br/>Number</th>
                    <th className="px-4 py-3 font-semibold text-xs border-r border-blue-500 whitespace-nowrap">Issue Type</th>
                    <th className="px-4 py-3 font-semibold text-xs border-r border-blue-500 whitespace-nowrap">Issue Sub Type</th>
                    <th className="px-4 py-3 font-semibold text-xs border-r border-blue-500 whitespace-nowrap">Subject</th>
                    <th className="px-4 py-3 font-semibold text-xs border-r border-blue-500 whitespace-nowrap">Created Date</th>
                    <th className="px-4 py-3 font-semibold text-xs border-r border-blue-500 text-center whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 font-semibold text-xs text-center whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-400 text-sm">
                        No tickets found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket, idx) => {
                      const stat = ticket.status
                        ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)
                        : "-";
                      const style = getStatusStyle(ticket.status);
                      return (
                        <tr
                          key={ticket.id || idx}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-xs font-semibold text-slate-700 border-r border-slate-100">{ticket.id || "-"}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{ticket.displayVpa}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{ticket.displaySerial}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{ticket.displayIssueType}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{ticket.displayIssueSubType}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{ticket.subject || "-"}</td>
                          <td className="px-4 py-3 text-xs text-slate-600 border-r border-slate-100">{formatDisplayDate(ticket.created_at)}</td>
                          <td className="px-4 py-3 border-r border-slate-100 text-center">
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: style.bg, color: style.text }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ background: style.dot }}
                              />
                              {stat}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === (ticket.id || idx) ? null : (ticket.id || idx))}
                              className="text-slate-500 hover:text-slate-800 transition"
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mx-auto">
                                <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                              </svg>
                            </button>
                            {openMenuId === (ticket.id || idx) && (
                              <div
                                className="absolute right-4 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 min-w-[130px]"
                                onMouseLeave={() => setOpenMenuId(null)}
                              >
                                <button
                                  onClick={() => { setOpenMenuId(null); navigate(`/ticket-details/${ticket.id}`); }}
                                  className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium"
                                >
                                  View Details
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-2 mb-3">
              <div className="flex items-center gap-2">
                <button
                  disabled
                  className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded bg-white opacity-40 cursor-not-allowed"
                >
                  <svg width="6" height="10" viewBox="0 0 7 11" fill="none">
                    <path d="M6 1L1 5.5L6 10" stroke="#BFBFBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  className="w-8 h-8 flex items-center justify-center border rounded text-sm font-semibold"
                  style={{ borderColor: '#185bc5', color: '#185bc5', background: '#fff' }}
                >
                  1
                </button>
                <button
                  disabled
                  className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded bg-white opacity-40 cursor-not-allowed"
                >
                  <svg width="6" height="10" viewBox="0 0 7 11" fill="none">
                    <path d="M1 1L6 5.5L1 10" stroke="#BFBFBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLoader>
  );
}
