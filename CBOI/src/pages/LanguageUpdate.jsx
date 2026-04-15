import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateLanguage, resetLanguage } from "../redux/slices/languageSlice";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import PageLoader from "../components/PageLoader";
import loadingIcon from "../assets/loading_logo.png";
import { fetchLanguageAPI, currentLanguageAPI, merchantFetchAPI } from "../services/api";

const LANGUAGE_OPTIONS = [
  { value: "", label: "Enter Language Update" },
  { value: "hi", label: "Hindi (hi)" },
  { value: "en", label: "English (en)" },
  { value: "te", label: "Telugu (te)" },
  { value: "ta", label: "Tamil (ta)" },
  { value: "bn", label: "Bengali (bn)" },
  { value: "mr", label: "Marathi (mr)" },
  { value: "gu", label: "Gujarati (gu)" },
  { value: "kn", label: "Kannada (kn)" },
  { value: "ml", label: "Malayalam (ml)" },
  { value: "or", label: "Odia (or)" },
  { value: "pa", label: "Punjabi (pa)" },
];

export default function LanguageUpdate() {
  const dispatch = useDispatch();
  const { loading, success, error, response } = useSelector((state) => state.language);
  const { selectedVpa } = useSelector((state) => state.auth);

  const [deviceSerial, setDeviceSerial] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [fetchingCurrent, setFetchingCurrent] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  // Load available language options from API
  useEffect(() => {
    async function loadLanguages() {
      console.log("[LanguageUpdate.jsx:39] Fetching available languages from API");
      try {
        const res = await fetchLanguageAPI();
        const langs = res.data?.data || res.data || [];
        console.log("[LanguageUpdate.jsx:43] Available languages fetched:", langs);
        if (langs.length > 0) setAvailableLanguages(langs);
      } catch (err) {
        console.error("[LanguageUpdate.jsx:46] Failed to fetch languages, using defaults");
      }
    }
    loadLanguages();
    return () => dispatch(resetLanguage());
  }, [dispatch]);

  // Auto-fetch Device Serial (TID) from merchant details
  useEffect(() => {
    if (!selectedVpa) return;
    
    async function getDeviceSerial() {
      console.log(`[LanguageUpdate.jsx] Fetching merchant info for VPA: ${selectedVpa} to get TID...`);
      try {
        const response = await merchantFetchAPI({ vpa_id: selectedVpa });
        const data = response.data;
        const merchant = Array.isArray(data?.data) ? data.data[0] : (data?.data || data?.merchant || data);
        
        // Find serial number, prioritizing serial_number
        const serial = merchant?.serial_number || merchant?.tid || merchant?.terminal_id || merchant?.device_serial || "38241212934508"; // fallback to new sample
        
        console.log(`[LanguageUpdate.jsx] Extracted Device Serial (TID): ${serial}`);
        setDeviceSerial(serial);
      } catch (err) {
        console.error("[LanguageUpdate.jsx] Failed to fetch merchant details for TID:", err);
        setDeviceSerial("38241212934508"); // fallback
      }
    }
    
    getDeviceSerial();
  }, [selectedVpa]);

  // Fetch current language whenever device serial changes (including initial render)
  useEffect(() => {
    async function fetchCurrentLanguage() {
      if (!deviceSerial.trim()) return;
      console.log(`[LanguageUpdate.jsx] Fetching current language for device: ${deviceSerial}`);
      setFetchingCurrent(true);
      setCurrentLanguage("");
      try {
        const res = await currentLanguageAPI(deviceSerial.trim());
        console.log("[LanguageUpdate.jsx] Current language response:", res.data);
        const lang = res.data?.current_language || res.data?.language || res.data?.data || "";
        setCurrentLanguage(typeof lang === "string" ? lang : JSON.stringify(lang));
      } catch (err) {
        console.error("[LanguageUpdate.jsx] Could not fetch current language:", err.message);
        setCurrentLanguage("—");
      } finally {
        setFetchingCurrent(false);
      }
    }
    
    // Call it on entering the page or when tid changes
    fetchCurrentLanguage();
  }, [deviceSerial]);

  // Keep manual blur logic for safety, but useEffect handles most of it
  const handleDeviceSerialBlur = () => {};

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!newLanguage) return;
    console.log(`[LanguageUpdate.jsx] Submitting language update: Device=${deviceSerial}, Lang=${newLanguage}`);
    dispatch(
      updateLanguage({
        tid: deviceSerial,
        update_language: newLanguage,
      })
    );
  };

  useEffect(() => {
    if (success) {
      console.log(`%c[VERIFICATION] Language update for ${deviceSerial} was successful!`, "color: #10b981; font-weight: bold;");
      console.log(`%c[VERIFICATION] New Language set to: ${newLanguage}`, "color: #10b981; font-weight: bold;");
    }
  }, [success, deviceSerial, newLanguage]);

  const handleCancel = () => {
    setDeviceSerial("");
    setCurrentLanguage("");
    setNewLanguage("");
    dispatch(resetLanguage());
  };

  const dynamicOptions = availableLanguages.length > 0
    ? [{ value: "", label: "Enter Language Update" }, ...availableLanguages.map((l) => ({
        value: l.code || l.value || l,
        label: l.name || l.label || l,
      }))]
    : LANGUAGE_OPTIONS;

  return (
    <PageLoader>
      <div className="animate-fade-in">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-slate-800">Language Update</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8">
          <form onSubmit={handleUpdate}>
            {/* Row 1: VPA ID + Device Serial Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm text-slate-600 font-medium mb-2">VPA ID</label>
                <input
                  type="text"
                  value={selectedVpa || ""}
                  readOnly
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-400 bg-slate-50 cursor-not-allowed focus:outline-none"
                  placeholder="Select VPA from login"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 font-medium mb-2">Device Serial Number</label>
                <input
                  type="text"
                  value={deviceSerial}
                  onChange={(e) => setDeviceSerial(e.target.value)}
                  onBlur={handleDeviceSerialBlur}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                  placeholder="56566657678678"
                />
              </div>
            </div>

            {/* Row 2: Current Language + Language Update dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm text-slate-600 font-medium mb-2">Current Language</label>
                <div className="relative">
                  <input
                    type="text"
                    value={fetchingCurrent ? "Fetching..." : currentLanguage}
                    readOnly
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-400 bg-slate-50 cursor-not-allowed focus:outline-none"
                    placeholder="Current Language"
                  />
                  {fetchingCurrent && (
                    <div className="absolute right-3 top-3.5">
                      <img src={loadingIcon} alt="Loading" className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 font-medium mb-2">Language Update</label>
                <div className="relative">
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition appearance-none bg-white cursor-pointer"
                  >
                    {dynamicOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6">
                <Alert type="error" message={error} />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 text-sm font-semibold text-red-500 hover:text-red-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !newLanguage || !deviceSerial}
                className="px-8 py-2.5 bg-[#185bc5] text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <LoadingSpinner label="Updating..." /> : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in"
            onClick={handleCancel}
          />
          
          {/* Modal Card */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="p-8 text-center">
              <h2 className="text-lg font-bold text-slate-700 mb-6">
                Language update request<br />Initiated Successfully
              </h2>
              
              {/* Checkmark Icon Container */}
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-4 border-green-50 animate-ping opacity-20" />
                    <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
              </div>
            </div>

            {/* Footer with Close Button */}
            <div className="p-6 border-t border-slate-50">
              <button
                onClick={handleCancel}
                className="w-full py-2.5 bg-[#185bc5] hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLoader>
  );
}
