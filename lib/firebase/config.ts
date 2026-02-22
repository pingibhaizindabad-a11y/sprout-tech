const REQUIRED_CLIENT_VARS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

/** Client-side Firebase config — use only in browser. */
export const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Throws with clear message listing missing env vars. Call when Firebase client is first used. */
export function requireClientEnv(): void {
  const missing = REQUIRED_CLIENT_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Firebase client missing env: ${missing.join(", ")}. ` +
        "Copy .env.local.example to .env.local and fill in the NEXT_PUBLIC_* values from Firebase Console → Project settings → General → Your apps (Web app). Restart the dev server after changing .env.local."
    );
  }
}

export function isFirebaseConfigured(): boolean {
  return REQUIRED_CLIENT_VARS.every((key) => !!process.env[key]);
}

/** Returns which NEXT_PUBLIC_* vars are missing (for showing on setup page). */
export function getMissingClientEnvVars(): string[] {
  return REQUIRED_CLIENT_VARS.filter((key) => !process.env[key]);
}
