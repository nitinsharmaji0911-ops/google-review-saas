import { FirestoreREST } from "./firestore-rest";
export { FirestoreREST };
import { getFirebaseAdmin } from "./firebase";
import { DEMO_BUSINESS } from "./db";

// In-Memory Fallback Cache for local offline tests
const inMemoryStore = {
  users: new Map<string, any>(),
  businesses: new Map<string, any>(),
  reviews: [] as any[],
  feedback: [] as any[],
  analytics: [] as any[],
};

inMemoryStore.businesses.set("the-coffee-house", {
  ...DEMO_BUSINESS,
  id: "the-coffee-house-id",
  userId: "demo-user-id",
  createdAt: new Date().toISOString(),
});

function emailToDocId(email: string) {
  return "usr_" + Buffer.from(email.toLowerCase().trim()).toString("hex").substring(0, 60);
}

/**
 * Firestore Database Service
 * Uses Firestore REST API with automatic Cloud persistence
 */
export const FirestoreDB = {
  // --- USERS ---
  async getUserByEmail(email: string) {
    const normalized = email.toLowerCase().trim();
    const docId = emailToDocId(normalized);

    // 1. Instant direct document lookup (O(1) in ~100ms)
    const directDoc = await FirestoreREST.getDocument("users", docId);
    if (directDoc) {
      return directDoc;
    }

    // 2. Fallback query
    const docs = await FirestoreREST.queryDocuments("users", "email", normalized);
    if (docs && docs.length > 0) {
      return docs[0];
    }

    return inMemoryStore.users.get(normalized) || null;
  },

  async createUser(data: { email: string; password?: string }) {
    const normalized = data.email.toLowerCase().trim();
    const id = emailToDocId(normalized);
    const userDoc = {
      id,
      email: normalized,
      password: data.password || "",
      createdAt: new Date().toISOString(),
    };

    // Fast direct set in ~150ms
    await FirestoreREST.setDocument("users", id, userDoc);

    inMemoryStore.users.set(normalized, userDoc);
    return userDoc;
  },

  // --- BUSINESSES ---
  async getBusinessByUserId(userId: string) {
    if (!userId) return null;

    // 1. Direct O(1) document lookup by userId in user_businesses collection
    const userBiz = await FirestoreREST.getDocument("user_businesses", userId);
    if (userBiz?.businessSlug) {
      const biz = await this.getBusinessBySlug(userBiz.businessSlug);
      if (biz) return biz;
    }

    // 2. Direct lookup if business document is keyed by userId
    const directDoc = await FirestoreREST.getDocument("businesses", userId);
    if (directDoc) return directDoc;

    // 3. Fallback query
    const docs = await FirestoreREST.queryDocuments("businesses", "userId", userId);
    if (docs && docs.length > 0) {
      return docs[0];
    }

    for (const b of Array.from(inMemoryStore.businesses.values())) {
      if (b.userId === userId) return b;
    }
    return null;
  },

  async getBusinessBySlug(slug: string) {
    if (!slug) return null;

    // 1. Try direct Firestore REST get
    const doc = await FirestoreREST.getDocument("businesses", slug);
    if (doc) return doc;

    // Query by slug
    const docs = await FirestoreREST.queryDocuments("businesses", "slug", slug);
    if (docs && docs.length > 0) {
      return docs[0];
    }

    return inMemoryStore.businesses.get(slug) || null;
  },

  async saveBusiness(data: any) {
    const slug = data.slug;
    const docId = slug || `biz_${Date.now()}`;
    let existing: any = null;
    try {
      if (slug) {
        existing = await this.getBusinessBySlug(slug);
      }
    } catch {}

    const businessDoc = {
      ...(existing || {}),
      ...data,
      id: docId,
      slug: slug || docId,
      updatedAt: new Date().toISOString(),
    };

    // 1. Save directly under businesses/{slug}
    await FirestoreREST.setDocument("businesses", docId, businessDoc);

    // 2. ALSO save under user_businesses/{userId} for instant O(1) lookups
    if (data.userId) {
      await FirestoreREST.setDocument("user_businesses", data.userId, {
        userId: data.userId,
        businessSlug: slug || docId,
        businessId: docId,
        name: data.name,
      });
    }

    inMemoryStore.businesses.set(slug, businessDoc);
    return businessDoc;
  },

  // --- FEEDBACKS ---
  async createFeedback(data: any) {
    const id = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const feedbackDoc = {
      ...data,
      id,
      status: "unread",
      createdAt: new Date().toISOString(),
    };

    await FirestoreREST.setDocument("feedback", id, feedbackDoc);

    const { firestore } = getFirebaseAdmin();
    if (firestore) {
      try {
        await firestore.collection("feedback").doc(id).set(feedbackDoc);
      } catch {}
    }

    inMemoryStore.feedback.unshift(feedbackDoc);
    return feedbackDoc;
  },

  async getFeedbacksBySlug(slug: string) {
    if (!slug) return [];

    // 1. Try Firestore REST
    const docs = await FirestoreREST.queryDocuments("feedback", "businessSlug", slug);
    if (docs && docs.length > 0) {
      return docs;
    }

    // 2. Try Firestore Admin
    const { firestore } = getFirebaseAdmin();
    if (firestore) {
      try {
        const snap = await firestore
          .collection("feedback")
          .where("businessSlug", "==", slug)
          .orderBy("createdAt", "desc")
          .limit(50)
          .get();
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
      } catch {}
    }

    return inMemoryStore.feedback.filter((f) => f.businessSlug === slug);
  },

  async updateFeedbackStatus(id: string, status: string) {
    if (!id || !status) return false;
    // Use Admin SDK update (PATCH) — never setDocument which replaces the entire document
    const { firestore } = getFirebaseAdmin();
    if (firestore) {
      try {
        await firestore.collection("feedback").doc(id).update({ status });
      } catch {}
    }
    const local = inMemoryStore.feedback.find((f) => f.id === id);
    if (local) local.status = status;
    return true;
  },

  // --- REVIEWS ---
  async createReview(data: any) {
    return this.createReviewSession(data);
  },

  async createReviewSession(data: any) {
    const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const reviewDoc = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };

    await FirestoreREST.setDocument("reviews", id, reviewDoc);

    const { firestore } = getFirebaseAdmin();
    if (firestore) {
      try {
        await firestore.collection("reviews").doc(id).set(reviewDoc);
      } catch {}
    }

    inMemoryStore.reviews.unshift(reviewDoc);
    return reviewDoc;
  },

  // --- ANALYTICS ---
  async trackEvent(businessSlug: string, eventType: string, metadata?: any) {
    const id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const eventDoc = {
      businessSlug,
      eventType,
      ...(metadata || {}),
      createdAt: new Date().toISOString(),
    };

    await FirestoreREST.setDocument("analytics", id, eventDoc);
    inMemoryStore.analytics.push(eventDoc);
  },

  async getReviewsBySlug(slug: string) {
    if (!slug) return [];
    try {
      const docs = await FirestoreREST.queryDocuments("reviews", "businessSlug", slug);
      if (docs && docs.length > 0) return docs;
    } catch {}

    const { firestore } = getFirebaseAdmin();
    if (firestore) {
      try {
        const snap = await firestore
          .collection("reviews")
          .where("businessSlug", "==", slug)
          .orderBy("createdAt", "desc")
          .limit(20)
          .get();
        if (!snap.empty) return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch {}
    }

    return inMemoryStore.reviews.filter((r) => r.businessSlug === slug);
  },

  async getAnalyticsBySlug(slug: string) {
    if (!slug) return [];
    try {
      const docs = await FirestoreREST.queryDocuments("analytics", "businessSlug", slug);
      if (docs && docs.length > 0) return docs;
    } catch {}

    const { firestore } = getFirebaseAdmin();
    if (firestore) {
      try {
        const snap = await firestore
          .collection("analytics")
          .where("businessSlug", "==", slug)
          .limit(200)
          .get();
        if (!snap.empty) return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch {}
    }

    return inMemoryStore.analytics.filter((a) => a.businessSlug === slug);
  },
};
