const REQUIRED_CLIENT_VARS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

function getEnv(): Record<string, string | undefined> {
  if (typeof window !== "undefined" && (window as unknown as { __FIREBASE_ENV__?: Record<string, string> }).__FIREBASE_ENV__) {
    return (window as unknown as { __FIREBASE_ENV__: Record<string, string> }).__FIREBASE_ENV__;
  }
  return process.env as Record<string, string | undefined>;
}

/** Client-side Firebase config — use only in browser. Uses server-injected env when available so dev doesn't depend on build-time inlining. */
export const firebaseClientConfig = {
  get apiKey() {
    return getEnv().NEXT_PUBLIC_FIREBASE_API_KEY;
  },
  get authDomain() {
    return getEnv().NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  },
  get projectId() {
    return getEnv().NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  },
  get storageBucket() {
    return getEnv().NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  },
  get messagingSenderId() {
    return getEnv().NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  },
  get appId() {
    return getEnv().NEXT_PUBLIC_FIREBASE_APP_ID;
  },
};

/** In development logs a warning for missing env; in production throws. Call when Firebase client is first used. */
export function requireClientEnv(): void {
  const env = getEnv();
  const missing = REQUIRED_CLIENT_VARS.filter((key) => !env[key]);
  if (missing.length > 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`Firebase env missing: ${missing.join(", ")}. Add them to .env.local and restart the dev server.`);
    } else {
      throw new Error(
        `Firebase client missing env: ${missing.join(", ")}. ` +
          "Copy .env.local.example to .env.local and fill in the NEXT_PUBLIC_* values from Firebase Console → Project settings → General → Your apps (Web app). Restart the dev server after changing .env.local."
      );
    }
  }
}

export function isFirebaseConfigured(): boolean {
  return REQUIRED_CLIENT_VARS.every((key) => !!getEnv()[key]);
}

/** Returns which NEXT_PUBLIC_* vars are missing (for showing on setup page). */
export function getMissingClientEnvVars(): string[] {
  return REQUIRED_CLIENT_VARS.filter((key) => !getEnv()[key]);
}
