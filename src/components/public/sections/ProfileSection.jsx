"use client";

import React from "react";
import Image from "next/image";

const ProfileSection = ({ data }) => {
  if (!data) return null;

  const fullName = `${data?.name?.first || ""} ${data?.name?.last || ""}`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16">
        <div className="flex-1 text-center lg:text-left space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Hi, I&apos;m <span className="gradient-text">{fullName}</span>
          </h1>

          <div className="flex flex-wrap justify-center gap-2">
            {data?.roles?.map((role, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)]"
              >
                {role}
              </span>
            ))}
          </div>

          <div className="space-y-3 text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
            {data?.description?.slice(0, 3).map((desc, i) => (
              <p key={i}>{desc}</p>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="ml-4 px-4 py-2 rounded-xl gradient-bg text-white font-semibold shadow-md hover:scale-105 transition hover:cursor-pointer"
            >
              Contact Me
            </button>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 blur-2xl" />

            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <div className="absolute inset-0 backdrop-blur-xl bg-white/10 z-0" />
              <Image
                src={data?.profileImage?.url}
                alt={fullName}
                fill
                className="object-contain z-10"
                sizes="(max-width: 640px) 224px, (max-width: 1024px) 256px, 320px"
                priority
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-20" />

              <div className="shine-overlay z-30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
