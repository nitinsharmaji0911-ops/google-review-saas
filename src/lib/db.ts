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
  id: "demo-the-coffee-house",
  userId: "demo-user-id",
  name: "The Coffee House",
  slug: "the-coffee-house",
  category: "cafe",
  location: "Downtown Plaza, Main St",
  description: "Artisan coffee roasters and organic sourdough bakery.",
  logoUrl: "",
  googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
  brandColor: "#4f46e5",
  phone: "+91 98765 43210",
  monthlyAiQuota: 500,
  aiCallsThisMonth: 38,
  services: [
    { id: "s1", name: "Specialty Coffee", businessId: "demo" },
    { id: "s2", name: "Artisan Bakery", businessId: "demo" },
    { id: "s3", name: "All-Day Breakfast", businessId: "demo" },
    { id: "s4", name: "Cold Brew", businessId: "demo" },
    { id: "s5", name: "Sandwiches", businessId: "demo" }
  ],
  topics: [
    { id: "t1", name: "Coffee Quality", type: "positive", businessId: "demo" },
    { id: "t2", name: "Fresh Bakery Items", type: "positive", businessId: "demo" },
    { id: "t3", name: "Friendly Baristas", type: "positive", businessId: "demo" },
    { id: "t4", name: "Cozy Ambience", type: "positive", businessId: "demo" },
    { id: "t5", name: "Fast Wi-Fi & Work Friendly", type: "positive", businessId: "demo" },
    { id: "t6", name: "Cleanliness", type: "positive", businessId: "demo" },
    { id: "t7", name: "Quick Service", type: "positive", businessId: "demo" },
    { id: "t8", name: "Waiting Time", type: "issue", businessId: "demo" },
    { id: "t9", name: "Coffee Taste", type: "issue", businessId: "demo" }
  ]
};
