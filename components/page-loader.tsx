"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    // Reset loader when navigation completes (pathname changes)
    setLoading(false);
    setProgress(0);
    setShowSpinner(false);
  }, [pathname]);

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    let spinnerTimer: NodeJS.Timeout;

    if (loading) {
      setProgress(10);
      progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressTimer);
            return 90;
          }
          return prev + 10;
        });
      }, 150);

      // Delay spinner by 250ms to prevent flickering on fast transitions
      spinnerTimer = setTimeout(() => {
        setShowSpinner(true);
      }, 250);
    } else {
      setProgress(100);
      setShowSpinner(false);
      progressTimer = setTimeout(() => {
        setProgress(0);
      }, 300);
    }

    return () => {
      clearInterval(progressTimer);
      clearTimeout(progressTimer);
      clearTimeout(spinnerTimer);
    };
  }, [loading]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        const targetAttr = anchor.getAttribute("target");

        // Only trigger loader for internal page links
        if (
          href &&
          href.startsWith("/") &&
          !href.startsWith("/#") &&
          targetAttr !== "_blank" &&
          !event.defaultPrevented &&
          event.button === 0 && // Left click only
          !event.metaKey && // Command/Windows key not pressed
          !event.ctrlKey && // Control key not pressed
          !event.shiftKey && // Shift key not pressed
          !event.altKey // Alt key not pressed
        ) {
          const currentUrl = window.location.pathname;
          // If the link points to the current path, don't show loader (no page switch)
          if (href === currentUrl) return;

          setLoading(true);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  if (progress === 0) return null;

  return (
    <>
      {/* Top progress bar with glow */}
      <div className="fixed top-0 left-0 right-0 z-[10000] h-1 w-full bg-slate-100/10">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 transition-all duration-300 ease-out shadow-[0_1px_10px_rgba(6,182,212,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Delayed global overlay loader */}
      {showSpinner && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
          <div className="flex flex-col items-center gap-4 rounded-xl bg-white/95 p-6 shadow-xl border border-slate-100">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <div className="absolute h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-700"></div>
            </div>
            <p className="text-sm font-bold text-slate-800 tracking-wide">
              Loading page...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
