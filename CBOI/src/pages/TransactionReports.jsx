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

        {error && <Alert type="error" message={error} className="mb-6" />}

        {/* Action Bar (Toolbar) */}
        <div 
          className="flex items-center justify-between mb-0 mt-8 bg-white border border-slate-100 border-b-0"
          style={{ width: '1128px', height: '72px', padding: '16px', borderRadius: '4px 4px 0 0' }}
        >
          <div 
            className="relative"
            style={{ width: '180px', height: '40px' }}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search here..."
              className="w-full h-full pl-3 pr-6 py-2 border border-slate-200 rounded-[4px] text-sm bg-white focus:outline-none placeholder-slate-300 italic"
            />
          </div>

          <div className="flex items-center gap-4">
            {queryId ? (
              <div className="">
                {reportStatus?.status === "READY" ? (
                  <a href={reportStatus.signed_url} target="_blank" rel="noreferrer" 
                    className="flex items-center justify-center gap-2 bg-[#156DC4] border border-[#1890FF] text-white text-sm font-normal rounded-[4px] shadow-[0_2px_0_0_rgba(0,0,0,0.043)] transition-all"
                    style={{ width: '142px', height: '40px', padding: '9px 16px' }}
                  >
                    Download All
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
                          if (res.data.data.status === "READY") {
                            setError(null);
                            const reportPayload = res.data.data;
                            if (Array.isArray(reportPayload.data)) setTransactions(reportPayload.data);
                            else if (Array.isArray(reportPayload.transactions)) setTransactions(reportPayload.transactions);
                            else if (Array.isArray(res.data.data_array)) setTransactions(res.data.data_array);
                          } else {
                            setError("Report is still " + res.data.data.status + ". Please wait.");
                          }
                        }
                      } catch (err) {
                        setError("Status check failed: " + err.message);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-[#156DC4] border border-[#1890FF] text-white text-sm font-normal rounded-[4px] shadow-[0_2px_0_0_rgba(0,0,0,0.043)] transition-all"
                    style={{ width: '142px', height: '40px', padding: '9px 16px' }}
                  >
                    {loading ? "..." : "Status"}
                  </button>
                )}
              </div>
            ) : (
              <button
                className="flex items-center justify-center gap-2 bg-[#156DC4] border border-[#1890FF] text-white text-sm font-normal rounded-[4px] shadow-[0_2px_0_0_rgba(0,0,0,0.043)] transition-all"
                style={{ width: '142px', height: '40px', padding: '9px 16px' }}
                onClick={initiateDownload}
                disabled={loading}
              >
                <span style={{ fontFamily: 'Public Sans', fontSize: '14px', lineHeight: '22px' }}>Download All</span>
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100 overflow-hidden">
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <img src={loadingIcon} alt="Loading" className="w-[42px] h-[42px] animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-16 h-16 mb-4 opacity-20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-medium lowercase first-letter:uppercase italic">No transaction records found</p>
              </div>
            ) : (
              <table className="w-full text-left" style={{ width: '1128px' }}>
                <thead style={{ background: 'var(--Secondary-1, #FAFAFA)', boxShadow: '-18px 0px 0px -17px #0000000F' }}>
                  <tr>
                    <th style={{ width: '112px', height: '70px', padding: '0 20px', fontSize: '14px', fontWeight: '500', color: '#000000D9' }}>SL NO</th>
                    <th style={{ width: '254px', height: '70px', padding: '0 16px', fontSize: '14px', fontWeight: '500', color: '#000000D9' }}>Transaction ID</th>
                    <th style={{ width: '254px', height: '70px', padding: '0 16px', fontSize: '14px', fontWeight: '500', color: '#000000D9' }}>Amount</th>
                    <th style={{ width: '254px', height: '70px', padding: '0 16px', fontSize: '14px', fontWeight: '500', color: '#000000D9' }}>Date & Time</th>
                    <th style={{ width: '254px', height: '70px', padding: '0 16px', fontSize: '14px', fontWeight: '500', color: '#000000D9', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((txn, idx) => (
                    <tr key={txn.Transaction_Id || idx} style={{ height: '70px' }}>
                      <td style={{ width: '112px', padding: '0 20px', fontSize: '14px', color: '#000000D9' }}>{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                      <td style={{ width: '254px', padding: '0 16px', fontSize: '14px', color: '#000000D9' }}>{txn.Transaction_Id || "8a33f29c8079444792f65b86"}</td>
                      <td style={{ width: '254px', padding: '0 16px', fontSize: '14px', color: '#000000D9' }}>
                        ₹ {parseFloat(txn.Transaction_Amount || 454.85).toFixed(2)}
                      </td>
                      <td style={{ width: '254px', padding: '0 16px', fontSize: '14px', color: '#000000D9' }}>{txn["Date_&_Time"] || "13/04/2026 14:42"}</td>
                      <td style={{ width: '254px', padding: '0 16px', textAlign: 'center' }}>
                        <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 text-[12px] font-medium rounded-md border border-green-100">
                          Received
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          <div 
            className="bg-white border-t border-slate-100 flex items-center justify-center rounded-b-xl"
            style={{ width: '1128px', height: '72px', padding: '16px' }}
          >
            <div 
              className="flex items-center justify-between"
              style={{ width: '1096px', height: '40px' }}
            >
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span>Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white border border-slate-200 rounded-md py-1 px-2 focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
                <div className="text-sm text-slate-400 font-medium">
                  Showing {filtered.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} - {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-md border border-transparent disabled:opacity-20 transition-all font-bold"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-md border border-transparent disabled:opacity-20 transition-all font-bold"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                </button>
                
                <button
                  disabled={currentPage === Math.ceil(filtered.length / rowsPerPage) || filtered.length === 0}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-md border border-transparent disabled:opacity-20 transition-all font-bold"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </button>
                <button
                  disabled={currentPage === Math.ceil(filtered.length / rowsPerPage) || filtered.length === 0}
                  onClick={() => {
                    const last = Math.ceil(filtered.length / rowsPerPage);
                    setCurrentPage(last);
                  }}
                  className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-md border border-transparent disabled:opacity-20 transition-all font-bold"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLoader>
  );
}
