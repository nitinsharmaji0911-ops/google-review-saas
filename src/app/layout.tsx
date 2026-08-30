import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReviewBoost — 30-Second AI Google Review Assistant",
  description: "Help happy customers leave genuine, detailed 5-star Google reviews in 30 seconds with custom QR codes and smart AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
