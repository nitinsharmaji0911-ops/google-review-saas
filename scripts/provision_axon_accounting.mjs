import crypto from "crypto";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

const FIRESTORE_PROJECT_ID = "saas-64015";
const FIRESTORE_API_KEY = "AIzaSyB7nnrGVSUxVTmKw4t6qXrBVxAGbxarVvE";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents`;

function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof value === "string") {
      fields[key] = { stringValue: value };
    } else if (typeof value === "number") {
      fields[key] = Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    } else if (typeof value === "boolean") {
      fields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map((item) =>
            typeof item === "string" ? { stringValue: item } : { stringValue: JSON.stringify(item) }
          ),
        },
      };
    } else if (typeof value === "object") {
      fields[key] = { stringValue: JSON.stringify(value) };
    }
  }
  return fields;
}

async function setDocument(collection, docId, data) {
  const url = `${BASE_URL}/${collection}/${encodeURIComponent(docId)}?key=${FIRESTORE_API_KEY}`;
  const fields = toFirestoreFields(data);
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to save to ${collection}/${docId}: ${err}`);
  }
  return await res.json();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
  const email = "info@axonaccounting.com".toLowerCase().trim();
  const rawPassword = "AxonDubai@2026";
  const hashedPassword = hashPassword(rawPassword);
  const userId = "usr_" + Buffer.from(email).toString("hex");
  const slug = "axon-accounting";
  const businessName = "Axon Accounting";
  const legalName = "Axon Bookkeeping and Accounting (Oud Metha, Dubai)";
  const location = "Office 227, Oud Metha Offices, Dubai, UAE";
  const phone = "+971 55 673 0754";
  const googleReviewUrl = "https://g.page/r/CV21R_8DJx--EBM/review";
  const now = new Date();

  console.log(`\n========================================`);
  console.log(`Provisioning: ${businessName} (${slug})`);
  console.log(`Email: ${email}`);
  console.log(`========================================`);

  // 1. User Document
  const userDoc = {
    id: userId,
    email,
    password: hashedPassword,
    role: "user",
    planName: "VIP Pro Lifetime License",
    isPro: true,
    businessSlug: slug,
    businessId: slug,
    businessName,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    lastLoginProvider: "credentials",
    loginCount: 0,
  };
  await setDocument("users", userId, userDoc);
  console.log("✅ User created in Firestore:", userId);

  // 2. Business Document
  const businessDoc = {
    id: slug,
    userId,
    name: businessName,
    legalName,
    slug,
    category: "accounting",
    location,
    email,
    phone,
    googleReviewUrl,
    brandColor: "#0284c7",
    description: "Premier Dubai accounting, bookkeeping and corporate advisory firm specializing in UAE Corporate Tax, VAT return filing, audit, business setup, and corporate bank account opening.",
    services: [
      "Corporate Tax Registration & Filing",
      "VAT Accounting & Return Filing",
      "Monthly Bookkeeping & Reporting",
      "UAE Business Setup (Mainland & Free Zone)",
      "Corporate Bank Account Opening",
      "Internal Audit & Compliance Assurance",
      "Payroll Management & WPS Setup",
      "Financial Advisory & ESR Compliance"
    ],
    topics: [
      { name: "Accurate & Punctual Tax Filing", type: "positive" },
      { name: "Smooth & Fast Dubai Business Setup", type: "positive" },
      { name: "Stress-Free Bank Account Opening", type: "positive" },
      { name: "Knowledgeable & Responsive Advisors", type: "positive" },
      { name: "Transparent & Hassle-Free Compliance", type: "positive" },
      { name: "Clear Financial Reporting & Bookkeeping", type: "positive" },
      { name: "Highly Professional & Trustworthy Team", type: "positive" },
      { name: "Documentation Processing Wait Time", type: "issue" },
      { name: "Authority Approval Timelines", type: "issue" },
      { name: "Custom Scope & Advisory Discussion", type: "issue" }
    ],
    keywords: "Axon Accounting Dubai, Axon Bookkeeping, accounting firm Dubai, VAT filing Dubai, corporate tax UAE, company setup Dubai, business setup Dubai, open bank account UAE, Oud Metha accountants",
    planName: "VIP Pro Lifetime License",
    isPro: true,
    activatedAt: now.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  await setDocument("businesses", slug, businessDoc);
  console.log("✅ Business created in Firestore:", slug);

  // 3. Link user_businesses
  await setDocument("user_businesses", userId, {
    userId,
    businessSlug: slug,
    businessId: slug,
    name: businessName,
  });
  console.log("✅ User-Business link created");

  // 4. Generate QR Codes
  const funnelUrl = `https://review.welurik.com/r/${slug}`;
  const artifactDir = "C:/Users/Nitin Sharma/.gemini/antigravity/brain/53a06f14-de5f-4055-83e6-503359e97f82";
  const publicDir = "e:/anti/google review app/public";

  const qrFunnelArtifact = path.join(artifactDir, `${slug}-qr.png`);
  const qrFunnelPublic = path.join(publicDir, `${slug}-qr.png`);
  const qrDirectArtifact = path.join(artifactDir, `${slug}-google-direct-qr.png`);
  const qrDirectPublic = path.join(publicDir, `${slug}-google-direct-qr.png`);

  const qrOptions = {
    errorCorrectionLevel: "H",
    margin: 2,
    scale: 16,
    color: { dark: "#000000", light: "#ffffff" },
  };

  await QRCode.toFile(qrFunnelArtifact, funnelUrl, qrOptions);
  await QRCode.toFile(qrFunnelPublic, funnelUrl, qrOptions);
  console.log(`✅ Smart Funnel QR Code: ${qrFunnelArtifact}`);

  await QRCode.toFile(qrDirectArtifact, googleReviewUrl, qrOptions);
  await QRCode.toFile(qrDirectPublic, googleReviewUrl, qrOptions);
  console.log(`✅ Direct Google QR Code: ${qrDirectArtifact}`);

  console.log("\n========================================================");
  console.log("🎉 AXON ACCOUNTING DUBAI SUCCESSFULLY ONBOARDED!");
  console.log("Email:", email);
  console.log("Password:", rawPassword);
  console.log("Live Funnel URL:", funnelUrl);
  console.log("Direct Google Review:", googleReviewUrl);
  console.log("========================================================\n");
}

main().catch(console.error);
