"use client";

import Image from "next/image";

const Testimonial = ({ data = [] }) => {
  if (!data.length) return null;

  const loopData = [...data, ...data];

  return (
    <div className="relative w-full overflow-hidden">
      <div className="testimonial-track">
        {loopData.map((item, index) => (
          <div
            key={`${item._id}-${index}`}
            className="w-full flex-shrink-0 px-6 sm:px-10 lg:px-20"
          >
            <div className="relative max-w-4xl mx-auto text-center py-10">
              <div className="absolute top-0 left-0 text-[100px] sm:text-[130px] lg:text-[160px] text-[var(--glass-border)] leading-none pointer-events-none select-none">
                &ldquo;
              </div>

              <div className="absolute bottom-0 right-0 text-[100px] sm:text-[130px] lg:text-[160px] text-[var(--glass-border)] leading-none pointer-events-none select-none">
                &rdquo;
              </div>

              <p className="relative text-lg sm:text-xl lg:text-2xl text-[var(--text-primary)] leading-relaxed font-medium mb-10 px-6 sm:px-10">
                {item.quote}
              </p>

              <div className="flex flex-col items-center gap-3">
                <Image
                  src={item.senderImage?.url}
                  alt={item.senderName}
                  width={64}
                  height={64}
                  className="rounded-full object-cover border border-[var(--glass-border)]"
                />

                <div>
                  <p className="text-base font-semibold text-[var(--text-primary)]">
                    {item.senderName}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {item.senderRole} • {item.company}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[var(--bg-color)] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[var(--bg-color)] to-transparent" />
    </div>
  );
};

export default Testimonial;
