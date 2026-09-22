"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname or searchParams change, route transition is complete
  useEffect(() => {
    if (isNavigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept click on internal links to start progress bar immediately
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, hash anchors, or modified clicks
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        target.getAttribute("target") === "_blank" ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      // If clicking current path without search change, don't trigger
      try {
        const url = new URL(href, window.location.origin);
        if (url.pathname === window.location.pathname && url.search === window.location.search) {
          return;
        }
      } catch {
        // Ignored
      }

      // Start progress immediately for instant traction
      setIsNavigating(true);
      setProgress(30);

      setTimeout(() => setProgress((p) => (p === 30 ? 70 : p)), 120);
      setTimeout(() => setProgress((p) => (p === 70 ? 90 : p)), 350);
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent pointer-events-none"
    >
      <div
        className="h-full bg-gradient-to-r from-[#58A6FF] via-[#A371F7] to-[#3FB950] shadow-[0_0_12px_rgba(88,166,255,0.8)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionDuration: progress === 100 ? "150ms" : "200ms",
        }}
      />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressContent />
    </Suspense>
  );
}
