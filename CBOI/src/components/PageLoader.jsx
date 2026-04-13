import { useState, useEffect } from "react";

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
        <div className="relative w-14 h-14 mb-5">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-slate-400 font-medium tracking-wide">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
