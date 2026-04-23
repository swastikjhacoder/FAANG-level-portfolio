"use client";

import { useEffect } from "react";

const ScrollHandler = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const id = hash.replace("#", "");
    const el = document.getElementById(id);

    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  return null;
};

export default ScrollHandler;
