"use client";

import { useState, useEffect } from "react";

const REQUIRED_CLIENT_VARS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

const MISSING_MSG =
  "Add these to .env.local in the project root with values from Firebase Console → Project settings → General → Your apps (Web app). Then restart the dev server (stop with Ctrl+C, run npm run dev again).";

function isConfigured(env: Record<string, string>): boolean {
  return REQUIRED_CLIENT_VARS.every((key) => !!env[key]);
}

function getMissing(env: Record<string, string>): string[] {
  return REQUIRED_CLIENT_VARS.filter((key) => !env[key]);
}

export function FirebaseEnvGuard({
  children,
  firebaseEnvFromServer,
}: {
  children: React.ReactNode;
  firebaseEnvFromServer: Record<string, string>;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  const env = firebaseEnvFromServer;
  if (!isConfigured(env)) {
    const missing = getMissing(env);
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)] text-[var(--text)]">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-semibold">Firebase not configured</h1>
          <p className="text-sm opacity-90">{MISSING_MSG}</p>
          <div className="text-left rounded-lg bg-[var(--surface)] border border-[var(--border)] px-4 py-3 text-[13px] font-mono">
            <p className="text-[var(--muted)] mb-2">Missing or empty in .env.local:</p>
            <ul className="list-disc list-inside space-y-1">
              {missing.map((key) => (
                <li key={key}>{key}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
