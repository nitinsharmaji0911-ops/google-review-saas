import { getFirebaseAdmin } from "./firebase";
import { DEMO_BUSINESS } from "./db";

// In-Memory Fallback Cache when Firebase Admin credentials are not yet configured in .env
const inMemoryStore = {
  users: new Map<string, any>(),
  businesses: new Map<string, any>(),
  reviews: [] as any[],
  feedback: [] as any[],
  analytics: [] as any[],
};

// Seed demo data into in-memory store
inMemoryStore.businesses.set("the-coffee-house", {
  ...DEMO_BUSINESS,
  id: "the-coffee-house-id",
  userId: "demo-user-id",
  createdAt: new Date().toISOString(),
});

/**
 * Firestore Database Service
 * Provides robust Firestore operations with automatic offline fallback
 */
export const FirestoreDB = {
  // --- USERS ---
  async getUserByEmail(email: string) {
    const { firestore } = getFirebaseAdmin();
    const normalized = email.toLowerCase().trim();

    if (firestore) {
      try {
        const snap = await firestore.collection("users").where("email", "==", normalized).limit(1).get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          return { id: doc.id, ...doc.data() } as any;
        }
        return null;
      } catch (err) {
        console.warn("Firestore getUserByEmail error, using local fallback:", err);
      }
    }

    return inMemoryStore.users.get(normalized) || null;
  },

  async createUser(data: { email: string; password: string }) {
    const { firestore } = getFirebaseAdmin();
    const normalized = data.email.toLowerCase().trim();
    const id = "usr_" + Math.random().toString(36).substring(2, 9);
    const userDoc = {
      id,
      email: normalized,
      password: data.password,
      createdAt: new Date().toISOString(),
    };

    if (firestore) {
      try {
        await firestore.collection("users").doc(id).set(userDoc);
        return userDoc;
      } catch (err) {
        console.warn("Firestore createUser error, using local fallback:", err);
      }
    }

    inMemoryStore.users.set(normalized, userDoc);
    return userDoc;
  },

  // --- BUSINESSES ---
  async getBusinessBySlug(slug: string) {
    const { firestore } = getFirebaseAdmin();

    if (firestore) {
      try {
        const snap = await firestore.collection("businesses").where("slug", "==", slug).limit(1).get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          return { id: doc.id, ...doc.data() } as any;
        }
      } catch (err) {
        console.warn("Firestore getBusinessBySlug error, using fallback:", err);
      }
    }

    if (inMemoryStore.businesses.has(slug)) {
      return inMemoryStore.businesses.get(slug);
    }

    if (slug === "the-coffee-house" || slug === "demo") {
      return DEMO_BUSINESS;
    }

    return null;
  },

  async saveBusiness(business: any) {
    const { firestore } = getFirebaseAdmin();
    const slug = business.slug;
    const id = business.id || "biz_" + Math.random().toString(36).substring(2, 9);
    const data = {
      ...business,
      id,
      updatedAt: new Date().toISOString(),
    };

    if (firestore) {
      try {
        await firestore.collection("businesses").doc(id).set(data, { merge: true });
      } catch (err) {
        console.warn("Firestore saveBusiness error, using local fallback:", err);
      }
    }

    inMemoryStore.businesses.set(slug, data);
    return data;
  },

  // --- REVIEWS ---
  async createReview(review: any) {
    const { firestore } = getFirebaseAdmin();
    const id = "rev_" + Math.random().toString(36).substring(2, 9);
    const data = {
      id,
      ...review,
      createdAt: new Date().toISOString(),
    };

    if (firestore) {
      try {
        await firestore.collection("reviews").doc(id).set(data);
      } catch (err) {
        console.warn("Firestore createReview error:", err);
      }
    }

    inMemoryStore.reviews.unshift(data);
    return data;
  },

  async getRecentReviews(businessSlug: string, limitCount = 10) {
    const { firestore } = getFirebaseAdmin();

    if (firestore) {
      try {
        const snap = await firestore
          .collection("reviews")
          .where("businessSlug", "==", businessSlug)
          .orderBy("createdAt", "desc")
          .limit(limitCount)
          .get();

        if (!snap.empty) {
          return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {
        console.warn("Firestore getRecentReviews error:", err);
      }
    }

    return inMemoryStore.reviews.slice(0, limitCount);
  },

  // --- FEEDBACK ---
  async createFeedback(feedback: any) {
    const { firestore } = getFirebaseAdmin();
    const id = "fb_" + Math.random().toString(36).substring(2, 9);
    const data = {
      id,
      ...feedback,
      status: "unread",
      createdAt: new Date().toISOString(),
    };

    if (firestore) {
      try {
        await firestore.collection("feedback").doc(id).set(data);
      } catch (err) {
        console.warn("Firestore createFeedback error:", err);
      }
    }

    inMemoryStore.feedback.unshift(data);
    return data;
  },

  // --- ANALYTICS ---
  async trackEvent(businessSlug: string, eventType: string, metadata: any = {}) {
    const { firestore } = getFirebaseAdmin();
    const data = {
      businessSlug,
      eventType,
      metadata,
      timestamp: new Date().toISOString(),
    };

    if (firestore) {
      try {
        await firestore.collection("analytics").add(data);
      } catch (err) {
        console.warn("Firestore trackEvent error:", err);
      }
    }

    inMemoryStore.analytics.push(data);
  },
};
