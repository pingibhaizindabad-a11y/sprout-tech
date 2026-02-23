"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

const AUTH_ERRORS: Record<string, string> = {
  "auth/user-not-found": "No account found with this email. Sign up first, then use forgot password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/unauthorized-domain":
    "This app's domain is not allowed by Firebase. In Firebase Console go to Authentication → Settings → Authorized domains and add this site's domain (e.g. localhost or 127.0.0.1 for dev).",
  "auth/unauthorized-continue-uri":
    "The reset link's return URL is not allowed. In Firebase Console go to Authentication → Settings → Authorized domains and add this site's domain (e.g. localhost and 127.0.0.1 for dev), then try again.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
  "auth/operation-not-allowed":
    "Password reset is disabled in Firebase. In Firebase Console go to Authentication → Sign-in method and enable Email/Password.",
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const continueUrl = typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined;
      await sendPasswordResetEmail(auth, trimmed, continueUrl ? { url: continueUrl, handleCodeInApp: false } : undefined);
      setSent(true);
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
      const message = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "";
      const friendly = AUTH_ERRORS[code];
      if (friendly) {
        setError(friendly);
      } else if (message) {
        setError(message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      if (process.env.NODE_ENV === "development" && err) {
        console.error("Forgot password error:", err);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-61px)] animate-fadeUp">
      <main className="mx-auto max-w-[400px] px-6 py-20">
        <div className="mb-5 inline-block rounded-full bg-[var(--accent-light)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
          Reset password
        </div>
        <h1 className="font-serif text-[34px] tracking-tight" style={{ fontFamily: "var(--font-serif), serif" }}>
          Forgot password?
        </h1>
        <p className="mt-1.5 text-[14px] text-[var(--muted)]">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
          {sent ? (
            <p className="text-[14px] text-[var(--text)]">
              Reset link was sent to <strong>{email}</strong>. Check your inbox and spam folder.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-[#f5c6c3] bg-[#fdf1f0] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
                  {error}
                </div>
              )}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-[10px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-3.5 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:bg-white"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[10px] bg-[var(--accent)] py-3.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending…
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          )}
          <Link href="/auth" className="mt-6 inline-block text-[13px] text-[var(--accent)] hover:underline">
            ← Back to login
          </Link>
        </div>
      </main>
    </div>
  );
}
