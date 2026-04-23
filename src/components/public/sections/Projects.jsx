"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Projects = ({ data = [] }) => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const children = Array.from(container.children);
      const containerLeft = container.scrollLeft;

      let closestIndex = 0;
      let minDiff = Infinity;

      children.forEach((child, index) => {
        const diff = Math.abs(child.offsetLeft - containerLeft);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  if (!data.length) return null;

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8;

    container.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollToIndex = (index) => {
    const container = scrollRef.current;
    if (!container) return;

    const child = container.children[index];
    if (!child) return;

    container.scrollTo({
      left: child.offsetLeft,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => scroll("prev")}
          className="p-2 rounded-full border border-[var(--glass-border)] bg-[var(--bg-color)] shadow hover:scale-105 transition"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => scroll("next")}
          className="p-2 rounded-full border border-[var(--glass-border)] bg-[var(--bg-color)] shadow hover:scale-105 transition"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory gradient-scrollbar"
      >
        {data.map((project) => (
          <div
            key={project._id}
            className="snap-start shrink-0 w-[85%] sm:w-[60%] md:w-[45%] lg:w-[32%]"
          >
            <div className="group h-full rounded-2xl overflow-hidden border border-[var(--glass-border)] bg-[var(--bg-color)]/60 backdrop-blur transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="relative w-full h-48 sm:h-52 md:h-56 overflow-hidden">
                {project.screenshot?.url && (
                  <Image
                    src={project.screenshot.url}
                    alt={project.name}
                    fill
                    sizes="(max-width: 640px) 85vw, (max-width: 768px) 60vw, (max-width: 1024px) 45vw, 32vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>

              <div className="p-4 sm:p-5 md:p-6 flex flex-col gap-4">
                <h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
                  {project.name}
                </h3>

                <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                  {project.description?.slice(0, 3).map((point, idx) => (
                    <li key={idx}>• {point}</li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {project.techStack?.map((tech) => (
                    <span
                      key={tech._id}
                      className="text-xs px-2 py-1 rounded-md bg-[var(--glass-border)] text-[var(--text-secondary)]"
                    >
                      {tech.name}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3 mt-auto">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Live
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--text-secondary)] hover:underline"
                    >
                      Code
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        {data.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              index === activeIndex
                ? "bg-[var(--accent)] w-4"
                : "bg-[var(--border)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Projects;
