"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const ScrollHandler = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const id = hash.replace("#", "");
    const el = document.getElementById(id);

    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }
  }, [pathname, searchParams]);

  return null;
};

export default ScrollHandler;
