import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMerchant, resetMerchant } from "../redux/slices/merchantSlice";
import PageHeader from "../components/PageHeader";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import PageLoader from "../components/PageLoader";
import { QRCodeSVG } from "qrcode.react";
import { generateQRAPI } from "../services/api";

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide w-40 shrink-0">{label}</span>
      <span className="text-sm text-slate-800 font-medium text-right break-all">{value}</span>
    </div>
  );
}

export default function MerchantFetch() {
  const dispatch = useDispatch();
  const { loading, success, error, data } = useSelector((state) => state.merchant);
  const [searchType, setSearchType] = useState("vpa_id");
  const [searchValue, setSearchValue] = useState("");
  const [qrBase64, setQrBase64] = useState(null);
  const [fetchingQr, setFetchingQr] = useState(false);
  const [qrError, setQrError] = useState(null);

  useEffect(() => {
    return () => {
      dispatch(resetMerchant());
      setQrBase64(null);
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    setQrBase64(null);
    setQrError(null);
    dispatch(fetchMerchant({ [searchType]: searchValue.trim() }));
  };

  const handleReset = () => {
    setSearchValue("");
    setQrBase64(null);
    setQrError(null);
    dispatch(resetMerchant());
  };

  // Adding aggressive fallbacks for Stage vs PreProd naming differences
  const merchant = Array.isArray(data?.data) ? data.data[0] : (data?.data || data?.merchant || data || null);
  
  // Normalized fields for display
  const mName = merchant?.merchant_name || merchant?.name || merchant?.merchName || merchant?.merch_name || merchant?.fullName;
  const mMobile = merchant?.merchant_mobile || merchant?.mobile || merchant?.merchMobile || merchant?.mobile_number || merchant?.mobile_no || merchant?.mobileNo;
  const mAccount = merchant?.merchant_account_no || merchant?.account_no || merchant?.accNo || merchant?.accountNumber || merchant?.account_number;
  const mTid = merchant?.terminal_id || merchant?.tid || merchant?.terminalId || merchant?.terminalID;
  const mVpa = merchant?.vpa_id || merchant?.vpa || merchant?.vpaID || merchant?.vpa_id_details;
  const mAddress = merchant?.merchant_delivery_address || merchant?.address || merchant?.merchAddress || merchant?.delivery_address || merchant?.deliveryAddress;
  const mDate = merchant?.created_date || merchant?.createdAt || merchant?.creationDate || merchant?.createdDate;
  const mQr = merchant?.qr_string || merchant?.qrString || merchant?.qris || merchant?.qr_payload || merchant?.qr_code;

  const handleGenerateQR = async () => {
    if (!mQr) return;
    setFetchingQr(true);
    setQrError(null);
    try {
      const res = await generateQRAPI({ qr_string: mQr });
      // Depending on API response struct: Extract base64
      let b64 = res.data?.base64 || res.data?.qr_image || res.data?.data?.base64 || res.data;
      if (typeof b64 === "object") b64 = JSON.stringify(b64); // fallback if unexpected
      setQrBase64(b64);
    } catch(err) {
      setQrError("Base64 Error: " + (err.response?.data?.message || err.message));
    } finally {
      setFetchingQr(false);
    }
  };

  return (
    <PageLoader>
    <div className="animate-fade-in pb-12">
      <PageHeader
        title="Merchant Fetch"
        subtitle="Look up merchant details using their VPA ID, Mobile Number, or Account Number"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      />

      {/* Search Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-5">Search Merchant</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Search By
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="vpa_id">VPA ID</option>
                <option value="mobile_number">Mobile Number</option>
                <option value="account_number">Account Number</option>
                <option value="serial_number">Serial Number</option>
              </select>
            </div>
            <div className="w-full md:w-2/3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Value <span className="text-red-400">*</span>
              </label>
              <input 
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Enter value"
                required
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white placeholder-slate-400"
              />
            </div>
          </div>

          {error && <Alert type="error" message={error} />}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#185bc5] hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? <LoadingSpinner label="Fetching..." /> : "Fetch Merchant"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-6 py-2.5 rounded-lg transition-colors duration-200 text-sm"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Merchant Details Card */}
      {success && merchant && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="bg-[#185bc5] px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  {mName || "Merchant Details"}
                </h3>
                <p className="text-blue-100 text-sm">{merchant.merchant_id || merchant.id ? `Merchant ID: ${merchant.merchant_id || merchant.id}` : "Fetched Successfully"}</p>
              </div>
              <div className="ml-auto">
                <span className="bg-[#eefcf4] text-[#1f9d55] text-xs font-bold px-3 py-1 rounded-full border border-[#1f9d55]/20">
                  {merchant.state || merchant.status || "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Info */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 border-b border-slate-100 pb-2">Information</h4>
                <div className="space-y-1">
                  <DetailRow label="Name" value={mName} />
                  <DetailRow label="Mobile" value={mMobile} />
                  <DetailRow label="Account No" value={mAccount} />
                  <DetailRow label="Terminal ID" value={mTid} />
                  <DetailRow label="VPA ID" value={mVpa} />
                  <DetailRow label="Address" value={mAddress} />
                  <DetailRow label="Created Date" value={mDate ? new Date(mDate).toLocaleString() : null} />
                </div>

                {/* Diagnostic Dump (Visible if mapping is failing) */}
                {(!mName && !mTid) && (
                  <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-700 shadow-inner">
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                       Raw API Response Keys
                    </p>
                    <pre className="text-[10px] text-slate-300 font-mono whitespace-pre-wrap break-all leading-relaxed">
                      {JSON.stringify(merchant, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* QR Code */}
              {mQr && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 border-b border-slate-100 pb-2">Dynamic QR Code</h4>
                  <div className="flex flex-col items-center bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-sm">
                    {/* Show local SVG by default on Stage */}
                    <div className="mb-4">
                       <QRCodeSVG
                        value={mQr}
                        size={150}
                        level="H"
                        includeMargin={true}
                        className="bg-white p-2 rounded-lg border border-slate-200"
                      />
                    </div>

                    {!qrBase64 ? (
                      <div className="flex flex-col items-center space-y-4">
                        {qrError && <Alert type="error" message={qrError} />}
                        <button
                          type="button"
                          onClick={handleGenerateQR}
                          disabled={fetchingQr}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition text-xs"
                        >
                          {fetchingQr ? <LoadingSpinner label="Generating..." /> : "Generate Base64 QR"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        {typeof qrBase64 === "string" && qrBase64.startsWith("data:image") ? (
                           <img src={qrBase64} alt="QR Code" className="w-48 h-48 rounded-lg border border-slate-200 shadow-sm" />
                        ) : typeof qrBase64 === "string" && qrBase64.length > 100 ? (
                           <img src={`data:image/png;base64,${qrBase64}`} alt="QR Code" className="bg-white p-2 w-48 h-48 rounded-lg border border-slate-200 shadow-sm" />
                        ) : (
                           <pre className="text-[10px] text-slate-700 max-w-full overflow-hidden break-all">{qrBase64}</pre>
                        )}
                        <p className="text-[10px] text-slate-500 mt-2 font-semibold">Decrypted Base64 Image</p>
                      </div>
                    )}

                    <div className="mt-4 w-full">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Raw QR Payload</p>
                      <div className="bg-white border border-slate-200 rounded-lg p-3 text-[10px] text-slate-600 font-mono break-all max-h-24 overflow-y-auto">
                        {mQr}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No data but success */}
      {success && !merchant && (
        <Alert type="error" message="No merchant data found for the given search value." />
      )}
    </div>
    </PageLoader>
  );
}
