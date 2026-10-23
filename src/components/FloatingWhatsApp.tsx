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

          {/* WhatsApp Icon Container */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 active:scale-95 drop-shadow-lg">
            <svg
              viewBox="0 0 48 48"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="wa-shadow-filter" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#000000" flood-opacity="0.3"/>
                </filter>
              </defs>

              {/* White Outline / Border */}
              <path
                d="M24 3.5C12.68 3.5 3.5 12.68 3.5 24C3.5 27.67 4.46 31.18 6.18 34.25L3.5 44.5L14.05 41.76C17.03 43.41 20.42 44.5 24 44.5C35.32 44.5 44.5 35.32 44.5 24C44.5 12.68 35.32 3.5 24 3.5Z"
                fill="#FFFFFF"
                filter="url(#wa-shadow-filter)"
              />

              {/* Emerald Green Speech Bubble (#25D366) */}
              <path
                d="M24 5.5C13.78 5.5 5.5 13.78 5.5 24C5.5 27.34 6.38 30.53 7.95 33.32L5.8 42.2L14.93 39.82C17.65 41.35 20.73 42.5 24 42.5C34.22 42.5 42.5 34.22 42.5 24C42.5 13.78 34.22 5.5 24 5.5Z"
                fill="#25D366"
              />

              {/* WhatsApp Phone Receiver Icon */}
              <path
                d="M17.507 14.307l-.009.075c-.286.988-.247 1.954.058 2.871.511 1.368 1.246 2.652 2.184 3.82 1.306 1.624 2.856 3.008 4.606 4.107 1.25.777 2.614 1.35 4.055 1.705.862.213 1.725.13 2.53-.298.803-.433 1.372-1.144 1.688-1.996l.491-1.32-.01-.005c.097-.261.026-.554-.18-.737l-3.059-2.583a.684.684 0 0 0-.74-.085l-1.572.787a.455.455 0 0 1-.497-.058c-.985-.758-1.89-1.623-2.697-2.578a.453.453 0 0 1-.059-.497l.787-1.572a.684.684 0 0 0-.085-.74l-2.583-3.059a.625.625 0 0 0-.737-.18l-1.32.491c-.852.316-1.563.885-1.996 1.688-.258.484-.393 1.018-.462 1.562z"
                fill="#FFFFFF"
                transform="scale(1.05) translate(-1.5, -0.5)"
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
