// ViewTickets.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "../components/PageLoader";
import { encryptRequest, decryptResponse } from "../services/cryptoService";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import NoTicketImg from "../assets/NoTicket.png";

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

  const fetchTickets = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Session missing. Please login again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
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

      if (!response.ok) throw new Error(`Fetch Error: ${response.status}`);

      const result = await response.json();
      const decrypted = await decryptResponse(result.ResponseData);
      
      // Handle response structure: some APIs return { data: [...] }, some return the array directly
      const data = decrypted?.data || decrypted;
      setTickets(Array.isArray(data) ? data : []);

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
    fetchTickets();
  }, []);

  const handleSubmit = () => {
    setSearch("");
    fetchTickets();
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

  const handleExportCSV = () => {
    if (filteredTickets.length === 0) return;

    const dataToExport = filteredTickets.map((t) => ({
      'TICKET ID': t.id || '-',
      'VPA ID': t.displayVpa || '-',
      'DEVICE SERIAL NUMBER': t.displaySerial || '-',
      'ISSUE TYPE': t.displayIssueType || '-',
      'ISSUE SUB TYPE': t.displayIssueSubType || '-',
      'SUBJECT': t.subject || '-',
      'CREATED DATE': t.created_at ? new Date(t.created_at).toLocaleDateString() : '-',
      'STATUS': t.status || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Tickets_${dateStr}.csv`, { bookType: 'csv' });
  };

  const handleDownloadTicket = (ticket) => {
    if (!ticket) return;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59); // Dark blue text
    doc.text(`${ticket.id} Ticket Information`, 20, 25);

    // Line Separator
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 30, 190, 30);

    // Details
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // Gray text

    const details = [
      { label: 'Ticket ID', value: ticket.id || '-' },
      { label: 'Created At', value: ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '-' },
      { label: 'VPA ID', value: ticket.displayVpa || '-' },
      { label: 'Serial Number', value: ticket.displaySerial || '-' },
      { label: 'Subject', value: ticket.subject || '-' },
      { label: 'Status', value: String(ticket.status).toUpperCase() || '-' }
    ];

    let yPos = 45;
    details.forEach(detail => {
      doc.setFont(undefined, 'bold');
      doc.text(`${detail.label}:`, 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(`${detail.value}`, 60, yPos);
      yPos += 12;
    });

    doc.save(`${ticket.id}_Ticket_Information.pdf`);
    setOpenMenuId(null);
  };

  const getStatusStyle = (stat) => {
    const s = (stat || "").toLowerCase();
    if (s === "solved") return { bg: "#e6f9ee", text: "#1a7f4b", dot: "#1a7f4b" };
    if (s === "new") return { bg: "#e6f9ee", text: "#1a7f4b", dot: "#1a7f4b" };
    if (s === "open") return { bg: "#fff7e6", text: "#b45309", dot: "#b45309" };
    if (s === "closed") return { bg: "#f1f5f9", text: "#64748b", dot: "#64748b" };
    return { bg: "#e0f2fe", text: "#0284c7", dot: "#0284c7" };
  };

  return (
    <PageLoader loading={loading}>
      <div className="animate-fade-in flex flex-col gap-5 relative">

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
          <div style={{ width: '1128px', display: 'flex', flexDirection: 'column', gap: '0px', margin: '0 auto' }}>

            {/* ── Table Toolbar: 1128×72, pad 16 ── */}
            {filteredTickets.length > 0 && (
              <div style={{
                width: '1128px',
                height: '72px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#FFFFFF',
                boxSizing: 'border-box',
                borderBottom: '1px solid #F0F0F0',
              }}>
                {/* Search input — FIGMA: 180×40, border #D9D9D9, radius 4, pad 8 24 8 12 */}
                <div style={{ position: 'relative', width: '180px', height: '40px', flexShrink: 0 }}>
                  <svg
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#BFBFBF' }}
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Enter Username"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: '180px',
                      height: '40px',
                      boxSizing: 'border-box',
                      border: '1px solid #D9D9D9',
                      borderRadius: '4px',
                      paddingTop: '8px',
                      paddingBottom: '8px',
                      paddingLeft: '34px',
                      paddingRight: '24px',
                      fontSize: '14px',
                      fontFamily: '"Public Sans", sans-serif',
                      fontWeight: 400,
                      lineHeight: '22px',
                      color: '#262626',
                      background: '#FFFFFF',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Export CSV */}
                <button
                  onClick={handleExportCSV}
                  style={{
                    height: '40px',
                    padding: '0 16px',
                    border: '1px solid #D9D9D9',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 500,
                    fontFamily: '"Public Sans", sans-serif',
                    color: '#262626',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  Export To CSV
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </div>
            )}

            {/* ── Empty State ── */}
            {filteredTickets.length === 0 ? (
              <div style={{
                width: '1128px',
                height: '494px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#FFFFFF',
                borderRadius: '4px',
                border: '1px solid #D9D9D9',
                boxSizing: 'border-box',
              }}>
                <img src={NoTicketImg} alt="No Tickets Found" style={{ width: '240px', objectFit: 'contain' }} />
                <h3 style={{ fontFamily: '"Public Sans", sans-serif', fontSize: '18px', fontWeight: 600, color: '#185bc5', marginTop: '16px' }}>
                  No Tickets Found!
                </h3>
              </div>
            ) : (
              <>
                {/* ── Table Container: Width 1128, Height 494, border #D9D9D9 ── */}
                <div style={{
                  width: '1128px',
                  height: '494px',
                  borderRadius: '4px',
                  border: '1px solid #D9D9D9',
                  background: '#FFFFFF',
                  overflow: 'auto',
                  boxSizing: 'border-box',
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                      <tr>
                        {[
                          { label: 'Transaction ID', w: 180 },
                          { label: 'Raised On', w: 200 },
                          { label: 'Number', w: 180 },
                          { label: 'Operation', w: 220 },
                          { label: 'Status', w: 164 },
                          { label: 'Action', w: 184 },
                        ].map(({ label, w }, i, arr) => (
                          <th
                            key={label}
                            style={{
                              width: `${w}px`,
                              minWidth: `${w}px`,
                              height: '70px',
                              background: '#FAFAFA',
                              fontFamily: '"Public Sans", sans-serif',
                              fontWeight: 500,
                              fontSize: '14px',
                              lineHeight: '22px',
                              color: '#262626',
                              paddingTop: '24px',
                              paddingBottom: '24px',
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              whiteSpace: 'nowrap',
                              textAlign: 'left',
                              borderBottom: '1px solid #F0F0F0',
                              borderRight: i < arr.length - 1 ? '1px solid #F0F0F0' : 'none',
                              boxSizing: 'border-box',
                              verticalAlign: 'middle',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {label}
                              <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px', opacity: 0.6 }}>
                                <svg width="8" height="4" viewBox="0 0 8 5" fill="none"><path d="M0.907837 4.14286L3.98855 0.857147L7.06926 4.14286" stroke="#D9D9D9" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                <svg width="8" height="4" viewBox="0 0 8 5" fill="none"><path d="M0.907837 0.857147L3.98855 4.14286L7.06926 0.857147" stroke="#D9D9D9" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((ticket, idx) => {
                        const statRaw = (ticket.status || '').toLowerCase();
                        const statLabel = ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : '-';
                        const statusTag = (() => {
                          if (statRaw === 'pending') return { bg: '#FC80361F', color: '#FC8036' };
                          if (statRaw === 'resolved' || statRaw === 'solved' || statRaw === 'new') return { bg: '#52C41A1F', color: '#52C41A' };
                          if (statRaw === 'open') return { bg: '#1890FF1F', color: '#1890FF' };
                          if (statRaw === 'closed') return { bg: '#00000014', color: '#595959' };
                          if (statRaw === 'in progress') return { bg: '#FAAD141F', color: '#FAAD14' };
                          return { bg: '#E6F7FF', color: '#1890FF' };
                        })();
                        
                        const tdStyle = { 
                          height: '70px', 
                          padding: '17px 16px', 
                          fontFamily: '"Public Sans", sans-serif', 
                          fontSize: '14px', 
                          color: '#262626', 
                          borderBottom: '1px solid #F0F0F0', 
                          borderRight: '1px solid #F0F0F0', 
                          boxSizing: 'border-box',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        };

                        return (
                          <tr
                            key={ticket.id || idx}
                            style={{ height: '70px' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <td style={tdStyle}>{ticket.id || '-'}</td>
                            <td style={tdStyle}>{formatDisplayDate(ticket.created_at)}</td>
                            <td style={tdStyle}>{ticket.registeredMobile || ticket.customer_number || ticket.mobile || '-'}</td>
                            <td style={tdStyle}>{ticket.displayIssueType || '-'}</td>
                            <td style={{ ...tdStyle }}>
                              <span style={{ display: 'inline-block', borderRadius: '4px', padding: '1px 8px', background: statusTag.bg, fontFamily: '"Public Sans", sans-serif', fontSize: '12px', lineHeight: '20px', color: statusTag.color }}>{statLabel}</span>
                            </td>
                            <td style={{ ...tdStyle, borderRight: 'none' }}>
                              <button onClick={() => navigate(`/ticket-details/${ticket.id}`)} 
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Public Sans", sans-serif', fontSize: '14px', color: '#185bc5', fontWeight: 500, padding: 0 }}
                                onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                onMouseLeave={e => e.target.style.textDecoration = 'none'}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ── Pagination ── */}
                <div style={{ width: '1128px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', marginBottom: '16px', padding: '0 4px', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: '"Public Sans", sans-serif', fontSize: '14px', color: '#595959' }}>Row per page</span>
                    <select style={{ border: '1px solid #D9D9D9', borderRadius: '4px', padding: '0 8px', height: '32px', width: '60px', fontSize: '14px', color: '#262626', background: '#fff', outline: 'none', cursor: 'pointer' }}>
                      <option>10</option><option>25</option><option>50</option>
                    </select>
                    
                    <span style={{ fontFamily: '"Public Sans", sans-serif', fontSize: '14px', color: '#595959', marginLeft: '8px' }}>Go to</span>
                    <input 
                      type="text" 
                      defaultValue="9"
                      style={{ 
                        width: '36px', 
                        height: '32px', 
                        border: '1px solid #D9D9D9', 
                        borderRadius: '4px', 
                        textAlign: 'center', 
                        fontSize: '14px', 
                        fontFamily: '"Public Sans", sans-serif',
                        outline: 'none',
                        color: '#262626'
                      }} 
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button disabled style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #F0F0F0', borderRadius: '4px', background: '#FFFFFF', cursor: 'not-allowed' }}>
                      <svg width="6" height="10" viewBox="0 0 7 11" fill="none"><path d="M6 1L1 5.5L6 10" stroke="#BFBFBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    {[1, '...', 4, 5, 6, 7, 8, '...', 50].map((p, i) => {
                      const isActive = p === 6;
                      const isEllipsis = p === '...';
                      return (
                        <button 
                          key={i} 
                          disabled={isEllipsis}
                          style={{ 
                            width: '32px', 
                            height: '32px', 
                            border: isActive ? '1px solid #1890FF' : (isEllipsis ? 'none' : '1px solid #F0F0F0'), 
                            borderRadius: '4px', 
                            background: isActive ? '#1890FF' : 'transparent', 
                            color: isActive ? '#FFFFFF' : (isEllipsis ? '#BFBFBF' : '#595959'), 
                            fontWeight: isActive ? 600 : 400, 
                            fontSize: '14px', 
                            fontFamily: '"Public Sans", sans-serif',
                            cursor: isEllipsis ? 'default' : 'pointer'
                          }}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button disabled style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #F0F0F0', borderRadius: '4px', background: '#FFFFFF', cursor: 'not-allowed' }}>
                      <svg width="6" height="10" viewBox="0 0 7 11" fill="none"><path d="M1 1L6 5.5L1 10" stroke="#BFBFBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </PageLoader>
  );
}
