import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedVpa } from "../features/auth/authSlice";
import loadingIcon from "../assets/loading_logo.png";

export default function VpaModal() {
  const dispatch = useDispatch();
  const vpaList = useSelector((state) => state.auth.vpaList);
  const selectedVpa = useSelector((state) => state.auth.selectedVpa);

  const [localSelected, setLocalSelected] = useState(selectedVpa || "");
  const [isProceeding, setIsProceeding] = useState(false);

  const handleProceed = () => {
    if (localSelected) {
      console.log(`[VpaModal.jsx:17] User selected VPA: ${localSelected}. Starting proceed flow.`);
      setIsProceeding(true);
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
    // Full-screen overlay — blurs sidebar + content area
    <div
      className="fixed z-[100] flex items-center justify-center"
      style={{ top: 0, left: 0, width: '100vw', height: '100vh' }}
    >
      {/* Backdrop — full screen blur */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      {/* Modal Card: 500×442, centered on screen */}
      <div
        className="relative flex flex-col overflow-hidden animate-slide-up"
        style={{
          width: '500px',
          height: '442px',
          borderRadius: '4px',
          background: '#FFFFFF',
          boxShadow: [
            '0px 9px 28px 8px #0000000D',
            '0px 6px 16px 0px #00000014',
            '0px 3px 6px -4px #0000001F',
          ].join(', '),
        }}
      >
        {/* ── Header: 500×56, padding 16px 24px ── */}
        <div
          style={{
            width: '500px',
            height: '56px',
            paddingTop: '16px',
            paddingRight: '24px',
            paddingBottom: '16px',
            paddingLeft: '24px',
            background: '#FFFFFF',
            boxShadow: '0px -1px 0px 0px #F0F0F0 inset',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 500,
              fontSize: '16px',
              lineHeight: '24px',
              letterSpacing: '0%',
              color: '#141218',
              margin: 0,
            }}
          >
            Select VPA
          </h2>
        </div>

        {/* ── Body: 500×306, padding 24px, gap 23px ── */}
        <div
          style={{
            width: '500px',
            height: '306px',
            padding: '24px',
            gap: '23px',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <p
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '14px',
              color: '#64748b',
              margin: 0,
              flexShrink: 0,
            }}
          >
            Select a VPA to proceed
          </p>

          {/* Options container: 452×258, gap 8px */}
          <div
            className="overflow-y-auto custom-scrollbar"
            style={{
              width: '452px',
              height: '258px',
              gap: '8px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {vpaList.map((vpa) => (
              <label
                key={vpa}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '4px',
                  border: `1.5px solid ${localSelected === vpa ? '#2563eb' : '#e2e8f0'}`,
                  background: localSelected === vpa ? '#eff6ff' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <input
                  type="radio"
                  name="vpa"
                  className="sr-only"
                  checked={localSelected === vpa}
                  onChange={() => setLocalSelected(vpa)}
                  disabled={isProceeding}
                />
                {/* Custom radio */}
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: `2px solid ${localSelected === vpa ? '#2563eb' : '#94a3b8'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {localSelected === vpa && (
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#2563eb',
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: localSelected === vpa ? '#1e3a8a' : '#374151',
                  }}
                >
                  {vpa}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Footer: 500×80, padding 20px 16px ── */}
        <div
          style={{
            width: '500px',
            height: '80px',
            paddingTop: '20px',
            paddingRight: '16px',
            paddingBottom: '20px',
            paddingLeft: '16px',
            background: '#FFFFFF',
            boxShadow: '0px 1px 0px 0px #F0F0F0 inset',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          {/* Buttons container: width 468, height 40, gap 20px */}
          <div
            style={{
              width: '468px',
              height: '40px',
              gap: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            {/* Cancel button */}
            <button
              onClick={() => setLocalSelected(selectedVpa || "")}
              disabled={isProceeding}
              style={{
                height: '40px',
                padding: '0 24px',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                background: '#FFFFFF',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                color: '#374151',
                cursor: isProceeding ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { if (!isProceeding) e.target.style.background = '#f9fafb'; }}
              onMouseLeave={(e) => { e.target.style.background = '#FFFFFF'; }}
            >
              Cancel
            </button>

            {/* Proceed button */}
            <button
              onClick={handleProceed}
              disabled={!localSelected || isProceeding}
              style={{
                height: '40px',
                padding: '0 24px',
                borderRadius: '4px',
                border: 'none',
                background: localSelected && !isProceeding ? '#2563eb' : '#e2e8f0',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                color: localSelected && !isProceeding ? '#FFFFFF' : '#94a3b8',
                cursor: !localSelected || isProceeding ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              {isProceeding && (
                <img src={loadingIcon} alt="Loading" style={{ width: '16px', height: '16px' }} className="animate-spin" />
              )}
              {isProceeding ? 'Proceeding...' : 'Proceed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
