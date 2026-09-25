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
  QrCode as QrIcon,
  FileDown,
  Loader2,
  Sparkles,
  ShieldCheck,
  Scissors
} from "lucide-react";

export default function QRStudioPage() {
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingMode, setGeneratingMode] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [template, setTemplate] = useState<"midnight" | "minimal" | "tent">("midnight");
  const [headline, setHeadline] = useState("Enjoyed your visit today?");
  const [subheadline, setSubheadline] = useState("Scan with your phone to leave a quick 5-star Google review & support our team!");
  const [copiedLink, setCopiedLink] = useState(false);

  const standeeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/business/me");
        const data = await res.json();
        if (data.success && data.business) {
          setBusiness(data.business);
          if (data.business.category === "salon") setHeadline("Loved your new look?");
          else if (data.business.category === "restaurant") setHeadline("How was your meal today?");
          else if (data.business.category === "cafe") setHeadline("Enjoyed your coffee & food?");
          else if (data.business.category === "snacks") setHeadline("Loved the taste & snacks today?");

          const origin = typeof window !== "undefined" ? window.location.origin : "https://review.welurik.com";
          const reviewUrl = `${origin}/r/${data.business.slug}`;

          // High-density QR code for optical scan precision
          const url = await QRCode.toDataURL(reviewUrl, {
            width: 720,
            margin: 2,
            color: {
              dark: "#000000",
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

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${business?.slug || "business"}-google-review-qr.png`;
    a.click();
  };

  const handleCopyLink = () => {
    if (!business?.slug) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://review.welurik.com";
    const reviewUrl = `${origin}/r/${business.slug}`;
    navigator.clipboard.writeText(reviewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // -------------------------------------------------------------
  // Pure Native Vector CMYK Renderer (100% /DeviceCMYK, Zero RGB)
  // -------------------------------------------------------------
  const renderCmykStandee = (
    doc: any,
    offsetX: number,
    offsetY: number,
    activeTemplate: "midnight" | "minimal" | "tent"
  ) => {
    const isDark = activeTemplate === "midnight";

    // 1. Full Bleed Background in Native CMYK
    if (isDark) {
      // Commercial Rich Obsidian Black (C: 70%, M: 60%, Y: 60%, K: 100%)
      doc.setFillColor(0.70, 0.60, 0.60, 1.0);
    } else {
      // Pure Paper White (C: 0%, M: 0%, Y: 0%, K: 0%)
      doc.setFillColor(0, 0, 0, 0);
    }
    doc.rect(offsetX, offsetY, 4, 6, "F");

    // 2. Eyebrow Tag in Native CMYK
    if (isDark) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(0, 0.25, 1.0, 0); // CMYK Process Amber Gold
      doc.text("RATE YOUR EXPERIENCE", offsetX + 2, offsetY + 0.62, { align: "center" });
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(0.20, 0.10, 0, 0.50); // CMYK Slate
      doc.text("REVIEW US ON GOOGLE", offsetX + 2, offsetY + 0.62, { align: "center" });
    }

    // 3. Business Name in Native CMYK
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    if (isDark) {
      doc.setTextColor(0, 0, 0, 0); // CMYK Pure White
    } else {
      doc.setTextColor(0, 0, 0, 1.0); // CMYK Process Black
    }
    const bName = (business?.name || "The Coffee House");
    doc.text(bName.length > 24 ? bName.slice(0, 24) + "..." : bName, offsetX + 2, offsetY + 0.95, { align: "center" });

    // 4. Five Gold Stars (Pure CMYK Vector Polygons)
    const drawVectorStar = (cx: number, cy: number, outerR: number, innerR: number) => {
      doc.setFillColor(0, 0.25, 1.0, 0); // CMYK Amber Gold
      const spikes = 5;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;
      const coords: [number, number][] = [];
      const startX = cx + Math.cos(rot) * outerR;
      const startY = cy + Math.sin(rot) * outerR;
      let prevX = startX;
      let prevY = startY;
      rot += step;
      for (let i = 0; i < spikes * 2 - 1; i++) {
        const r = i % 2 === 0 ? innerR : outerR;
        const currX = cx + Math.cos(rot) * r;
        const currY = cy + Math.sin(rot) * r;
        coords.push([currX - prevX, currY - prevY]);
        prevX = currX;
        prevY = currY;
        rot += step;
      }
      doc.lines(coords, startX, startY, [1, 1], "F", true);
    };

    const starY = offsetY + 1.22;
    const starSpacing = 0.16;
    const starStartX = offsetX + 2 - (2 * starSpacing);
    for (let i = 0; i < 5; i++) {
      drawVectorStar(starStartX + i * starSpacing, starY, 0.065, 0.03);
    }

    // 5. White Rounded QR Frame Container in Native CMYK
    doc.setFillColor(0, 0, 0, 0); // Pure White
    const containerW = 2.4;
    const containerH = 2.4;
    const containerX = offsetX + (4 - containerW) / 2;
    const containerY = offsetY + 1.48;
    doc.roundedRect(containerX, containerY, containerW, containerH, 0.25, 0.25, "F");

    if (!isDark) {
      doc.setDrawColor(0, 0, 0, 0.15);
      doc.setLineWidth(0.01);
      doc.roundedRect(containerX, containerY, containerW, containerH, 0.25, 0.25, "S");
    }

    // 6. Vector QR Code in 100% Process Black (0, 0, 0, 1.0 k)
    const reviewTargetUrl = `https://review.welurik.com/r/${business?.slug || "business"}`;
    const qr = QRCode.create(reviewTargetUrl, { errorCorrectionLevel: "H" });
    const size = qr.modules.size;
    const qrW = 2.0;
    const cellSize = qrW / size;
    const qrX = offsetX + (4 - qrW) / 2;
    const qrY = containerY + (containerH - qrW) / 2;
    doc.setFillColor(0, 0, 0, 1.0); // 100% Process Black
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (qr.modules.get(r, c)) {
          doc.rect(qrX + c * cellSize, qrY + r * cellSize, cellSize, cellSize, "F");
        }
      }
    }

    // 7. Headline in Native CMYK
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    if (isDark) {
      doc.setTextColor(0, 0.25, 1.0, 0); // CMYK Amber Gold
    } else {
      doc.setTextColor(0, 0, 0, 1.0); // CMYK Process Black
    }
    doc.text(headline || "Enjoyed your visit today?", offsetX + 2, offsetY + 4.35, { align: "center" });

    // 8. Subheadline in Native CMYK
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    if (isDark) {
      doc.setTextColor(0.20, 0.10, 0, 0.35); // Clean Slate
    } else {
      doc.setTextColor(0.20, 0.10, 0, 0.55); // Slate
    }
    const sub = subheadline || "Scan with your phone to leave a quick 5-star Google review & support our team!";
    doc.text(sub, offsetX + 2, offsetY + 4.62, { align: "center", maxWidth: 3.1 });

    // 9. Clean Subtle Footer Divider Line
    if (isDark) {
      doc.setDrawColor(0.20, 0.10, 0, 0.70);
    } else {
      doc.setDrawColor(0, 0, 0, 0.12);
    }
    doc.setLineWidth(0.01);
    doc.line(offsetX + 0.35, offsetY + 5.38, offsetX + 3.65, offsetY + 5.38);

    // 10. Welurik Emerald Logo Badge in Native CMYK (C: 85%, M: 10%, Y: 80%, K: 25%)
    doc.setFillColor(0.85, 0.10, 0.80, 0.25);
    doc.circle(offsetX + 0.48, offsetY + 5.58, 0.09, "F");

    // White 'W' inside badge
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0, 0); // Pure White
    doc.text("W", offsetX + 0.48, offsetY + 5.61, { align: "center" });

    // 'Powered by Welurik'
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    if (isDark) {
      doc.setTextColor(0, 0, 0, 0); // Pure White
    } else {
      doc.setTextColor(0, 0, 0, 1.0); // Black
    }
    doc.text("Powered by Welurik", offsetX + 0.64, offsetY + 5.61);

    // 'review.welurik.com'
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(0.20, 0.10, 0, isDark ? 0.35 : 0.55);
    doc.text("review.welurik.com", offsetX + 3.65, offsetY + 5.61, { align: "right" });
  };

  // -------------------------------------------------------------
  // High-Resolution 100% CMYK Vector PDF Engine (Zero RGB)
  // -------------------------------------------------------------
  const handleDownloadPDF = async (format: "4x6" | "a4" = "4x6", openPrintView = false) => {
    if (!business) return;

    // Handle popup window safely if print view is triggered
    let printWin: Window | null = null;
    if (openPrintView && typeof window !== "undefined") {
      printWin = window.open("", "_blank");
      if (printWin) {
        printWin.document.write(
          "<!DOCTYPE html><html><head><title>Opening 4x6 Standee...</title></head><body style='font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#090d16;color:#ffffff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;'><div style='text-align:center;'><h2 style='margin:0 0 8px 0;font-size:18px;'>⚡ Generating 4\" × 6\" CMYK Print Document</h2><p style='color:#94a3b8;font-size:13px;margin:0;'>Opening print dialog with exact 4\" × 6\" dimensions...</p></div></body></html>"
        );
      }
    }

    try {
      setGeneratingPdf(true);
      setGeneratingMode(openPrintView ? "print" : format);

      // Dynamically import jsPDF
      const { jsPDF } = await import("jspdf");

      // ---------------------------------------------------------
      // FORMAT A: STRICT 4" x 6" PURE CMYK VECTOR PDF
      // ---------------------------------------------------------
      if (format === "4x6") {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "in",
          format: [4, 6],
        });

        pdf.setProperties({
          title: `${business.name || "Business"} - Exact 4x6 CMYK Standee Card`,
          subject: "Commercial 4x6 CMYK Vector Standee",
          author: "Welurik Review System",
          creator: "Welurik (welurik.com)",
        });

        // Render pure CMYK vectors directly on PDF (Zero RGB)
        renderCmykStandee(pdf, 0, 0, template);

        if (openPrintView) {
          pdf.autoPrint();
          const blobUrl = URL.createObjectURL(pdf.output("blob"));
          if (printWin) {
            printWin.location.href = blobUrl;
          } else {
            pdf.save(`${business.slug || "business"}-standee-4x6-cmyk.pdf`);
          }
        } else {
          pdf.save(`${business.slug || "business"}-standee-4x6-cmyk.pdf`);
        }
      }

      // ---------------------------------------------------------
      // FORMAT B: A4 SHEET WITH 4" x 6" DASHED CUT LINES
      // ---------------------------------------------------------
      else if (format === "a4") {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "in",
          format: "a4",
        });

        const pageWidth = 8.27;
        const pageHeight = 11.69;
        const cardW = 4.0;
        const cardH = 6.0;
        const startX = (pageWidth - cardW) / 2;
        const startY = (pageHeight - cardH) / 2;

        pdf.setProperties({
          title: `${business.name || "Business"} - 4x6 Standee on A4 Cut Sheet`,
          subject: "4x6 CMYK Standee with Cut Lines for A4 Desktop Printers",
          author: "Welurik Review System",
          creator: "Welurik (welurik.com)",
        });

        // Render pure CMYK vectors centered on A4
        renderCmykStandee(pdf, startX, startY, template);

        // Dashed cutting line around the 4x6 card
        pdf.setLineDashPattern([0.05, 0.05], 0);
        pdf.setDrawColor(0.20, 0.10, 0, 0.40); // CMYK Slate
        pdf.setLineWidth(0.012);
        pdf.rect(startX, startY, cardW, cardH, "S");

        // Header scissor cutting instruction
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9.5);
        pdf.setTextColor(0.20, 0.10, 0, 0.70);
        pdf.text(
          "✂  Cut along dashed rectangle for exact 4\" × 6\" acrylic standee card (101.6 × 152.4 mm)",
          pageWidth / 2,
          startY - 0.22,
          { align: "center" }
        );

        // Bottom print instruction
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(0.20, 0.10, 0, 0.50);
        pdf.text(
          "Printer Setting: Scale 100% (Actual Size / Do not select 'Fit to Page')",
          pageWidth / 2,
          startY + cardH + 0.25,
          { align: "center" }
        );

        if (openPrintView) {
          pdf.autoPrint();
          const blobUrl = URL.createObjectURL(pdf.output("blob"));
          if (printWin) {
            printWin.location.href = blobUrl;
          } else {
            pdf.save(`${business.slug || "business"}-standee-4x6-on-A4-cmyk.pdf`);
          }
        } else {
          pdf.save(`${business.slug || "business"}-standee-4x6-on-A4-cmyk.pdf`);
        }
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      if (printWin) printWin.close();
      alert("Could not generate PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
      setGeneratingMode("");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
              100% CMYK Vector Format
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              Exact 4" × 6" Portrait (101.6 × 152.4 mm)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Standee Studio</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Print-ready 4" × 6" vertical acrylic standees in pure CMYK color space with Welurik branding.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* PRIMARY: Download Exact 4x6 CMYK PDF */}
          <button
            type="button"
            onClick={() => handleDownloadPDF("4x6", false)}
            disabled={generatingPdf || loading}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            title="Download true 4x6 inch PDF in 100% CMYK color format"
          >
            {generatingPdf && generatingMode === "4x6" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            {generatingPdf && generatingMode === "4x6" ? "Generating CMYK..." : "Download 4\" × 6\" CMYK PDF"}
          </button>

          {/* SECONDARY: Print 4x6 Card */}
          <button
            type="button"
            onClick={() => handleDownloadPDF("4x6", true)}
            disabled={generatingPdf || loading}
            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
            title="Open native 4x6 print dialog directly"
          >
            {generatingPdf && generatingMode === "print" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Printer className="w-4 h-4" />
            )}
            Print 4" × 6" Card
          </button>

          {/* TERTIARY: Download A4 Sheet with 4x6 Cut Guidelines */}
          <button
            type="button"
            onClick={() => handleDownloadPDF("a4", false)}
            disabled={generatingPdf || loading}
            className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50 border border-slate-200"
            title="Download on A4 paper with dashed scissors cut guidelines for standard office printers"
          >
            {generatingPdf && generatingMode === "a4" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Scissors className="w-3.5 h-3.5 text-slate-600" />
            )}
            A4 Cut Sheet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Customizer Controls */}
        <div className="lg:col-span-5 space-y-6 no-print">
          <div className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-700" /> Standee Layout
                </h2>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  4" × 6" CMYK
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Select your print theme for acrylic counter stands or table tents.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "midnight", name: "Midnight Luxe", desc: "Dark obsidian VIP theme" },
                { id: "minimal", name: "Nordic Minimal", desc: "Clean white acrylic aesthetic" },
                { id: "tent", name: "Table Tent", desc: "Foldable double-sided card" },
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
                  <p className="text-xs font-bold flex items-center gap-1">
                    {t.id === "midnight" && <Sparkles className="w-3 h-3 text-amber-400" />}
                    {t.name}
                  </p>
                  <p className={`text-[9.5px] mt-0.5 line-clamp-1 ${template === t.id ? "text-slate-300" : "text-slate-400"}`}>
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

            {/* Welurik Branding Assurance */}
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200/60 text-[11px] text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official <strong>Powered by Welurik</strong> footer is permanently embedded in the output.</span>
            </div>

            {/* Quick Actions */}
            <div className="pt-1 grid grid-cols-2 gap-2">
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

        {/* RIGHT: Live Printable 4" x 6" Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Format Badge */}
          <div className="w-full max-w-[340px] sm:max-w-[360px] mb-3 flex items-center justify-between no-print">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live 4" × 6" Preview
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              CMYK Print Ready
            </span>
          </div>

          {/* PRINTABLE CONTAINER (Exact 4:6 Aspect Ratio matching media_1790331282508.png) */}
          <div
            id="printable-standee"
            ref={standeeRef}
            className="w-full max-w-[340px] sm:max-w-[360px] aspect-[4/6] bg-slate-950 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden transition-all duration-300 mx-auto flex flex-col justify-between"
          >
            {/* TEMPLATE: MIDNIGHT LUXE (Default Exact Match) */}
            {template === "midnight" && (
              <div className="h-full w-full p-6 text-center flex flex-col items-center justify-between bg-slate-950 text-white select-none">
                {/* Top Section */}
                <div className="w-full space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">
                    Rate Your Experience
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-white leading-snug">
                    {business?.name || "Altus Nutrition"}
                  </h3>
                  <div className="flex items-center justify-center gap-1 pt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Center High-Contrast QR Code */}
                <div className="my-auto p-3.5 bg-white rounded-3xl shadow-xl">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Review QR Code"
                      className="w-40 h-40 rounded-xl object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-40 h-40 bg-slate-100 flex items-center justify-center rounded-xl">
                      <QrIcon className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                </div>

                {/* Bottom Call To Action */}
                <div className="w-full space-y-1 mb-2">
                  <h4 className="text-xs font-bold text-amber-400">{headline}</h4>
                  <p className="text-[10.5px] text-slate-400 max-w-[250px] mx-auto leading-relaxed">
                    {subheadline}
                  </p>
                </div>

                {/* Welurik Bottom Branding Footer (Clean & Elegant) */}
                <div className="w-full pt-3 mt-auto border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-black text-slate-950">
                      W
                    </div>
                    <span className="font-bold text-white tracking-tight">Powered by Welurik</span>
                  </div>
                  <span className="text-[9.5px] text-slate-400 font-mono">review.welurik.com</span>
                </div>
              </div>
            )}

            {/* TEMPLATE: NORDIC MINIMAL */}
            {template === "minimal" && (
              <div className="h-full w-full p-6 text-center flex flex-col items-center justify-between bg-white text-slate-900 select-none">
                <div className="w-full space-y-1">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">
                    Review Us On Google
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                    {business?.name || "The Coffee House"}
                  </h3>
                  <div className="flex items-center justify-center gap-1 pt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <div className="my-auto p-3.5 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="Review QR Code"
                      className="w-40 h-40 rounded-xl object-contain mx-auto"
                    />
                  )}
                </div>

                <div className="w-full space-y-1 mb-2">
                  <h4 className="text-xs font-bold text-slate-900">{headline}</h4>
                  <p className="text-[10.5px] text-slate-500 max-w-[240px] mx-auto leading-relaxed">{subheadline}</p>
                </div>

                {/* Welurik Bottom Branding */}
                <div className="w-full pt-3 mt-auto border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-[9px] font-black text-white">
                      W
                    </div>
                    <span className="font-bold text-slate-800 tracking-tight">Powered by Welurik</span>
                  </div>
                  <span className="text-[9.5px] text-slate-400 font-mono">review.welurik.com</span>
                </div>
              </div>
            )}

            {/* TEMPLATE: TABLE TENT */}
            {template === "tent" && (
              <div className="h-full w-full p-5 text-center flex flex-col items-center justify-between bg-white border-2 border-slate-200 select-none">
                <div className="w-full border-b border-dashed border-slate-300 pb-1.5 mb-1">
                  <p className="text-[8.5px] font-bold uppercase tracking-widest text-slate-400">
                    ✂️ 4" × 6" Fold along center line for Table Tent
                  </p>
                </div>

                <div className="w-full space-y-1">
                  <h3 className="text-base font-bold text-slate-900">{business?.name || "The Coffee House"}</h3>
                  <p className="text-xs text-slate-600 font-semibold">{headline}</p>
                </div>

                <div className="my-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {qrDataUrl && (
                    <img src={qrDataUrl} alt="Review QR" className="w-32 h-32 object-contain mx-auto" />
                  )}
                </div>

                <div className="w-full space-y-1 mb-2">
                  <p className="text-[10.5px] text-slate-500 font-medium max-w-[240px] mx-auto">{subheadline}</p>
                  <div className="flex items-center justify-center gap-1 text-amber-400 pt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Welurik Bottom Branding */}
                <div className="w-full pt-2 mt-auto border-t border-slate-200 flex items-center justify-between text-[9.5px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 flex items-center justify-center text-[8px] font-black text-white">
                      W
                    </div>
                    <span className="font-bold text-slate-800">Powered by Welurik</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">review.welurik.com</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
