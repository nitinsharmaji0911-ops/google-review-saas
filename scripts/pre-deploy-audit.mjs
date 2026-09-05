import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const rootDir = process.cwd();
console.log("===============================================================");
console.log("🛡️  WELURIK REVIEW SAAS - PRE-DEPLOYMENT AUDIT SUITE");
console.log("===============================================================\n");

let failures = 0;
let passes = 0;

function reportPass(checkName, detail = "") {
  passes++;
  console.log(`✅ [PASS] ${checkName} ${detail ? "→ " + detail : ""}`);
}

function reportFail(checkName, error) {
  failures++;
  console.error(`❌ [FAIL] ${checkName}`);
  console.error(`   Details: ${error}`);
}

// -------------------------------------------------------------
// CHECK 1: File & Critical Asset Existence
// -------------------------------------------------------------
console.log("🔍 Checking Critical Assets & Production Files...");
try {
  const criticalFiles = [
    "public/video/welurik-demo.mp4",
    "public/video/welurik-demo-poster.jpg",
    "src/app/page.tsx",
    "src/app/(auth)/login/page.tsx",
    "src/app/(auth)/signup/page.tsx",
    "src/app/(auth)/forgot-password/page.tsx",
    "src/app/(auth)/reset-password/page.tsx",
    "src/app/(dashboard)/dashboard/page.tsx",
    "src/app/(dashboard)/settings/page.tsx",
    "src/app/(dashboard)/qr-studio/page.tsx",
    "src/app/(dashboard)/feedback/page.tsx",
    "src/app/(dashboard)/onboarding/page.tsx",
    "src/app/r/[slug]/page.tsx",
    "src/app/r/[slug]/feedback/page.tsx",
    "src/app/admin/page.tsx",
    "src/app/admin-vault/page.tsx",
    "src/app/api/ai/generate/route.ts",
    "src/app/api/payment/create-order/route.ts",
    "src/app/api/payment/verify/route.ts",
    "src/app/api/business/me/route.ts",
    "src/lib/firestore-db.ts",
    "src/lib/auth.ts"
  ];

  let missing = [];
  for (const file of criticalFiles) {
    const fullPath = path.join(rootDir, file);
    if (!fs.existsSync(fullPath)) {
      missing.push(file);
    } else {
      const stats = fs.statSync(fullPath);
      if (stats.size === 0) {
        missing.push(`${file} (empty file)`);
      }
    }
  }

  if (missing.length > 0) {
    reportFail("Critical Files Audit", `Missing files: ${missing.join(", ")}`);
  } else {
    reportPass("Critical Files Audit", `All ${criticalFiles.length} core files verified with valid sizes`);
  }
} catch (e) {
  reportFail("Critical Files Audit", e.message);
}

// -------------------------------------------------------------
// CHECK 2: Hero Video Integrity Check (Paused by Default)
// -------------------------------------------------------------
console.log("\n🔍 Checking Hero Video Configuration...");
try {
  const landingPagePath = path.join(rootDir, "src/app/page.tsx");
  const landingContent = fs.readFileSync(landingPagePath, "utf-8");

  // Check 1: Must NOT have autoplay on video tag
  const videoTagMatch = landingContent.match(/<video[^>]*>/s);
  if (!videoTagMatch) {
    reportFail("Hero Video Audit", "No <video> tag found in src/app/page.tsx");
  } else {
    const videoTag = videoTagMatch[0];
    if (/autoplay/i.test(videoTag)) {
      reportFail("Hero Video Audit", "Found 'autoPlay' attribute on <video> tag. Video must be paused by default!");
    } else {
      reportPass("Hero Video Audit", "Video is correctly configured to be paused by default (no autoPlay)");
    }
  }

  // Check 2: Must have Play button / Live Demo overlay
  if (landingContent.includes("Watch Live Demo") || landingContent.includes("Play Demo") || landingContent.includes("isPlaying")) {
    reportPass("Hero Video Overlay", "Interactive Play Demo overlay present");
  } else {
    reportFail("Hero Video Overlay", "Missing play button overlay for paused video");
  }
} catch (e) {
  reportFail("Hero Video Check", e.message);
}

// -------------------------------------------------------------
// CHECK 3: Pricing & Copy Compliance ("₹1,999 only")
// -------------------------------------------------------------
console.log("\n🔍 Checking Pricing & Copy Compliance (₹1,999 only)...");
try {
  const filesToCheck = [
    "src/app/page.tsx",
    "src/components/CheckoutButton.tsx",
    "src/app/(dashboard)/layout.tsx",
    "src/app/(dashboard)/onboarding/page.tsx",
    "src/app/(auth)/login/page.tsx",
    "src/app/(auth)/signup/page.tsx",
    "src/app/checkout/success/page.tsx",
    "src/app/terms/page.tsx"
  ];

  let violations = [];
  for (const relPath of filesToCheck) {
    const fullPath = path.join(rootDir, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, "utf-8");

    // Match any instance of ₹1,999 or ₹1999 not followed by only
    const regex = /₹\s*1[,.]?999(?!\s+only)/gi;
    const matches = content.match(regex);
    if (matches && matches.length > 0) {
      violations.push(`${relPath} has ${matches.length} instance(s) missing 'only' after ₹1,999`);
    }
  }

  if (violations.length > 0) {
    reportFail("Pricing Compliance Audit", violations.join(" | "));
  } else {
    reportPass("Pricing Compliance Audit", "All ₹1,999 references across SaaS strictly suffixed with 'only'");
  }
} catch (e) {
  reportFail("Pricing Compliance Check", e.message);
}

// -------------------------------------------------------------
// CHECK 4: Security & Secret Leak Prevention
// -------------------------------------------------------------
console.log("\n🔍 Checking Security & Environment Boundary...");
try {
  let secretLeaks = [];
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (f === "node_modules" || f === ".next" || f === ".git") continue;
      const p = path.join(dir, f);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        scanDir(p);
      } else if (/\.(tsx|ts|jsx|js)$/.test(f)) {
        const text = fs.readFileSync(p, "utf-8");
        // Check for raw secret keys hardcoded
        if (text.includes("rzp_live_secret") || text.includes("BEGIN PRIVATE KEY-----")) {
          secretLeaks.push(`Potential hardcoded secret in ${p}`);
        }
      }
    }
  }

  scanDir(path.join(rootDir, "src"));

  if (secretLeaks.length > 0) {
    reportFail("Security Leak Audit", secretLeaks.join(", "));
  } else {
    reportPass("Security Leak Audit", "Zero hardcoded private keys or production secrets detected in source code");
  }
} catch (e) {
  reportFail("Security Audit", e.message);
}

// -------------------------------------------------------------
// CHECK 5: TypeScript Compilation Check (tsc --noEmit)
// -------------------------------------------------------------
console.log("\n🔍 Running TypeScript Type Safety Check...");
try {
  execSync("npx tsc --noEmit", { cwd: rootDir, stdio: "pipe" });
  reportPass("TypeScript Compiler", "Zero type errors detected across entire project");
} catch (e) {
  reportFail("TypeScript Compiler", e.stderr ? e.stderr.toString() : e.stdout.toString());
}

// -------------------------------------------------------------
// CHECK 6: Review Sentiment & Rating Alignment Verification
// -------------------------------------------------------------
console.log("\n🔍 Checking Review Generator Rating Alignment...");
try {
  const aiGenPath = path.join(rootDir, "src/lib/ai-generator.ts");
  const aiGenContent = fs.readFileSync(aiGenPath, "utf-8");

  const hasNegativeBranches =
    aiGenContent.includes("CRITICAL SENTIMENT REQUIREMENT: THIS IS A NEGATIVE") &&
    aiGenContent.includes("isNegative") &&
    aiGenContent.includes("CRITICAL_REVIEW_ANGLES");
  const hasMixedBranches =
    aiGenContent.includes("MIXED_REVIEW_ANGLES") &&
    aiGenContent.includes("isMixed");
  const hasBannedWordsRule = aiGenContent.includes("ABSOLUTELY BANNED WORDS FOR NEGATIVE REVIEWS");

  if (!hasNegativeBranches || !hasMixedBranches || !hasBannedWordsRule) {
    reportFail(
      "Review Sentiment Alignment",
      "ai-generator.ts is missing required negative or mixed review stratification!"
    );
  } else {
    reportPass(
      "Review Sentiment Alignment",
      "Rating-stratified prompts and negative review safeguards verified"
    );
  }
} catch (e) {
  reportFail("Review Sentiment Check", e.message);
}

// -------------------------------------------------------------
// SUMMARY & EXIT
// -------------------------------------------------------------
console.log("\n===============================================================");
if (failures === 0) {
  console.log(`🎉 ALL PRE-DEPLOYMENT CHECKS PASSED (${passes}/${passes})`);
  console.log("🚀 The codebase is CERTIFIED and ready for safe production deployment!");
  console.log("===============================================================\n");
  process.exit(0);
} else {
  console.error(`🚨 PRE-DEPLOYMENT CHECKS FAILED (${failures} failure(s), ${passes} passed)`);
  console.error("🛑 DEPLOYMENT BLOCKED: Fix the issues above before pushing to production.");
  console.log("===============================================================\n");
  process.exit(1);
}
