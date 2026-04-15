import loadingIcon from "../assets/loading_logo.png";

export default function LoadingSpinner({ label = "Processing..." }) {
  return (
    <div className="flex items-center gap-2">
      <img 
        src={loadingIcon} 
        alt="Loading" 
        className="w-[18px] h-[18px] animate-spin"
      />
      <span className="text-[13.5px] font-medium">{label}</span>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
