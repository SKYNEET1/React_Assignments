import { useState, useEffect } from "react";
import loadingIcon from "../assets/loading_logo.png";
/**
 * PageLoader - wraps any page content.
 * Shows a centered spinner for `delay` ms (default: 600ms), then renders children.
 * Usage: <PageLoader><YourPageContent /></PageLoader>
 */
export default function PageLoader({ children, delay = 600 }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="flex justify-center items-center mb-5">
          <img src={loadingIcon} alt="Loading" className="w-[64px] h-[64px] animate-spin" />
        </div>
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

  return <>{children}</>;
}
