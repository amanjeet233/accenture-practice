"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV !== "production") {
        // In development, unregister service workers and purge caches to prevent stale chunk hydration mismatch
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        if ("caches" in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              caches.delete(key);
            }
          });
        }
        return;
      }

      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.update();
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}