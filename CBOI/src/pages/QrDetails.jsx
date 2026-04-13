import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { merchantFetchAPI, generateQRAPI } from "../services/api";
import PageLoader from "../components/PageLoader";
import { QRCodeSVG } from "qrcode.react";

export default function QrDetails() {
  const { selectedVpa } = useSelector((state) => state.auth);

  const [qrString, setQrString] = useState(null);
  const [qrBase64, setQrBase64] = useState(null);
  const [merchantName, setMerchantName] = useState(null);
  const [merchantId, setMerchantId] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [generatingBase64, setGeneratingBase64] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!selectedVpa) return;

    async function fetchQrData() {
      console.log(`[QrDetails.jsx:22] Fetching QR details for VPA: ${selectedVpa}`);
      setFetchingData(true);
      setError(null);
      try {
        const response = await merchantFetchAPI({ vpa_id: selectedVpa });
        console.log("[QrDetails.jsx:28] Merchant fetch response:", response.data);

        const data = response.data;
        const merchant = Array.isArray(data?.data) ? data.data[0] : (data?.data || data?.merchant || data);

        const qs =
          merchant?.qr_string ||
          merchant?.qrString ||
          merchant?.qr_payload ||
          merchant?.qr_code ||
          null;

        const name =
          merchant?.merchant_name ||
          merchant?.name ||
          merchant?.merchName ||
          null;

        const id = merchant?.merchant_id || merchant?.id || null;

        console.log(`[QrDetails.jsx:44] QR String: ${qs?.substring(0, 40)}... | Name: ${name}`);
        setQrString(qs);
        setMerchantName(name);
        setMerchantId(id);
      } catch (err) {
        console.error("[QrDetails.jsx:50] Failed to fetch QR details:", err.message);
        setError("Could not load QR details for the selected VPA. The API may not have returned QR data.");
      } finally {
        setFetchingData(false);
      }
    }

    fetchQrData();
  }, [selectedVpa]);

  const handleGenerateBase64 = async () => {
    if (!qrString) return;
    console.log("[QrDetails.jsx:62] Generating Base64 QR image...");
    setGeneratingBase64(true);
    try {
      const res = await generateQRAPI({ qr_string: qrString });
      console.log("[QrDetails.jsx:66] Base64 QR Response:", res.data);
      const b64 = res.data?.base64 || res.data?.qr_image || res.data?.data?.base64 || res.data;
      setQrBase64(typeof b64 === "string" ? b64 : JSON.stringify(b64));
    } catch (err) {
      console.error("[QrDetails.jsx:70] Base64 generation failed:", err.message);
      setError("Failed to generate Base64 QR image.");
    } finally {
      setGeneratingBase64(false);
    }
  };

  const handleCopy = () => {
    if (!qrString) return;
    navigator.clipboard.writeText(qrString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrBase64) return;
    const src = qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`;
    const a = document.createElement("a");
    a.href = src;
    a.download = `qr-${selectedVpa}.png`;
    a.click();
  };

  return (
    <PageLoader>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-slate-800">QR Details</h1>
          {selectedVpa && (
            <p className="text-sm text-slate-500 mt-1">
              VPA ID:{" "}
              <span className="text-blue-600 font-semibold">{selectedVpa}</span>
            </p>
          )}
        </div>

        {/* Loading State */}
        {fetchingData && (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-slate-400">Fetching QR data...</p>
          </div>
        )}

        {/* Error State */}
        {!fetchingData && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-red-400 mx-auto mb-3">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* No VPA selected */}
        {!selectedVpa && !fetchingData && (
          <div className="text-center py-20 text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-14 h-14 mx-auto mb-4 text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <p className="text-sm font-medium">Please select a VPA first</p>
          </div>
        )}

        {/* Main Content */}
        {!fetchingData && !error && selectedVpa && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* QR Code Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-6">QR Code</h2>

              {qrString ? (
                <>
                  {/* SVG QR (always available from qrstring) */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                    <QRCodeSVG value={qrString} size={200} level="H" includeMargin />
                  </div>

                  {/* Base64 image after generation */}
                  {qrBase64 && (
                    <div className="mb-6">
                      <p className="text-[11px] text-slate-400 uppercase font-bold mb-2 text-center">Bank-side Base64 Image</p>
                      <img
                        src={qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`}
                        alt="Base64 QR"
                        className="w-48 h-48 rounded-xl border border-slate-200 shadow-sm mx-auto"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center w-full">
                    {!qrBase64 && (
                      <button
                        onClick={handleGenerateBase64}
                        disabled={generatingBase64}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#185bc5] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                      >
                        {generatingBase64 ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                          </svg>
                        )}
                        {generatingBase64 ? "Generating..." : "Generate Base64 QR"}
                      </button>
                    )}

                    {qrBase64 && (
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download QR
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-slate-200 mb-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p className="text-sm text-slate-400">No QR string returned by API</p>
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-6">Details</h2>
              <div className="space-y-5">
                <InfoRow label="VPA ID" value={selectedVpa} highlight />
                {merchantName && <InfoRow label="Merchant Name" value={merchantName} />}
                {merchantId && <InfoRow label="Merchant ID" value={merchantId} />}

                {qrString && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Raw QR Payload</p>
                    <div className="relative bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-[11px] font-mono text-slate-600 break-all max-h-28 overflow-y-auto pr-8">
                        {qrString}
                      </p>
                      <button
                        onClick={handleCopy}
                        className="absolute top-3 right-3 text-slate-300 hover:text-blue-600 transition"
                        title="Copy QR string"
                      >
                        {copied ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-green-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* API response log */}
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    {`[QrDetails.jsx:205] Loaded for VPA: ${selectedVpa}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLoader>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-semibold break-all ${highlight ? "text-blue-600" : "text-slate-700"}`}>
        {value}
      </span>
    </div>
  );
}
