import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App | undefined;
let firestore: Firestore | null = null;

export function getFirebaseAdmin(): { firestore: Firestore | null } {
  if (firestore) {
    return { firestore };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    try {
      if (getApps().length === 0) {
        app = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } else {
        app = getApps()[0];
      }
      firestore = getFirestore(app);
      return { firestore };
    } catch (err) {
      console.warn("Failed to initialize Firebase Admin SDK:", err);
    }
  }

  return { firestore: null };
}

export { firestore };
