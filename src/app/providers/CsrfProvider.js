"use client";

import { useEffect, useRef, useState } from "react";

const hasCsrfCookie = () => {
  if (typeof document === "undefined") return false;

  return document.cookie
    .split("; ")
    .some((row) => row.startsWith("csrfToken="));
};

export default function CsrfProvider({ children }) {
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    let mounted = true;

    const initCsrf = async () => {
      try {
        if (initialized.current) return;

        if (hasCsrfCookie()) {
          initialized.current = true;
          if (mounted) setReady(true);
          return;
        }

        const res = await fetch("/api/csrf", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to initialize CSRF token");
        }

        initialized.current = true;
      } catch (err) {
        console.error("❌ CSRF INIT ERROR:", err);
      } finally {
        if (mounted) setReady(true);
      }
    };

    initCsrf();

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) return null;

  return children;
}
