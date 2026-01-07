"use client";

import { useState } from "react";

export default function HowItWorksCard({ steps }) {
  const [current, setCurrent] = useState(0);
  const total = steps.length;

  const handlePrev = () =>
    setCurrent((prev) => (prev - 1 + total) % total);
  const handleNext = () => setCurrent((prev) => (prev + 1) % total);

  const step = steps[current];

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-4 sm:p-6 backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/50">
          How it works
        </p>
        <div className="flex gap-1.5 sm:gap-2">
          <button
            className="rounded-full border border-white/20 px-2.5 sm:px-3 py-1 text-xs text-white/70 transition hover:border-white/50"
            onClick={handlePrev}
            aria-label="Previous step"
          >
            ←
          </button>
          <button
            className="rounded-full border border-white/20 px-2.5 sm:px-3 py-1 text-xs text-white/70 transition hover:border-white/50"
            onClick={handleNext}
            aria-label="Next step"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#d4ed31]">
          Step {(current + 1).toString().padStart(2, "0")}
        </p>
        <h3 className="mt-2 sm:mt-3 text-base sm:text-lg lg:text-xl font-semibold text-white">{step.title}</h3>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-white/70">{step.description}</p>
      </div>

      <div className="mt-4 sm:mt-6 flex items-center justify-center gap-1.5 sm:gap-2">
        {steps.map((_, idx) => (
          <span
            key={idx}
            className={`h-1 rounded-full transition-all ${
              idx === current ? "w-8 sm:w-10 bg-[#d4ed31]" : "w-3 sm:w-4 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

