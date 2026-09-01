import { FirestoreREST } from "./firestore-rest";
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

/**
 * Firestore Database Service
 * Uses Firestore REST API with automatic Cloud persistence
 */
export const FirestoreDB = {
  // --- USERS ---
  async getUserByEmail(email: string) {
    const normalized = email.toLowerCase().trim();

    // 1. Try Firestore REST
    const docs = await FirestoreREST.queryDocuments("users", "email", normalized);
    if (docs && docs.length > 0) {
      return docs[0];
    }

    // 2. Try Firestore Admin
    const { firestore } = getFirebaseAdmin();
    if (firestore) {
      try {
        const snap = await firestore.collection("users").where("email", "==", normalized).limit(1).get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          return { id: doc.id, ...doc.data() } as any;
        }
      } catch {}
    }

    return inMemoryStore.users.get(normalized) || null;
  },

  async createUser(data: { email: string; password?: string }) {
    const normalized = data.email.toLowerCase().trim();
    const id = "usr_" + Math.random().toString(36).substring(2, 9);
    const userDoc = {
      id,
      email: normalized,
      password: data.password || "",
      createdAt: new Date().toISOString(),
    };

    // 1. Save via Firestore REST
    await FirestoreREST.setDocument("users", id, userDoc);

    // 2. Save via Firestore Admin if active
    const { firestore } = getFirebaseAdmin();
    if (firestore) {
      try {
        await firestore.collection("users").doc(id).set(userDoc);
      } catch {}
    }

    inMemoryStore.users.set(normalized, userDoc);
    return userDoc;
  },

  // --- BUSINESSES ---
  async getBusinessByUserId(userId: string) {
    if (!userId) return null;

    // 1. Try Firestore REST
    const docs = await FirestoreREST.queryDocuments("businesses", "userId", userId);
    if (docs && docs.length > 0) {
      return docs[0];
    }

    // 2. Try Firestore Admin
    const { firestore } = getFirebaseAdmin();
    if (firestore) {
      try {
        const snap = await firestore.collection("businesses").where("userId", "==", userId).limit(1).get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          return { id: doc.id, ...doc.data() } as any;
        }
      } catch {}
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

    // 2. Try Firestore Admin
    const { firestore } = getFirebaseAdmin();
    if (firestore) {
      try {
        const docSnap = await firestore.collection("businesses").doc(slug).get();
        if (docSnap.exists) {
          return { id: docSnap.id, ...docSnap.data() } as any;
        }
      } catch {}
    }

    return inMemoryStore.businesses.get(slug) || null;
  },

  async saveBusiness(data: any) {
    const slug = data.slug;
    const docId = slug || `biz_${Date.now()}`;
    const businessDoc = {
      ...data,
      id: docId,
      updatedAt: new Date().toISOString(),
    };

    // 1. Save via Firestore REST
    await FirestoreREST.setDocument("businesses", docId, businessDoc);

    // 2. Save via Firestore Admin
    const { firestore } = getFirebaseAdmin();
    if (firestore) {
      try {
        await firestore.collection("businesses").doc(docId).set(businessDoc, { merge: true });
      } catch {}
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
    await FirestoreREST.setDocument("feedback", id, { status });
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
};
