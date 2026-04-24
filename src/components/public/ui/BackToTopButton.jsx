"use client";

import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const BackToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const triggerHeight = window.innerHeight;

      if (window.scrollY > triggerHeight) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-3 rounded-full bg-black text-white shadow-xl shadow-black/30 hover:scale-110 hover:bg-black/80 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
      aria-label="Back to top"
    >
      <FaArrowUp className="text-sm" />
    </button>
  );
};

export default BackToTopButton;
