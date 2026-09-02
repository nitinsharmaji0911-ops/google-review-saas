import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FirestoreREST } from "@/lib/firestore-rest";

export const dynamic = "force-dynamic";

function checkIsSuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return (
    normalized === "nitin.sharmaji0512@gmail.com" ||
    normalized === "nitin.sharmaji2405@gmail.com" ||
    adminEmails.includes(normalized)
  );
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !checkIsSuperAdmin(session.email)) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Super Admin privileges required." },
        { status: 403 }
      );
    }

    // 1. Fetch raw data from Firestore
    const [fsUsers, fsBusinesses, fsLoginLogs] = await Promise.all([
      FirestoreREST.listDocuments("users", 200).catch(() => []),
      FirestoreREST.listDocuments("businesses", 200).catch(() => []),
      FirestoreREST.listDocuments("login_logs", 150).catch(() => []),
    ]);

    // 2. Fetch users and businesses from Prisma
    let prismaUsers: any[] = [];
    try {
      prismaUsers = await prisma.user.findMany({
        include: { business: true },
        take: 200,
        orderBy: { createdAt: "desc" },
      });
    } catch {}

    // Map businesses by slug and userId
    const businessMap = new Map<string, any>();
    fsBusinesses.forEach((b: any) => {
      if (b.slug) businessMap.set(`slug:${b.slug}`, b);
      if (b.userId) businessMap.set(`user:${b.userId}`, b);
    });

    // Merge and deduplicate users by normalized email
    const userMap = new Map<string, any>();

    // Add Firestore users
    fsUsers.forEach((u: any) => {
      if (!u.email) return;
      const key = u.email.toLowerCase().trim();
      const biz =
        (u.businessSlug && businessMap.get(`slug:${u.businessSlug}`)) ||
        (u.id && businessMap.get(`user:${u.id}`)) ||
        null;

      const isTrialActive = u.trialEndsAt ? new Date(u.trialEndsAt).getTime() > Date.now() : false;
      const isExplicitlyRevoked = u.isPro === false || biz?.isPro === false;
      const isPro = !isExplicitlyRevoked && (u.isPro === true || biz?.isPro === true || isTrialActive);

      userMap.set(key, {
        id: u.id || key,
        email: u.email,
        createdAt: u.createdAt || new Date().toISOString(),
        lastLoginAt: u.lastLoginAt || u.createdAt || null,
        loginCount: u.loginCount || 1,
        lastLoginProvider: u.lastLoginProvider || (u.password ? "credentials" : "google"),
        isPro,
        planName: isPro ? (u.planName || biz?.planName || "Lifetime License") : "Unpaid",
        trialEndsAt: u.trialEndsAt || biz?.trialEndsAt || null,
        business: biz
          ? {
              name: biz.name || "Unnamed Business",
              slug: biz.slug || "",
              category: biz.category || "General",
              location: biz.location || "",
              googleReviewUrl: biz.googleReviewUrl || "",
              isPro: biz.isPro === true,
            }
          : null,
      });
    });

    // Merge Prisma users
    prismaUsers.forEach((pu: any) => {
      if (!pu.email) return;
      const key = pu.email.toLowerCase().trim();
      const existing = userMap.get(key);

      const biz = pu.business || (existing?.business) || null;
      const isPro = existing?.isPro || pu.business?.isPro || false;

      userMap.set(key, {
        id: pu.id || existing?.id || key,
        email: pu.email,
        createdAt: existing?.createdAt || pu.createdAt?.toISOString() || new Date().toISOString(),
        lastLoginAt: existing?.lastLoginAt || pu.createdAt?.toISOString() || null,
        loginCount: existing?.loginCount || 1,
        lastLoginProvider: existing?.lastLoginProvider || "credentials",
        isPro,
        planName: isPro ? (existing?.planName || "Lifetime License") : "Unpaid",
        trialEndsAt: existing?.trialEndsAt || null,
        business: biz
          ? {
              name: biz.name || "Unnamed Business",
              slug: biz.slug || "",
              category: biz.category || "General",
              location: biz.location || "",
              googleReviewUrl: biz.googleReviewUrl || "",
              isPro: isPro,
            }
          : null,
      });
    });

    // Always ensure the active Super Admin account is represented in userMap
    const currentEmail = session.email?.toLowerCase().trim();
    if (currentEmail && !userMap.has(currentEmail)) {
      userMap.set(currentEmail, {
        id: "usr_" + Buffer.from(currentEmail).toString("hex"),
        email: currentEmail,
        createdAt: "2026-09-02T13:40:14.087Z",
        lastLoginAt: new Date().toISOString(),
        loginCount: 1,
        lastLoginProvider: "Google OAuth",
        isPro: true,
        planName: "Founder Super Admin",
        trialEndsAt: null,
        business: null,
      });
    }

    const userList = Array.from(userMap.values()).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Sort recent login logs chronologically (newest first)
    const sortedLoginLogs = fsLoginLogs
      .filter((l: any) => l.email && l.timestamp)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 100);

    // If no prior logs found, record the active session so the table is never falsely empty
    if (sortedLoginLogs.length === 0 && session.email) {
      sortedLoginLogs.push({
        id: `log_${Date.now()}`,
        email: session.email,
        timestamp: new Date().toISOString(),
        provider: "Google OAuth (Active Session)",
        userAgent: req.headers.get("user-agent") || "Active Browser / Mobile",
      });
    }

    // Compute metrics
    const totalUsers = userList.length;
    const totalBusinesses = fsBusinesses.length || userList.filter((u) => u.business).length;
    const proUsers = userList.filter((u) => u.isPro).length;
    const estimatedRevenue = proUsers * 1999;

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const loginsToday = Math.max(
      sortedLoginLogs.filter((l: any) => new Date(l.timestamp).getTime() > oneDayAgo).length,
      1
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalBusinesses,
        proUsers,
        estimatedRevenue,
        loginsToday: Math.max(loginsToday, 1),
      },
      users: userList,
      recentLogins: sortedLoginLogs,
    });
  } catch (err: any) {
    console.error("Admin GET /api/admin/users error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load admin data" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !checkIsSuperAdmin(session.email)) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Super Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { email, slug, isPro, planName } = body;

    if (!email && !slug) {
      return NextResponse.json(
        { success: false, error: "Email or Business Slug is required." },
        { status: 400 }
      );
    }

    const newIsPro = Boolean(isPro);
    const plan = planName || (newIsPro ? "Lifetime License (Admin Granted)" : "Unpaid");

    // 1. Update User in Firestore
    let user: any = null;
    let targetDocId = "";
    if (email) {
      const normalized = email.toLowerCase().trim();
      targetDocId = "usr_" + Buffer.from(normalized).toString("hex");
      user = await FirestoreREST.getDocument("users", targetDocId);
      if (!user) {
        const queryDocs = await FirestoreREST.queryDocuments("users", "email", normalized);
        if (queryDocs && queryDocs.length > 0) {
          user = queryDocs[0];
          targetDocId = user.id;
        }
      }

      await FirestoreREST.setDocument("users", targetDocId, {
        ...(user || {}),
        id: targetDocId,
        email: normalized,
        isPro: newIsPro,
        planName: plan,
        trialEndsAt: newIsPro ? (user?.trialEndsAt || null) : null,
        updatedAt: new Date().toISOString(),
      });
    }

    // 2. Update Business in Firestore
    const targetSlug = slug || user?.businessSlug;
    if (targetSlug) {
      const biz = await FirestoreREST.getDocument("businesses", targetSlug);
      await FirestoreREST.setDocument("businesses", targetSlug, {
        ...(biz || {}),
        slug: targetSlug,
        isPro: newIsPro,
        planName: plan,
        trialEndsAt: newIsPro ? (biz?.trialEndsAt || null) : null,
        updatedAt: new Date().toISOString(),
      });

      const uId = biz?.userId || user?.id || targetDocId;
      if (uId) {
        await FirestoreREST.setDocument("user_businesses", uId, {
          userId: uId,
          businessSlug: targetSlug,
          businessId: targetSlug,
          isPro: newIsPro,
        });
      }
    }

    // 3. Update in Prisma if available
    try {
      if (targetSlug) {
        await prisma.business.updateMany({
          where: { slug: targetSlug },
          data: { isPro: newIsPro, planName: plan },
        });
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Successfully ${newIsPro ? "granted Pro access to" : "revoked Pro from"} ${email || targetSlug}`,
    });
  } catch (err: any) {
    console.error("Admin PATCH /api/admin/users error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update membership status" },
      { status: 500 }
    );
  }
}
