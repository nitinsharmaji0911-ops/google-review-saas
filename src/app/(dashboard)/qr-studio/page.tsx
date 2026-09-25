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
  Palette,
  Scissors
} from "lucide-react";

export default function QRStudioPage() {
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingMode, setGeneratingMode] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [template, setTemplate] = useState<"cmyk" | "minimal" | "midnight" | "tent">("cmyk");
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

          // High-density QR code for optical 300 DPI scan precision
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
  // High-Resolution 300 DPI PDF Engine (Exact 4" x 6" or A4 Sheet)
  // -------------------------------------------------------------
  const handleDownloadPDF = async (format: "4x6" | "a4" = "4x6", openPrintView = false) => {
    if (!business) return;

    // If opening print view, initiate window immediately to prevent popup blockers
    let printWin: Window | null = null;
    if (openPrintView && typeof window !== "undefined") {
      printWin = window.open("", "_blank");
      if (printWin) {
        printWin.document.write(
          "<!DOCTYPE html><html><head><title>Preparing 4x6 Standee...</title></head><body style='font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#090d16;color:#ffffff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;'><div style='text-align:center;'><h2 style='margin:0 0 8px 0;font-size:18px;'>⚡ Generating 4\" × 6\" Print PDF</h2><p style='color:#94a3b8;font-size:13px;margin:0;'>Preparing 300 DPI CMYK calibrated document...</p></div></body></html>"
        );
      }
    }

    try {
      setGeneratingPdf(true);
      setGeneratingMode(openPrintView ? "print" : format);

      // Dynamically import jsPDF
      const { jsPDF } = await import("jspdf");

      // 4" x 6" at 300 DPI = 1200 x 1800 pixels
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1800;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const isDark = template === "midnight";
      const bg = isDark ? "#0A0A0A" : "#FFFFFF";
      const primaryText = isDark ? "#FFFFFF" : "#0A0A0A";
      const secondaryText = isDark ? "#94A3B8" : "#475569";
      const borderColor = isDark ? "#27272A" : "#E2E8F0";

      // 1. Base Background (Full Bleed Edge-To-Edge)
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1200, 1800);

      // 2. Commercial Print Calibration Guide
      ctx.strokeStyle = isDark ? "#1E293B" : "#F1F5F9";
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, 1140, 1740);

      // 3. CMYK Color Calibration Strip (Commercial Print Standard)
      if (template === "cmyk") {
        const cmykColors = ["#00AEEF", "#EC008C", "#FFF200", "#000000"];
        const dotRadius = 9;
        const spacing = 32;
        const stripStartX = 600 - ((cmykColors.length - 1) * spacing) / 2;
        cmykColors.forEach((color, idx) => {
          ctx.beginPath();
          ctx.arc(stripStartX + idx * spacing, 65, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        });
      }

      // 4. Google 4-Color Accent Bar
      const googleColors = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];
      const barW = 80;
      const barH = 8;
      const barTotal = barW * googleColors.length;
      const barStartX = (1200 - barTotal) / 2;
      const barY = template === "cmyk" ? 95 : 75;
      googleColors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(barStartX + i * barW, barY, barW, barH);
      });

      // 5. Eyebrow Tag
      ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = isDark ? "#F59E0B" : "#64748B";
      ctx.textAlign = "center";
      ctx.fillText(
        template === "midnight" ? "RATE YOUR EXPERIENCE" : "OFFICIAL GOOGLE REVIEW STANDEE",
        600,
        barY + 50
      );

      // 6. Business Name
      ctx.font = "900 52px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = primaryText;
      ctx.textAlign = "center";
      const bName = (business.name || "Your Business").toUpperCase();
      ctx.fillText(bName.length > 22 ? bName.slice(0, 22) + "..." : bName, 600, barY + 120);

      // 7. Five Google Amber Stars
      const starY = barY + 180;
      const starSpacing = 50;
      const starStartX = 600 - (2 * starSpacing);
      for (let i = 0; i < 5; i++) {
        drawCanvasStar(ctx, starStartX + (i * starSpacing), starY, 5, 20, 9, "#F59E0B");
      }

      // 8. High-Contrast QR Frame Container
      const qrContainerY = starY + 50;
      const qrSize = 620;
      const qrX = (1200 - qrSize) / 2;

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      roundRect(ctx, qrX - 25, qrContainerY, qrSize + 50, qrSize + 50, 40);
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw QR Image
      if (qrDataUrl) {
        const qrImg = new Image();
        await new Promise((resolve) => {
          qrImg.onload = resolve;
          qrImg.src = qrDataUrl;
        });
        ctx.drawImage(qrImg, qrX, qrContainerY + 25, qrSize, qrSize);
      }

      // 9. Scan Call-To-Action Headline
      const textStartY = qrContainerY + qrSize + 115;
      ctx.font = "900 42px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = isDark ? "#FDE047" : "#0F172A";
      ctx.textAlign = "center";
      ctx.fillText(headline, 600, textStartY);

      // 10. Subheadline (multi-line wrapped)
      ctx.font = "500 25px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = secondaryText;
      wrapText(ctx, subheadline, 600, textStartY + 45, 920, 36);

      // 11. Quick Feature Badge
      ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = isDark ? "#E2E8F0" : "#1E293B";
      ctx.fillText("⚡ 30 SECONDS • INSTANT AI REVIEW ASSISTANT", 600, textStartY + 130);

      // 12. WELURIK BOTTOM BRANDING FOOTER (Official Commercial Standard)
      const footerY = 1660;

      // Divider line
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(100, footerY);
      ctx.lineTo(1100, footerY);
      ctx.stroke();

      // Welurik Emerald Logo Badge
      const badgeCenterX = 410;
      const badgeCenterY = footerY + 45;
      ctx.fillStyle = "#059669";
      ctx.beginPath();
      ctx.arc(badgeCenterX, badgeCenterY, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "900 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.fillText("W", badgeCenterX, badgeCenterY + 7);

      // Powered by Welurik Brand Wordmark
      ctx.font = "900 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = primaryText;
      ctx.textAlign = "left";
      ctx.fillText("POWERED BY WELURIK", badgeCenterX + 32, badgeCenterY + 9);

      // Commercial 4x6 CMYK Specification Sub-Label
      ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = isDark ? "#64748B" : "#94A3B8";
      ctx.textAlign = "center";
      ctx.fillText("review.welurik.com • 4\" × 6\" Commercial CMYK Print Standard", 600, footerY + 92);

      const standeeImagePng = canvas.toDataURL("image/png", 1.0);

      // ---------------------------------------------------------
      // FORMAT OPTION A: STRICT 4" x 6" PORTRAIT PDF (Zero Margins)
      // ---------------------------------------------------------
      if (format === "4x6") {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "in",
          format: [4, 6],
        });

        pdf.setProperties({
          title: `${business.name || "Business"} - Exact 4x6 CMYK Standee`,
          subject: "Commercial 4x6 Standee Print Ready",
          author: "Welurik Review System",
          creator: "Welurik (welurik.com)",
        });

        // Add image across entire 4in x 6in page bounds (0, 0, 4, 6)
        pdf.addImage(standeeImagePng, "PNG", 0, 0, 4, 6, undefined, "FAST");

        if (openPrintView) {
          pdf.autoPrint();
          const blobUrl = URL.createObjectURL(pdf.output("blob"));
          if (printWin) {
            printWin.location.href = blobUrl;
          } else {
            pdf.save(`${business.slug || "business"}-standee-exact-4x6-cmyk.pdf`);
          }
        } else {
          pdf.save(`${business.slug || "business"}-standee-exact-4x6-cmyk.pdf`);
        }
      }

      // ---------------------------------------------------------
      // FORMAT OPTION B: A4 SHEET WITH 4" x 6" SCISSOR CUT MARKS
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
          subject: "4x6 Standee with Cut Lines for A4 Desktop Printers",
          author: "Welurik Review System",
          creator: "Welurik (welurik.com)",
        });

        // Embed the 4x6 standee in center of A4
        pdf.addImage(standeeImagePng, "PNG", startX, startY, cardW, cardH, undefined, "FAST");

        // Draw dashed cutting rectangle around the 4x6 card
        pdf.setLineDashPattern([0.05, 0.05], 0);
        pdf.setDrawColor(148, 163, 184); // Slate 400
        pdf.setLineWidth(0.015);
        pdf.rect(startX, startY, cardW, cardH);

        // Header scissor cutting instructions
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(51, 65, 85);
        pdf.text(
          "✂  Cut along dashed rectangle for exact 4\" × 6\" acrylic standee card (101.6 × 152.4 mm)",
          pageWidth / 2,
          startY - 0.22,
          { align: "center" }
        );

        // Bottom print settings instruction
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text(
          "Printer Setting: Scale 100% (Actual Size / Do not select 'Fit to Page') • Fits standard 4\" × 6\" acrylic stands",
          pageWidth / 2,
          startY + cardH + 0.28,
          { align: "center" }
        );

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(5, 150, 105);
        pdf.text(
          "⚡ POWERED BY WELURIK (welurik.com)",
          pageWidth / 2,
          startY + cardH + 0.46,
          { align: "center" }
        );

        if (openPrintView) {
          pdf.autoPrint();
          const blobUrl = URL.createObjectURL(pdf.output("blob"));
          if (printWin) {
            printWin.location.href = blobUrl;
          } else {
            pdf.save(`${business.slug || "business"}-standee-4x6-on-A4-cutsheet.pdf`);
          }
        } else {
          pdf.save(`${business.slug || "business"}-standee-4x6-on-A4-cutsheet.pdf`);
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
              Commercial CMYK Edition
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              Exact 4" × 6" Portrait (101.6 × 152.4 mm)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Standee Studio</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Design and print commercial 4" × 6" vertical acrylic standees and table tent cards with Welurik branding.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* PRIMARY: Download Exact 4" x 6" PDF */}
          <button
            type="button"
            onClick={() => handleDownloadPDF("4x6", false)}
            disabled={generatingPdf || loading}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            title="Download true 4x6 inch PDF with zero outer margins"
          >
            {generatingPdf && generatingMode === "4x6" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            {generatingPdf && generatingMode === "4x6" ? "Generating..." : "Download Exact 4\" × 6\" PDF"}
          </button>

          {/* SECONDARY: Print 4" x 6" Card */}
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

          {/* TERTIARY: Download A4 Sheet with 4" x 6" Cut Guidelines */}
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
                  4" × 6" Vertical
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Select your print theme for acrylic counter stands or table tents.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "cmyk", name: "CMYK Commercial", desc: "Recommended for offset & acrylic print" },
                { id: "minimal", name: "Nordic Minimal", desc: "Clean white acrylic aesthetic" },
                { id: "midnight", name: "Midnight Luxe", desc: "Obsidian & gold VIP standee" },
                { id: "tent", name: "Table Tent 4x6", desc: "Foldable double-sided card" },
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
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    {t.id === "cmyk" && <Sparkles className="w-3 h-3 text-amber-400" />}
                    {t.name}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${template === t.id ? "text-slate-300" : "text-slate-400"}`}>
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Print Standard Callout */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-slate-600 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px]">
                <Palette className="w-3.5 h-3.5 text-emerald-600" />
                CMYK Print Color Profile
              </div>
              <p className="text-[10.5px] text-slate-500 leading-relaxed">
                Pre-calibrated with Rich Black (<code className="text-slate-700 font-mono">#0A0A0A</code>), optical white background, and 300 DPI high-contrast vector QR code for 100% scanner precision in any acrylic frame.
              </p>
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
              <span>Official <strong>Powered by Welurik</strong> footer is permanently embedded at the bottom.</span>
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

          {/* Commercial Print Setup Instructions */}
          <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 text-xs space-y-2 text-slate-600">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <span>🖨️</span> Choosing Your Download Format
            </h3>
            <ul className="space-y-1.5 text-[11px] text-slate-500">
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-emerald-600">1. Exact 4" × 6" PDF:</span>
                <span>The PDF document itself is strictly 4.00" × 6.00" with zero outer paper. Best for commercial printing shops, UV acrylic printers, and photo paper.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-slate-800">2. A4 Cut Sheet:</span>
                <span>Centers the exact 4" × 6" standee on standard A4 paper with dashed scissors cut lines. Best for standard office or home printers.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-slate-800">3. Print 4" × 6" Card:</span>
                <span>Directly triggers the browser print dialog with native 4" × 6" page dimensions.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT: Live Printable 4" x 6" Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Format Badge */}
          <div className="w-full max-w-[360px] mb-3 flex items-center justify-between no-print">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Exact 4" × 6" Vertical Standee
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              101.6 × 152.4 mm
            </span>
          </div>

          {/* Guarantee banner */}
          <div className="w-full max-w-[360px] mb-2 p-2 bg-slate-900 text-white rounded-xl text-center text-[10.5px] font-semibold flex items-center justify-center gap-1.5 no-print">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>PDF download is 100% full-bleed 4" × 6" with zero outer margins!</span>
          </div>

          {/* PRINTABLE CONTAINER (Exact 4:6 Aspect Ratio) */}
          <div
            id="printable-standee"
            ref={standeeRef}
            className="w-full max-w-[340px] sm:max-w-[360px] aspect-[4/6] bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden transition-all duration-300 mx-auto flex flex-col justify-between"
          >
            {/* TEMPLATE 1: CMYK COMMERCIAL PRINT (Default Standard) */}
            {template === "cmyk" && (
              <div className="h-full w-full p-5 sm:p-6 text-center flex flex-col items-center justify-between bg-white text-slate-900">
                {/* Top Section */}
                <div className="w-full space-y-2">
                  {/* CMYK Registration Strip */}
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00AEEF]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#EC008C]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#FFF200]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#000000]"></span>
                  </div>

                  {/* Google 4-Color Bar */}
                  <div className="flex items-center justify-center gap-0.5 mx-auto w-24 h-1 rounded-full overflow-hidden">
                    <span className="flex-1 h-full bg-[#4285F4]"></span>
                    <span className="flex-1 h-full bg-[#EA4335]"></span>
                    <span className="flex-1 h-full bg-[#FBBC05]"></span>
                    <span className="flex-1 h-full bg-[#34A853]"></span>
                  </div>

                  <span className="text-[9.5px] font-extrabold tracking-widest text-slate-400 uppercase block">
                    Review Us On Google
                  </span>

                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                    {business?.name || "The Coffee House"}
                  </h3>

                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Center High-Contrast QR Code */}
                <div className="my-auto p-3 sm:p-3.5 bg-white rounded-2xl border-2 border-slate-900 shadow-md relative">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Review QR Code"
                      className="w-36 h-36 sm:w-40 sm:h-40 rounded-lg object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-36 h-36 sm:w-40 sm:h-40 bg-slate-100 flex items-center justify-center rounded-lg">
                      <QrIcon className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                </div>

                {/* Bottom Call To Action */}
                <div className="w-full space-y-1 mb-2">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">{headline}</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 max-w-[250px] mx-auto leading-relaxed">
                    {subheadline}
                  </p>
                  <p className="text-[9px] sm:text-[9.5px] font-extrabold text-slate-900 pt-1 tracking-wider uppercase">
                    ⚡ 30 Seconds • Instant AI Assistant
                  </p>
                </div>

                {/* WELURIK BOTTOM BRANDING FOOTER */}
                <div className="w-full pt-2.5 mt-auto border-t-2 border-slate-900 flex flex-col items-center gap-1">
                  <div className="w-full flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-md bg-slate-950 flex items-center justify-center text-[9px] font-black text-emerald-400">
                        W
                      </div>
                      <span className="font-black text-slate-900 tracking-tight uppercase text-[10px]">
                        Powered by Welurik
                      </span>
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-600 font-mono">
                      review.welurik.com
                    </span>
                  </div>
                  <div className="w-full flex items-center justify-between text-[8px] font-bold text-slate-400 tracking-wider uppercase">
                    <span>4" × 6" CMYK Standard</span>
                    <span>Verified Standee</span>
                  </div>
                </div>
              </div>
            )}

            {/* TEMPLATE 2: NORDIC MINIMAL */}
            {template === "minimal" && (
              <div className="h-full w-full p-5 sm:p-6 text-center flex flex-col items-center justify-between bg-white text-slate-900">
                <div className="w-full space-y-1.5">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">
                    Review Us On Google
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                    {business?.name || "The Coffee House"}
                  </h3>
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <div className="my-auto p-3 sm:p-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm relative">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Review QR Code"
                      className="w-36 h-36 sm:w-40 sm:h-40 rounded-xl object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-36 h-36 sm:w-40 sm:h-40 bg-slate-100 flex items-center justify-center rounded-xl">
                      <QrIcon className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                </div>

                <div className="w-full space-y-1 mb-2">
                  <h4 className="text-xs font-bold text-slate-900">{headline}</h4>
                  <p className="text-[10.5px] text-slate-500 max-w-[240px] mx-auto leading-relaxed">{subheadline}</p>
                  <p className="text-[9.5px] font-bold text-slate-900 pt-1 tracking-wide uppercase">
                    ⚡ 30 Seconds • Tap to Post
                  </p>
                </div>

                {/* Welurik Bottom Branding */}
                <div className="w-full pt-2.5 mt-auto border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
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

            {/* TEMPLATE 3: MIDNIGHT LUXE */}
            {template === "midnight" && (
              <div className="h-full w-full p-5 sm:p-6 text-center flex flex-col items-center justify-between bg-slate-950 text-white">
                <div className="w-full space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                    Rate Your Experience
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                    {business?.name || "The Coffee House"}
                  </h3>
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <div className="my-auto p-3 sm:p-4 bg-white rounded-3xl shadow-xl">
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="Review QR Code"
                      className="w-36 h-36 sm:w-40 sm:h-40 rounded-xl object-contain mx-auto"
                    />
                  )}
                </div>

                <div className="w-full space-y-1 mb-2">
                  <h4 className="text-xs font-bold text-amber-300">{headline}</h4>
                  <p className="text-[10.5px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">{subheadline}</p>
                </div>

                {/* Welurik Bottom Branding (Dark) */}
                <div className="w-full pt-2.5 mt-auto border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-medium">
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

            {/* TEMPLATE 4: TABLE TENT 4x6 */}
            {template === "tent" && (
              <div className="h-full w-full p-4 sm:p-5 text-center flex flex-col items-center justify-between bg-white border-2 border-slate-200">
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

// -------------------------------------------------------------
// Canvas Helper Functions for High-Resolution 300 DPI PDF
// -------------------------------------------------------------

function drawCanvasStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  color: string
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}
