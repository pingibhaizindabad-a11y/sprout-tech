"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { verifyAdminByFirebase } from "./actions";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  if (pathname === "/admin/signup") return <>{children}</>;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  async function onSubmitEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = (fd.get("email") as string)?.trim() ?? "";
    const password = (fd.get("password") as string) ?? "";
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();
      const result = await verifyAdminByFirebase(idToken);
      setLoading(false);
      if (!result.ok) {
        setError(result.error ?? "Access denied.");
        return;
      }
      router.refresh();
    } catch (err: unknown) {
      setLoading(false);
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Sign-in failed.";
      const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Invalid email or password.");
      } else if (code === "auth/configuration-not-found" || msg.includes("configuration-not-found")) {
        setError("Firebase Auth isn't set up. Enable Email/Password in Firebase Console → Authentication.");
      } else {
        setError(msg);
      }
    }
  }

  async function onForgotPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResetError(null);
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string)?.trim() ?? "";
    if (!email) {
      setResetError("Enter your admin email.");
      return;
    }
    try {
      const auth = getFirebaseAuth();
      const continueUrl = typeof window !== "undefined" ? `${window.location.origin}/admin` : undefined;
      await sendPasswordResetEmail(auth, email, continueUrl ? { url: continueUrl, handleCodeInApp: false } : undefined);
      setResetSent(true);
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
      if (code === "auth/user-not-found") setResetError("No account found with this email.");
      else if (code === "auth/invalid-email") setResetError("Please enter a valid email address.");
      else setResetError(err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Could not send reset email.");
    }
  }

  return (
    <div className="min-h-[calc(100vh-61px)] bg-[var(--bg)]">
      <main className="mx-auto max-w-[380px] px-6 py-[100px]">
        <h1 className="font-serif text-[32px] tracking-tight">Admin Access</h1>
        <div className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg border border-[#f5c6c3] bg-[#fdf1f0] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
              {error}
            </div>
          )}
          {showForgotPassword ? (
            resetSent ? (
              <div className="space-y-5">
                <div className="rounded-lg border border-[var(--accent)] bg-[var(--accent-light)] px-3.5 py-3 text-[14px] text-[var(--text)]">
                  If an account exists for this email, you&apos;ll receive a reset link. Check your spam folder.
                </div>
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(false); setResetSent(false); }}
                  className="w-full rounded-[10px] border-2 border-[var(--border)] bg-[var(--surface)] py-3.5 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]"
                >
                  ← Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={onForgotPasswordSubmit} className="space-y-5">
                <p className="text-[14px] text-[var(--muted)]">Enter your admin email and we&apos;ll send a reset link.</p>
                {resetError && (
                  <div className="rounded-lg border border-[#f5c6c3] bg-[#fdf1f0] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">{resetError}</div>
                )}
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">Email</label>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@example.com"
                    className="w-full rounded-[10px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-3.5 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:bg-white"
                    required
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="rounded-[10px] bg-[var(--accent)] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]">Send reset link</button>
                  <button type="button" onClick={() => { setShowForgotPassword(false); setResetError(null); }} className="rounded-[10px] border-2 border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]">← Back to sign in</button>
                </div>
              </form>
            )
          ) : (
            <form onSubmit={onSubmitEmail} className="space-y-5">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">Email</label>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className="w-full rounded-[10px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-3.5 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:bg-white"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">Password</label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-[10px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-3.5 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:bg-white"
                  required
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--muted)]">
                  <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="rounded border-[var(--border)]" />
                  Show password
                </label>
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-[13px] text-[var(--accent)] hover:underline">Forgot password?</button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[10px] bg-[var(--accent)] py-3.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </span>
                ) : (
                  "Enter Panel →"
                )}
              </button>
            </form>
          )}
          <p className="mt-6 text-center text-[13px] text-[var(--muted)]">
            New here?{" "}
            <Link href="/admin/signup" className="text-[var(--accent)] hover:underline">
              Create an admin account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
