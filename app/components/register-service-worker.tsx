"use client";

import { useEffect } from "react";

/**
 * Registers the app shell service worker in production only so dev HMR is not cached.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        /* ignore registration errors (e.g. unsupported context) */
      });
  }, []);

  return null;
}
