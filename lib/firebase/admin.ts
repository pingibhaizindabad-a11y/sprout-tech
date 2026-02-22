import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import type { ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminConnected = false;

/** Initialize Admin SDK from SERVICE_ACCOUNT_JSON or PROJECT_ID + CLIENT_EMAIL + PRIVATE_KEY (Vercel-friendly). */
export function getAdminApp(): App | null {
  if (getApps().length > 0) return getApps()[0] as App;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      const credential = cert(JSON.parse(json) as unknown as ServiceAccount);
      const app = initializeApp({ credential });
      if (!adminConnected) {
        console.log("Firebase connected (Admin)");
        adminConnected = true;
      }
      return app;
    } catch (e) {
      console.error("Firebase Admin init failed (invalid FIREBASE_SERVICE_ACCOUNT_JSON):", e);
      return null;
    }
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    console.error("Firebase Admin missing env: set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env.local (or FIREBASE_SERVICE_ACCOUNT_JSON).");
    return null;
  }
  try {
    const app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
    if (!adminConnected) {
      console.log("Firebase connected (Admin)");
      adminConnected = true;
    }
    return app;
  } catch (e) {
    console.error("Firebase Admin init failed:", e);
    return null;
  }
}

export function getAdminAuth() {
  const app = getAdminApp();
  if (!app) throw new Error("Firebase Admin not configured.");
  return getAuth(app);
}

/** Returns Auth instance or null when not configured (avoids 500 in server actions). */
export function getAdminAuthIfConfigured() {
  const app = getAdminApp();
  if (!app) return null;
  return getAuth(app);
}

export function getAdminFirestore(): Firestore {
  const app = getAdminApp();
  if (!app) throw new Error("Firebase Admin not configured.");
  return getFirestore(app);
}

/** Returns Firestore instance or null when service account not set (avoids 500 on admin/join). */
export function getAdminFirestoreIfConfigured(): Firestore | null {
  const app = getAdminApp();
  if (!app) return null;
  return getFirestore(app);
}

export function isFirebaseAdminConfigured(): boolean {
  return !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON && getAdminApp() !== null;
}

/** Verify ID token from cookie and return uid, or null. */
export async function getUidFromToken(idToken: string | undefined): Promise<string | null> {
  if (!idToken) return null;
  const app = getAdminApp();
  if (!app) return null;
  try {
    const decoded = await getAuth(app).verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}
