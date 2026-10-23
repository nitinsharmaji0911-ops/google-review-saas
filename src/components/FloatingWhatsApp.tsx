"use client";

import React from "react";
import { motion } from "framer-motion";

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  message?: string;
}

export default function FloatingWhatsApp({
  phoneNumber = "918421706305",
  message = "Hi Welurik, I want to know more about Welurik Review.",
}: FloatingWhatsAppProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <aside
      aria-label="Direct WhatsApp Contact"
      className="fixed bottom-[74px] sm:bottom-6 right-3.5 sm:right-6 z-40 select-none"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center cursor-pointer"
          aria-label="Chat with us on WhatsApp"
        >
          {/* Subtle Ambient Pulse Ring */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366]/35 animate-ping opacity-75 pointer-events-none" />

          {/* Desktop Hover Tooltip */}
          <span className="hidden sm:inline-flex absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Chat with us
            <span className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-slate-900" />
          </span>

          {/* Real Official WhatsApp Icon */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 active:scale-95 drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 175.216 175.552"
              className="w-full h-full select-none"
            >
              <defs>
                <linearGradient id="wa-body-gradient" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#57d163" />
                  <stop offset="1" stopColor="#23b33a" />
                </linearGradient>
                <filter id="wa-shadow-blur" width="1.115" height="1.114" x="-.057" y="-.057" colorInterpolationFilters="sRGB">
                  <feGaussianBlur stdDeviation="3.531" />
                </filter>
              </defs>
              {/* Shadow Base */}
              <path
                fill="#000000"
                fillOpacity="0.2"
                d="m54.532 138.45 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.523h.023c33.707 0 61.139-27.426 61.153-61.135.006-16.335-6.349-31.696-17.895-43.251A60.75 60.75 0 0 0 87.94 25.983c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.558zm-40.811 23.544L24.16 123.88c-6.438-11.154-9.825-23.808-9.821-36.772.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954zm0 0"
                filter="url(#wa-shadow-blur)"
              />
              {/* Speech Bubble Outline (White) */}
              <path
                fill="#ffffff"
                d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"
              />
              {/* WhatsApp Green Body */}
              <path
                fill="url(#wa-body-gradient)"
                d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
              />
              {/* Official White Phone Receiver */}
              <path
                fill="#ffffff"
                fillRule="evenodd"
                d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
              />
            </svg>

            {/* Notification Badge Dot */}
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-[9px] font-black text-white leading-none">1</span>
            </span>
          </div>
        </a>
      </motion.div>
    </aside>
  );
}
