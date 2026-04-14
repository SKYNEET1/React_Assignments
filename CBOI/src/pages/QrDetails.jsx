import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { merchantFetchAPI, generateQRAPI } from "../services/api";
import PageLoader from "../components/PageLoader";
import { QRCodeSVG } from "qrcode.react";
import CboiLogo from "../components/CboiLogo";

export default function QrDetails() {
  const { selectedVpa } = useSelector((state) => state.auth);

  const [qrType, setQrType] = useState("static"); // "static" or "dynamic"
  const [amount, setAmount] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [qrString, setQrString] = useState(null);
  const [apiQrBase64, setApiQrBase64] = useState(null);
  const [merchantName, setMerchantName] = useState(null);
  const [merchantId, setMerchantId] = useState(null);
  
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState(null);
  
  // Dynamic QR Specifics
  const [activeAmount, setActiveAmount] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const timerRef = useRef(null);

  useEffect(() => {
    if (!selectedVpa) return;

    async function fetchMerchantData() {
      setFetchingData(true);
      setError(null);
      try {
        const response = await merchantFetchAPI({ vpa_id: selectedVpa });
        const data = response.data;
        const merchant = Array.isArray(data?.data) ? data.data[0] : (data?.data || data?.merchant || data);

        const name = merchant?.merchant_name || merchant?.name || merchant?.merchName || "Merchant";
        const id = merchant?.merchant_id || merchant?.id || "N/A";
        const staticQs = merchant?.qr_string || merchant?.qrString || merchant?.qr_payload || "";

        setMerchantName(name);
        setMerchantId(id);
        setQrString(staticQs);
        
        if (qrType === "static" && staticQs) {
          // Instead of just showing the local SVG, fetch base64 from API
          await fetchBase64Qr(staticQs);
        }
      } catch (err) {
        console.error("[QrDetails.jsx] Fetch error:", err);
        setError("Failed to load merchant details.");
      } finally {
        setFetchingData(false);
      }
    }

    fetchMerchantData();
  }, [selectedVpa, qrType]);

  const fetchBase64Qr = async (payload) => {
    try {
      const res = await generateQRAPI({ qr_string: payload });
      let b64 = res.data?.base64 || res.data?.qr_image || res.data?.data?.base64 || res.data;
      if (typeof b64 === "object") b64 = JSON.stringify(b64);
      setApiQrBase64(b64);
      setShowQr(true);
    } catch(err) {
      console.error("QR Generation error", err);
      setError("Failed to generate QR from API.");
    }
  };

  // Timer logic for dynamic QR
  useEffect(() => {
    if (showQr && qrType === "dynamic" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setShowQr(false);
    }

    return () => clearInterval(timerRef.current);
  }, [showQr, qrType, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleGenerateQR = async (e) => {
    if (e) e.preventDefault();
    if (qrType === "dynamic" && !amount) return;

    let targetQrString = qrString;

    if (qrType === "dynamic") {
      // Construct Dynamic UPI String
      // upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR
      const encodedName = encodeURIComponent(merchantName);
      targetQrString = `upi://pay?pa=${selectedVpa}&pn=${encodedName}&am=${amount}&cu=INR`;
      setQrString(targetQrString);
      setActiveAmount(amount);
      setTimeLeft(300); // Reset timer to 5 mins
    }
    
    setFetchingData(true);
    setError(null);
    setApiQrBase64(null); // Clear previous
    await fetchBase64Qr(targetQrString);
    setFetchingData(false);
  };

  const handleDownload = () => {
    // If we have base64 image from API, use it directly
    const imgEl = document.getElementById("qr-img");
    if (imgEl && imgEl.src) {
      const downloadLink = document.createElement("a");
      downloadLink.download = `CBOI_QR_${selectedVpa}.png`;
      downloadLink.href = imgEl.src;
      downloadLink.click();
      return;
    }

    // Fallback if svg
    const svg = document.getElementById("qr-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `CBOI_QR_${selectedVpa}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <PageLoader>
      <div className="animate-fade-in pb-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">QR Details</h1>
        </div>

        {/* Configuration Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <form onSubmit={handleGenerateQR} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-3">Select The Type of QR</label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="qrType"
                    value="static"
                    checked={qrType === "static"}
                    onChange={(e) => {
                        setQrType(e.target.value);
                        setShowQr(false);
                    }}
                    className="w-4 h-4 text-[#185bc5] border-slate-300 focus:ring-[#185bc5]"
                  />
                  <span className={`text-sm font-medium ${qrType === "static" ? "text-slate-800" : "text-slate-500 group-hover:text-slate-700"}`}>Static</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="qrType"
                    value="dynamic"
                    checked={qrType === "dynamic"}
                    onChange={(e) => {
                        setQrType(e.target.value);
                        setShowQr(false);
                    }}
                    className="w-4 h-4 text-[#185bc5] border-slate-300 focus:ring-[#185bc5]"
                  />
                  <span className={`text-sm font-medium ${qrType === "dynamic" ? "text-slate-800" : "text-slate-500 group-hover:text-slate-700"}`}>Dynamic</span>
                </label>
              </div>
            </div>

            {qrType === "dynamic" && (
              <div className="animate-slide-down">
                <p className="text-sm text-slate-500 mb-4">Enter an amount to instantly generate your dynamic QR code</p>
                <div className="flex flex-col gap-1.5 max-w-sm">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount to be collected</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount to be collected"
                      className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#185bc5]/20 focus:border-[#185bc5] transition-all bg-white"
                    />
                    <button
                      type="submit"
                      className="bg-[#185bc5] hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm shrink-0 shadow-sm"
                    >
                      Generate QR
                    </button>
                  </div>
                </div>
              </div>
            )}

            {qrType === "static" && (
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-[#185bc5] hover:bg-blue-700 text-white font-semibold px-8 py-2.5 rounded-lg transition-colors text-sm shadow-sm"
                    >
                        Submit
                    </button>
                </div>
            )}
          </form>
        </div>

        {/* QR Display Area */}
        {showQr && !fetchingData && (
          <div className="flex flex-col items-center animate-fade-in">
            {qrType === "dynamic" && activeAmount && (
              <div className="text-center mb-6">
                <p className="text-sm font-medium text-slate-500 mb-1">Amount to be Collected</p>
                <p className="text-2xl font-bold text-[#a31b2b]">₹ {activeAmount}</p>
              </div>
            )}

            {/* QR Card */}
            <div className="relative bg-white rounded-[2rem] border-4 border-[#185bc5] shadow-2xl p-6 w-full max-w-[380px] overflow-hidden">
               {/* Branding Top */}
               <div className="flex flex-col items-center mb-4 pt-2">
                  <CboiLogo className="h-10 mb-2" />
                  <div className="h-px w-full bg-slate-100 my-3" />
                  <h3 className="text-lg font-extrabold text-[#1e293b] uppercase tracking-tight text-center px-4">
                    {merchantName}
                  </h3>
                  <p className="text-[#185bc5] font-bold text-sm mt-1">Scan & Pay</p>
               </div>

               {/* QR Code */}
               <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-inner flex items-center justify-center mb-4 min-h-[220px]">
                  {apiQrBase64 ? (
                      typeof apiQrBase64 === "string" && apiQrBase64.startsWith("data:image") ? (
                        <img id="qr-img" src={apiQrBase64} alt="QR Code" className="w-[200px] h-[200px]" />
                      ) : typeof apiQrBase64 === "string" && apiQrBase64.length > 100 ? (
                        <img id="qr-img" src={`data:image/png;base64,${apiQrBase64}`} alt="QR Code" className="w-[200px] h-[200px]" />
                      ) : (
                        <pre className="text-[10px] text-slate-700 max-w-full overflow-hidden break-all">{apiQrBase64}</pre>
                      )
                  ) : (
                      <QRCodeSVG 
                        id="qr-svg"
                        value={qrString} 
                        size={220} 
                        level="H" 
                        includeMargin={false}
                      />
                  )}
               </div>

               {/* UPI ID */}
               <div className="text-center mb-6">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">UPI Id: {selectedVpa}</p>
               </div>

               {/* Payment Apps Banner */}
               <div className="mt-auto px-2">
                 <div className="grid grid-cols-4 gap-4 items-center mb-2">
                    <PaymentIcon name="BHIM" color="#185bc5" />
                    <PaymentIcon name="UPI" color="#185bc5" />
                    <PaymentIcon name="PhonePe" color="#5f259f" />
                    <PaymentIcon name="GPay" isGoogle />
                 </div>
                 <div className="grid grid-cols-4 gap-4 items-center">
                    <PaymentIcon name="Paytm" color="#00baf2" />
                    <PaymentIcon name="CRED" color="#000" />
                    <PaymentIcon name="Navi" color="#00d5a3" />
                    <PaymentIcon name="CentOzz" color="#a31b2b" />
                 </div>
               </div>
            </div>

            {/* Dynamic Validity */}
            {qrType === "dynamic" && (
                <p className="mt-8 text-sm font-bold text-red-500 animate-pulse">
                    Valid till {formatTime(timeLeft)}
                </p>
            )}

            {/* Static Actions */}
            {qrType === "static" && (
                <button
                    onClick={handleDownload}
                    className="mt-10 bg-[#185bc5] hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-xl transition shadow-lg flex items-center gap-2"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download QR
                </button>
            )}
          </div>
        )}

        {/* Placeholder / No Data */}
        {!showQr && !fetchingData && !error && (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 py-20 flex flex-col items-center justify-center text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 mb-4 opacity-20">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <p className="font-medium">Select type and click Generate/Submit to view QR</p>
            </div>
        )}
      </div>
    </PageLoader>
  );
}

function PaymentIcon({ name, color, isGoogle }) {
    if (isGoogle) {
        return (
            <div className="flex flex-col items-center">
                <div className="flex gap-0.5 text-[8px] font-bold">
                    <span className="text-blue-500">G</span>
                    <span className="text-red-500">P</span>
                    <span className="text-yellow-500">a</span>
                    <span className="text-green-500">y</span>
                </div>
            </div>
        );
    }
  return (
    <div className="flex flex-col items-center">
      <div 
        className="text-[9px] font-black italic tracking-tighter"
        style={{ color: color || '#64748b' }}
      >
        {name}
      </div>
    </div>
  );
}
