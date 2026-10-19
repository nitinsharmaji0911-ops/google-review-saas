import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Mock business data for demo or fallback
export const DEMO_BUSINESS = {
  id: "welurik-media",
  userId: "demo-user-id",
  name: "welurik.media",
  slug: "welurik-media",
  category: "services",
  location: "Nagpur, Maharashtra",
  description: "Full-service digital growth & performance marketing agency in Nagpur specializing in Meta & Google Ads, high-converting website design, commercial video production, reels, WhatsApp automation, and B2B lead generation.",
  logoUrl: "",
  googleReviewUrl: "https://g.page/r/CQwNStINFiQ2EBM/review",
  brandColor: "#0ea5e9",
  phone: "+91 98765 43210",
  monthlyAiQuota: 500,
  aiCallsThisMonth: 12,
  services: [
    { id: "s1", name: "Website Design & Web Development", businessId: "welurik-media" },
    { id: "s2", name: "Performance Marketing & Meta/Google Ads", businessId: "welurik-media" },
    { id: "s3", name: "Commercial Video Production & Reels", businessId: "welurik-media" },
    { id: "s4", name: "B2B & Local Business Lead Generation", businessId: "welurik-media" },
    { id: "s5", name: "WhatsApp Lead Generation & Automation", businessId: "welurik-media" },
    { id: "s6", name: "Brand Identity & Creative Graphic Design", businessId: "welurik-media" },
    { id: "s7", name: "E-Commerce & Shopify Store Development", businessId: "welurik-media" },
    { id: "s8", name: "Landing Page Design for Lead Generation", businessId: "welurik-media" },
    { id: "s9", name: "Full-Service Digital & Content Marketing", businessId: "welurik-media" },
  ],
  topics: [
    { id: "t1", name: "Best Digital Marketing Agency in Nagpur", type: "positive", businessId: "welurik-media" },
    { id: "t2", name: "High ROI & Measurable Lead Growth", type: "positive", businessId: "welurik-media" },
    { id: "t3", name: "Stunning & Conversion-Focused Website Design", type: "positive", businessId: "welurik-media" },
    { id: "t4", name: "Top-Performing Meta & Google Ads Campaigns", type: "positive", businessId: "welurik-media" },
    { id: "t5", name: "Viral Reels & Commercial Video Production", type: "positive", businessId: "welurik-media" },
    { id: "t6", name: "WhatsApp Lead Generation & Automation", type: "positive", businessId: "welurik-media" },
    { id: "t7", name: "Creative Brand Identity & Visual Design", type: "positive", businessId: "welurik-media" },
    { id: "t8", name: "Tailored Marketing for Local & B2B Businesses", type: "positive", businessId: "welurik-media" },
    { id: "t9", name: "Campaign Scaling / Budget Planning", type: "issue", businessId: "welurik-media" },
    { id: "t10", name: "Custom Scope / Creative Revisions", type: "issue", businessId: "welurik-media" },
    { id: "t11", name: "Campaign Timeline Queries", type: "issue", businessId: "welurik-media" },
  ],
};
