"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  Printer,
  Download,
  Star,
  Copy,
  Check,
  Layers,
  QrCode as QrIcon
} from "lucide-react";

export default function QRStudioPage() {
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [template, setTemplate] = useState<"minimal" | "midnight" | "tent" | "badge">("minimal");
  const [headline, setHeadline] = useState("Enjoyed your visit today?");
  const [subheadline, setSubheadline] = useState("Scan to leave a 30-second Google review & support our team!");
  const [copiedLink, setCopiedLink] = useState(false);

  const standeeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/business/the-coffee-house");
        const data = await res.json();
        if (data.success && data.business) {
          setBusiness(data.business);
          if (data.business.category === "salon") setHeadline("Loved your new look?");
          else if (data.business.category === "restaurant") setHeadline("How was your meal today?");
          else if (data.business.category === "cafe") setHeadline("Enjoyed your coffee & food?");

          const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
          const reviewUrl = `${origin}/r/${data.business.slug}`;

          const url = await QRCode.toDataURL(reviewUrl, {
            width: 512,
            margin: 2,
            color: {
              dark: "#0f172a",
              light: "#ffffff",
            },
            errorCorrectionLevel: "H",
          });
          setQrDataUrl(url);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${business?.slug || "business"}-google-review-qr.png`;
    a.click();
  };

  const handleCopyLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const reviewUrl = `${origin}/r/${business?.slug || "the-coffee-house"}`;
    navigator.clipboard.writeText(reviewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Standee Studio</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Design and print custom 4" x 6" acrylic standees and table tent cards with your live review QR code.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="self-start md:self-auto py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
        >
          <Printer className="w-4 h-4" /> Print Standee Card
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Customizer Controls */}
        <div className="lg:col-span-5 space-y-6 no-print">
          <div className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-700" /> Standee Layout
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select a format for acrylic frames or counter stickers.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "minimal", name: "Nordic Minimal", desc: "Apple acrylic style" },
                { id: "midnight", name: "Midnight Luxe", desc: "Dark & gold theme" },
                { id: "tent", name: "Table Tent", desc: "Foldable double card" },
                { id: "badge", name: "Register Badge", desc: "Counter sticker" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id as any)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    template === t.id
                      ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                      : "border-slate-200/80 hover:border-slate-300 bg-slate-50 text-slate-800"
                  }`}
                >
                  <p className="text-xs font-bold">{t.name}</p>
                  <p className={`text-[10px] mt-0.5 ${template === t.id ? "text-slate-300" : "text-slate-400"}`}>
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>

            <hr className="border-slate-100" />

            {/* Text Customization */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline Text</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sub-headline Note</label>
                <textarea
                  rows={2}
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium text-slate-900 resize-none"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadQR}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Download QR
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Printable Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-sm mb-3 flex items-center justify-between no-print">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Live Preview
            </span>
            <span className="text-xs font-medium text-slate-400">
              4" x 6" Frame Layout
            </span>
          </div>

          {/* PRINTABLE CONTAINER */}
          <div
            id="printable-standee"
            ref={standeeRef}
            className="w-full max-w-sm bg-white rounded-[32px] shadow-lg border border-slate-200/90 overflow-hidden transition-all duration-300"
          >
            {/* NORDIC CLEAN MINIMAL */}
            {template === "minimal" && (
              <div className="p-8 text-center flex flex-col items-center justify-between min-h-[480px]">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Review Us On Google
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {business?.name || "The Coffee House"}
                  </h3>
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <div className="my-5 p-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm relative">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Review QR Code"
                      className="w-44 h-44 rounded-xl object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-44 h-44 bg-slate-100 flex items-center justify-center rounded-xl">
                      <QrIcon className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">{headline}</h4>
                  <p className="text-[11px] text-slate-500 max-w-[240px] leading-relaxed">{subheadline}</p>
                  <p className="text-[10px] font-bold text-slate-900 pt-2 tracking-wide uppercase">
                    ⚡ 30 Seconds • Tap to Post
                  </p>
                </div>
              </div>
            )}

            {/* MIDNIGHT LUXE */}
            {template === "midnight" && (
              <div className="p-8 text-center flex flex-col items-center justify-between min-h-[480px] bg-slate-950 text-white">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                    Rate Your Experience
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-white">
                    {business?.name || "The Coffee House"}
                  </h3>
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <div className="my-5 p-3 bg-white rounded-3xl shadow-xl">
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="Review QR Code"
                      className="w-44 h-44 rounded-xl object-contain mx-auto"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-300">{headline}</h4>
                  <p className="text-[11px] text-slate-400 max-w-[240px] leading-relaxed">{subheadline}</p>
                </div>
              </div>
            )}

            {/* TABLE TENT */}
            {template === "tent" && (
              <div className="p-6 text-center flex flex-col items-center justify-between min-h-[480px] bg-white border-2 border-slate-200">
                <div className="w-full border-b border-dashed border-slate-300 pb-2 mb-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    ✂️ Fold along center line for Table Tent
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">{business?.name || "The Coffee House"}</h3>
                  <p className="text-xs text-slate-600 font-semibold">{headline}</p>
                </div>

                <div className="my-3 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {qrDataUrl && (
                    <img src={qrDataUrl} alt="Review QR" className="w-36 h-36 object-contain mx-auto" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium max-w-[240px]">{subheadline}</p>
                  <div className="flex items-center justify-center gap-1 text-amber-400 pt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* REGISTER BADGE */}
            {template === "badge" && (
              <div className="p-6 text-center flex flex-col items-center justify-center min-h-[400px] bg-white">
                <h3 className="text-sm font-extrabold text-slate-900 mb-2">
                  {business?.name || "The Coffee House"}
                </h3>
                <div className="p-2 bg-white rounded-3xl border-2 border-slate-900 shadow-md mb-3">
                  {qrDataUrl && (
                    <img src={qrDataUrl} alt="Review QR" className="w-36 h-36 object-contain mx-auto" />
                  )}
                </div>
                <div className="bg-slate-100 rounded-xl px-4 py-2">
                  <p className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Scan to Review on Google
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
