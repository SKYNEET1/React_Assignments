import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { transactionReportAPI, reportStatusAPI } from "../services/api";
import PageLoader from "../components/PageLoader";
import Alert from "../components/Alert";
import PageHeader from "../components/PageHeader";
import loadingIcon from "../assets/loading_logo.png";

export default function TransactionReports() {
  const { selectedVpa } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState("Monthly");
  const [selectedMonth, setSelectedMonth] = useState("Last Month Report");
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Custom Range state
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");

  const [queryId, setQueryId] = useState(null);
  const [reportStatus, setReportStatus] = useState(null);

  // Pagination mocks for UI
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPage, setGoToPage] = useState("1");

  // Keep GoTo input in sync with currentPage
  useEffect(() => {
    setGoToPage(currentPage.toString());
  }, [currentPage]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search, rowsPerPage]);

  const getFormattedDate = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const getMonthStartEnd = () => {
    const today = new Date();
    let firstDay, lastDay;

    if (selectedMonth === "Last Month Report") {
      firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (selectedMonth === "Last 3 Months Report") {
      firstDay = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (selectedMonth === "Last 6 Months Report") {
      firstDay = new Date(today.getFullYear(), today.getMonth() - 6, 1);
      lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
    } else {
      // Default to last month
      firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
    }

    return {
      sd: `${String(firstDay.getDate()).padStart(2, '0')}/${String(firstDay.getMonth() + 1).padStart(2, '0')}/${firstDay.getFullYear()}`,
      ed: `${String(lastDay.getDate()).padStart(2, '0')}/${String(lastDay.getMonth() + 1).padStart(2, '0')}/${lastDay.getFullYear()}`,
    };
  };

  const monthOptions = [
    { label: "Last Month Report", value: "Last Month Report" },
    { label: "Last 3 Months Report", value: "Last 3 Months Report" },
    { label: "Last 6 Months Report", value: "Last 6 Months Report" },
  ];

  const formatInputDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const fetchReports = async () => {
    if (!selectedVpa) return;

    setLoading(true);
    setError(null);
    setQueryId(null);
    setReportStatus(null);

    let sd, ed, mode;

    if (filter === "Today") {
      sd = getFormattedDate(0);
      ed = getFormattedDate(0);
      mode = "both";
    } else if (filter === "Monthly") {
      const dates = getMonthStartEnd();
      sd = dates.sd;
      ed = dates.ed;
      mode = "stream"; // Changed to stream to get both JSON array and file URL
    } else if (filter === "Custom Range") {
      if (!startDateStr || !endDateStr) {
        setLoading(false);
        return;
      }
      sd = formatInputDate(startDateStr);
      ed = formatInputDate(endDateStr);
      mode = "stream"; // Changed to stream to get both JSON array and file URL
    }

    const payload = {
      vpa_id: selectedVpa,
      startDate: sd,
      endDate: ed,
      mode: mode
    };

    console.log(`[TransactionReports.jsx] Submitting query payload:`, payload);
    try {
      const response = await transactionReportAPI(payload);
      const resData = response.data;
      const resHeaders = response.headers;
      console.log(`[TransactionReports.jsx] Raw API Response Body:`, resData);
      console.log(`[TransactionReports.jsx] Raw API Response Headers:`, resHeaders);
      
      // PRIORITY 1: Check if data is returned directly (array of transactions)
      const dataArray = resData?.data || resData?.transactions || resData?.data_array || [];
      
      if (Array.isArray(dataArray) && dataArray.length > 0) {
        console.log(`[TransactionReports.jsx] Data received directly. Count: ${dataArray.length}`);
        setTransactions(dataArray);
        // If we also got a query ID in headers, we can set it for possible excel download
        const hQid = resHeaders?.['x-query-id'] || resHeaders?.['query-id'];
        if (hQid) setQueryId(hQid);
        else {
          setQueryId(null);
          setReportStatus(null);
        }
        return;
      }

      // PRIORITY 2: If no data array, check if it's an async report (has query_id)
      if (mode !== "both") {
        const qId = resData?.query_id || resData?.queryId || resData?.data?.query_id || resData?.data?.queryId || resHeaders?.['x-query-id'] || resHeaders?.['query-id'];
        const statusStr = (resData?.status || resData?.statusCode || "").toString().toUpperCase();

        if (qId && (statusStr === "SUCCESS" || statusStr === "1" || statusStr === "200" || resData?.statusCode === 1 || !statusStr)) {
           console.log(`[TransactionReports.jsx] Async query started. ID: ${qId}`);
           setQueryId(qId);
           setTransactions([]);
        } else {
           // Fallback check: maybe it returned SUCCESS but 0 rows
           if (statusStr === "SUCCESS" || resData?.statusCode === 1) {
              setTransactions([]);
              return;
           }
           const errMsg = resData?.statusDescription || resData?.message || "Failed to generate report.";
           throw new Error(errMsg);
        }
      } else {
        // Mode both but no data? Clear table
        setTransactions([]);
      }
    } catch (err) {
      console.error(`[TransactionReports.jsx] Submission Error:`, err);
      setError(err.message || "Failed to fetch reports");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const initiateDownload = async () => {
    if (!selectedVpa) return;
    
    setLoading(true);
    setError(null);
    setQueryId(null);
    setReportStatus(null);
    
    let sd, ed;
    if (filter === "Today") {
      sd = getFormattedDate(0);
      ed = getFormattedDate(0);
    } else if (filter === "Monthly") {
      const dates = getMonthStartEnd();
      sd = dates.sd;
      ed = dates.ed;
    } else if (filter === "Custom Range") {
      if (!startDateStr || !endDateStr) {
        setError("Please select a date range");
        setLoading(false);
        return;
      }
      sd = formatInputDate(startDateStr);
      ed = formatInputDate(endDateStr);
    }

    const payload = { 
      vpa_id: selectedVpa,
      startDate: sd,
      endDate: ed,
      mode: "excel" // Force excel mode for download button
    };

    console.log(`[TransactionReports.jsx] Initiating Excel download:`, payload);
    try {
      const response = await transactionReportAPI(payload);
      const resData = response.data;
      const resHeaders = response.headers;
      console.log(`[TransactionReports.jsx] Download Init Response Body:`, resData);
      console.log(`[TransactionReports.jsx] Download Init Response Headers:`, resHeaders);

      const qId = resData?.query_id || resData?.queryId || resData?.data?.query_id || resData?.data?.queryId || resHeaders?.['x-query-id'] || resHeaders?.['query-id'];
      
      if (qId) {
        console.log(`[TransactionReports.jsx] Download ID captured: ${qId}`);
        setQueryId(qId);
      } else {
        throw new Error("Server did not provide a download ID (checked body and x-query-id header).");
      }
    } catch (err) {
      setError("Download initiation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filter === "Today") {
      fetchReports();
    }
  }, [selectedVpa, filter]);

  const filtered = transactions.filter((t) =>
    (t.Transaction_Id || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.VPA_ID || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLoader>
      <div className="animate-fade-in pb-10">
        <PageHeader title="Transaction Reports" />

        {/* Filter Section */}
        <div 
          className="bg-white mb-8 flex flex-col"
          style={{ 
            width: '1128px', 
            height: '188px', 
            padding: '20px', 
            gap: '20px', 
            borderRadius: '4px', 
            border: '1px solid var(--Secondary-3, #F0F0F0)',
            opacity: 1,
            background: 'var(--Other-Color-A1, #FFFFFF)'
          }}
        >
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {/* Filter Types */}
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-4">Select a Report Filter</p>
              <div className="flex items-center gap-8">
                {["Today", "Monthly", "Custom Range"].map((option) => (
                  <label key={option} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="reportFilter"
                      checked={filter === option}
                      onChange={() => {
                        setFilter(option);
                        setQueryId(null);
                        setReportStatus(null);
                        setTransactions([]);
                        setError(null);
                      }}
                      className="w-4 h-4 text-[#185bc5] border-slate-300 focus:ring-[#185bc5] transition-all"
                    />
                    <span className={`text-sm font-medium transition-colors ${filter === option ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sub-Filters */}
            {filter === "Monthly" && (
              <div className="animate-slide-down">
                <p className="text-sm font-semibold text-slate-600 mb-3">Select Month</p>
                <div className="flex items-center gap-4">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#185bc5]/20 bg-slate-50/50 w-64"
                  >
                    {monthOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={fetchReports}
                    className="bg-[#185bc5] hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-lg transition-all shadow-sm text-sm"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}

            {filter === "Custom Range" && (
              <div className="animate-slide-down flex items-end gap-4 overflow-hidden">
                <div className="flex-1 max-w-[200px]">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">From Date</p>
                  <input
                    type="date"
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185bc5]/20 bg-slate-50/50"
                  />
                </div>
                <div className="flex-1 max-w-[200px]">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">To Date</p>
                  <input
                    type="date"
                    value={endDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185bc5]/20 bg-slate-50/50"
                  />
                </div>
                <button
                  onClick={fetchReports}
                  disabled={!startDateStr || !endDateStr || loading}
                  className="bg-[#185bc5] hover:bg-blue-700 text-white font-bold px-8 py-2.5 rounded-lg transition-all disabled:opacity-50 text-sm shadow-sm"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Full Table Container: 1128×494 ── */}
        <div
          style={{
            width: '1128px',
            height: '494px',
            borderRadius: '4px',
            border: '1px solid var(--Secondary-3, #F0F0F0)',
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >

          {/* ── Toolbar: 1128×72, padding 16px ── */}
          <div
            style={{
              width: '1128px',
              height: '72px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              borderBottom: '1px solid var(--Secondary-3, #F0F0F0)',
            }}
          >
            {/* Search input: 180×40 */}
            <div
              style={{
                width: '180px',
                height: '40px',
                borderRadius: '4px',
                border: '1px solid var(--Secondary-4, #D9D9D9)',
                background: 'var(--Other-Color-A1, #FFFFFF)',
                display: 'flex',
                alignItems: 'center',
                paddingTop: '8px',
                paddingRight: '24px',
                paddingBottom: '8px',
                paddingLeft: '12px',
                gap: '12px',
                boxSizing: 'border-box',
              }}
            >
              {/* Search icon: 13.19×14 */}
              <svg
                width="13.19"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                style={{ flexShrink: 0 }}
              >
                <circle cx="6" cy="6" r="5" stroke="#8C8C8C" strokeWidth="1.5" />
                <path d="M10 10L13 13" stroke="#8C8C8C" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {/* Input text */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search here..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontFamily: "'Public Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '22px',
                  color: '#262626',
                  background: 'transparent',
                  width: '90px',
                  height: '22px',
                }}
                className="placeholder-[#BFBFBF]"
              />
            </div>

            {/* Download All / Status button: 142×40 */}
            {queryId ? (
              reportStatus?.status === 'READY' ? (
                <a
                  href={reportStatus.signed_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: '142px',
                    height: '40px',
                    borderRadius: '4px',
                    padding: '9px 16px',
                    background: '#156DC4',
                    border: '1px solid var(--Primary-6, #1890FF)',
                    boxShadow: '0px 2px 0px 0px #0000000B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M8 1v9M4 7l4 4 4-4M2 12v2h12v-2" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '22px', color: '#FFFFFF', textAlign: 'center' }}>
                    Download All
                  </span>
                </a>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      console.log(`[TransactionReports.jsx] Checking status for queryId: ${queryId}`);
                      setLoading(true);
                      const res = await reportStatusAPI(queryId);
                      if (res.data?.data) {
                        setReportStatus(res.data.data);
                        if (res.data.data.status === 'READY') {
                          setError(null);
                          const reportPayload = res.data.data;
                          if (Array.isArray(reportPayload.data)) setTransactions(reportPayload.data);
                          else if (Array.isArray(reportPayload.transactions)) setTransactions(reportPayload.transactions);
                          else if (Array.isArray(res.data.data_array)) setTransactions(res.data.data_array);
                        } else {
                          setError('Report is still ' + res.data.data.status + '. Please wait.');
                        }
                      }
                    } catch (err) {
                      setError('Status check failed: ' + err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  style={{
                    width: '142px',
                    height: '40px',
                    borderRadius: '4px',
                    padding: '9px 16px',
                    background: '#156DC4',
                    border: '1px solid var(--Primary-6, #1890FF)',
                    boxShadow: '0px 2px 0px 0px #0000000B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <span style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '22px', color: '#FFFFFF', textAlign: 'center' }}>
                    {loading ? '...' : 'Check Status'}
                  </span>
                </button>
              )
            ) : (
              <button
                onClick={initiateDownload}
                disabled={loading}
                style={{
                  width: '142px',
                  height: '40px',
                  borderRadius: '4px',
                  padding: '9px 16px',
                  background: '#156DC4',
                  border: '1px solid var(--Primary-6, #1890FF)',
                  boxShadow: '0px 2px 0px 0px #0000000B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                {/* Download icon: 16×16 */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M8 1v9M4 7l4 4 4-4M2 12v2h12v-2" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '22px', color: '#FFFFFF', textAlign: 'center' }}>
                  Download All
                </span>
              </button>
            )}
          </div>

          {/* ── Columns / Data Table: 1128×350 ── */}
          <div style={{ width: '1128px', height: '350px', overflow: 'hidden', flexShrink: 0 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '350px' }}>
                <img src={loadingIcon} alt="Loading" style={{ width: '42px', height: '42px' }} className="animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '350px', color: '#8C8C8C' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: '64px', height: '64px', marginBottom: '16px', opacity: 0.2 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: '14px' }}>No transaction records found</p>
              </div>
            ) : (
              <table style={{ width: '1128px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead style={{ background: 'var(--Secondary-1, #FAFAFA)' }}>
                  <tr>
                    <th style={{ width: '112px', height: '56px', padding: '0 20px', fontFamily: "'Public Sans', sans-serif", fontSize: '14px', fontWeight: 500, color: '#000000D9', textAlign: 'left', borderBottom: '1px solid #F0F0F0' }}>S. No.</th>
                    <th style={{ width: '254px', height: '56px', padding: '0 16px', fontFamily: "'Public Sans', sans-serif", fontSize: '14px', fontWeight: 500, color: '#000000D9', textAlign: 'left', borderBottom: '1px solid #F0F0F0' }}>Transaction ID</th>
                    <th style={{ width: '254px', height: '56px', padding: '0 16px', fontFamily: "'Public Sans', sans-serif", fontSize: '14px', fontWeight: 500, color: '#000000D9', textAlign: 'left', borderBottom: '1px solid #F0F0F0' }}>Amount</th>
                    <th style={{ width: '254px', height: '56px', padding: '0 16px', fontFamily: "'Public Sans', sans-serif", fontSize: '14px', fontWeight: 500, color: '#000000D9', textAlign: 'left', borderBottom: '1px solid #F0F0F0' }}>Date &amp; Time</th>
                    <th style={{ width: '254px', height: '56px', padding: '0 16px', fontFamily: "'Public Sans', sans-serif", fontSize: '14px', fontWeight: 500, color: '#000000D9', textAlign: 'center', borderBottom: '1px solid #F0F0F0' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((txn, idx) => (
                    <tr key={txn.Transaction_Id || idx} style={{ height: '58px', borderBottom: '1px solid #F0F0F0' }}>
                      <td style={{ width: '112px', padding: '0 20px', fontFamily: "'Public Sans', sans-serif", fontSize: '14px', color: '#000000D9' }}>{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                      <td style={{ width: '254px', padding: '0 16px', fontFamily: "'Public Sans', sans-serif", fontSize: '14px', color: '#000000D9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{txn.Transaction_Id || '8a33f29c8079444792f65b86'}</td>
                      <td style={{ width: '254px', padding: '0 16px', fontFamily: "'Public Sans', sans-serif", fontSize: '14px', color: '#000000D9' }}>
                        ₹ {parseFloat(txn.Transaction_Amount || 454.85).toFixed(2)}
                      </td>
                      <td style={{ width: '254px', padding: '0 16px', fontFamily: "'Public Sans', sans-serif", fontSize: '14px', color: '#000000D9' }}>{txn['Date_&_Time'] || '13/04/2026 14:42'}</td>
                      <td style={{ width: '254px', padding: '0 16px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 12px', background: '#F6FFED', color: '#52C41A', fontSize: '12px', fontFamily: "'Public Sans', sans-serif", fontWeight: 500, borderRadius: '4px', border: '1px solid #B7EB8F' }}>
                          Received
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Pagination: 1128×72, padding 16px ── */}
          <div
            style={{
              width: '1128px',
              height: '72px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              borderTop: '1px solid var(--Secondary-3, #F0F0F0)',
            }}
          >
            {/* Inner: 1096×40, justify-content: space-between */}
            <div style={{ width: '1096px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

              {/* LEFT — Pagination options: 246×40, gap 8px */}
              <div style={{ width: '246px', height: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* "Row per page" text */}
                <span style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '22px', color: '#8C8C8C', whiteSpace: 'nowrap' }}>
                  Row per page
                </span>
                {/* Size changer: 57×40 */}
                <select
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  style={{
                    width: '57px',
                    height: '40px',
                    borderRadius: '4px',
                    border: '1px solid var(--Secondary-4, #D9D9D9)',
                    background: 'var(--Other-Color-A1, #FFFFFF)',
                    paddingTop: '8px',
                    paddingRight: '12px',
                    paddingBottom: '8px',
                    paddingLeft: '12px',
                    fontFamily: "'Public Sans', sans-serif",
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: '#262626',
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                {/* Go to input: 41×40 */}
                <span style={{ fontFamily: "'Public Sans', sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '22px', color: '#8C8C8C', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  Go to
                </span>
                <input
                  type="text"
                  value={goToPage}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val)) {
                      setGoToPage(val);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
                      const p = Math.max(1, Math.min(totalPages, Number(goToPage) || 1));
                      setCurrentPage(p);
                      setGoToPage(p.toString());
                    }
                  }}
                  onBlur={() => {
                    const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
                    const p = Math.max(1, Math.min(totalPages, Number(goToPage) || 1));
                    setCurrentPage(p);
                    setGoToPage(p.toString());
                  }}
                  style={{
                    width: '41px',
                    height: '40px',
                    borderRadius: '4px',
                    border: '1px solid var(--Secondary-4, #D9D9D9)',
                    background: 'var(--Other-Color-A1, #FFFFFF)',
                    paddingTop: '8px',
                    paddingRight: '4px',
                    paddingBottom: '8px',
                    paddingLeft: '4px',
                    fontFamily: "'Public Sans', sans-serif",
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '22px',
                    color: '#262626',
                    outline: 'none',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* RIGHT — Prev / Next navigation: content width 432, height 32, gap 8px */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '32px' }}>
                {/* Previous: 32x32, border-radius 4, padding 10, border #F0F0F0 (disabled) */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--Secondary-3, #F0F0F0)',
                    borderRadius: '4px',
                    background: '#FFFFFF',
                    padding: '10px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <svg width="6.38" height="10.15" viewBox="0 0 7 11" fill="none">
                    <path
                      d="M6 1L1 5.5L6 10"
                      stroke={currentPage === 1 ? '#BFBFBF' : '#262626'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Page numbers: 32x32, padding 1x7, border-radius 4 (or 2) */}
                {(() => {
                  const total = Math.ceil(filtered.length / rowsPerPage) || 1;
                  const pages = [];
                  const addPage = (n) => pages.push(
                    <button
                      key={n}
                      onClick={() => setCurrentPage(n)}
                      style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1px 7px',
                        border: currentPage === n ? '1px solid #156DC4' : '1px solid var(--Secondary-3, #F0F0F0)',
                        borderRadius: '4px',
                        background: currentPage === n ? '#156DC4' : '#FFFFFF',
                        color: currentPage === n ? '#FFFFFF' : 'var(--Secondary-8, #262626)',
                        fontFamily: "'Public Sans', sans-serif",
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '22px',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    >
                      {n}
                    </button>
                  );
                  const addEllipsis = (k) => pages.push(
                    <span
                      key={k}
                      style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Arial',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '32px',
                        letterSpacing: '2px',
                        color: 'var(--Secondary-4, #D9D9D9)',
                      }}
                    >
                      •••
                    </span>
                  );

                  // Build range: always include page 1, last page, and ±2 around current
                  const rangeSet = new Set([1, total]);
                  for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    if (i >= 1 && i <= total) rangeSet.add(i);
                  }
                  const range = Array.from(rangeSet).sort((a, b) => a - b);

                  // Render pages + ellipsis for gaps
                  let prev = null;
                  range.forEach((n, idx) => {
                    if (prev !== null) {
                      const gap = n - prev;
                      if (gap === 2) {
                        // Gap of exactly 1 missing page: just show that page
                        addPage(prev + 1);
                      } else if (gap > 2) {
                        // Larger gap: show ellipsis
                        addEllipsis(`e${idx}`);
                      }
                    }
                    addPage(n);
                    prev = n;
                  });
                  return pages;
                })()}

                {/* Next: 32x32, padding 10, border #D9D9D9 (normal) */}
                <button
                  disabled={currentPage === Math.ceil(filtered.length / rowsPerPage) || filtered.length === 0}
                  onClick={() => setCurrentPage(p => p + 1)}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--Secondary-4, #D9D9D9)',
                    borderRadius: '4px',
                    background: '#FFFFFF',
                    padding: '10px',
                    cursor: (currentPage === Math.ceil(filtered.length / rowsPerPage) || filtered.length === 0) ? 'not-allowed' : 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <svg width="6.38" height="10.15" viewBox="0 0 7 11" fill="none">
                    <path
                      d="M1 1L6 5.5L1 10"
                      stroke={(currentPage === Math.ceil(filtered.length / rowsPerPage) || filtered.length === 0) ? '#BFBFBF' : '#262626'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

            </div>
          </div>

        </div>{/* /Table container */}
      </div>
    </PageLoader>
  );
}
