"use client";

import { isFirebaseConfigured, getMissingClientEnvVars } from "@/lib/firebase/config";

const MISSING_MSG =
  "Add these to .env.local in the project root with values from Firebase Console → Project settings → General → Your apps (Web app). Then restart the dev server (stop with Ctrl+C, run npm run dev again).";

export function FirebaseEnvGuard({ children }: { children: React.ReactNode }) {
  if (!isFirebaseConfigured()) {
    const missing = getMissingClientEnvVars();
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
