import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedVpa } from "../features/auth/authSlice";

export default function VpaModal() {
  const dispatch = useDispatch();
  const vpaList = useSelector((state) => state.auth.vpaList);
  const selectedVpa = useSelector((state) => state.auth.selectedVpa);
  
  const [localSelected, setLocalSelected] = useState(selectedVpa || "");
  const [isProceeding, setIsProceeding] = useState(false);

  const handleProceed = () => {
    if (localSelected) {
      console.log(`[VpaModal.jsx:16] User selected VPA: ${localSelected}. Starting proceed flow.`);
      setIsProceeding(true);
      
      // Artificial delay to show loading state as requested
      setTimeout(() => {
        console.log(`[VpaModal.jsx:21] Proceeding to Dashboard with VPA: ${localSelected}`);
        dispatch(setSelectedVpa(localSelected));
        setIsProceeding(false);
      }, 1000);
    }
  };


  // If already selected, don't show the modal
  if (selectedVpa) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden animate-slide-up">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Select VPA</h2>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-slate-500 mb-6">Select a VPA to proceed</p>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {vpaList.map((vpa) => (
              <label
                key={vpa}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  localSelected === vpa
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-slate-100 hover:border-slate-200 bg-white"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="vpa"
                    className="sr-only"
                    checked={localSelected === vpa}
                    onChange={() => setLocalSelected(vpa)}
                    disabled={isProceeding}
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    localSelected === vpa ? "border-blue-600" : "border-slate-300"
                  }`}>
                    {localSelected === vpa && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  localSelected === vpa ? "text-blue-900" : "text-slate-700"
                }`}>
                  {vpa}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={handleProceed}
            disabled={!localSelected || isProceeding}
            className={`px-8 py-2.5 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${
              localSelected && !isProceeding
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 active:scale-95"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isProceeding && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isProceeding ? "Proceeding..." : "Proceed"}
          </button>
        </div>
      </div>
    </div>
  );
}
