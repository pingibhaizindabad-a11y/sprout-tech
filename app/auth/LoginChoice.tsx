"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { loginAdminWithPassword, verifyAdminEmailAuth } from "@/app/admin/actions";
import { AuthForm } from "./AuthForm";

type Role = "admin" | "student" | null;

export function LoginChoice() {
  const router = useRouter();
  const [role, setRole] = useState<Role>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  async function onAdminEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdminError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = (fd.get("email") as string)?.trim() ?? "";
    const password = (fd.get("password") as string) ?? "";
    if (!email || !password) {
      setAdminError("Enter your email and password.");
      return;
    }
    setAdminLoading(true);
    try {
      const passwordResult = await loginAdminWithPassword(email, password);
      if (passwordResult.ok) {
        setAdminLoading(false);
        router.push("/admin");
        router.refresh();
        return;
      }
      if (passwordResult.error && passwordResult.error !== "Invalid password.") {
        setAdminError(passwordResult.error);
        setAdminLoading(false);
        return;
      }
      const auth = getFirebaseAuth();
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();
      const result = await verifyAdminEmailAuth(idToken);
      setAdminLoading(false);
      if (!result.ok) setAdminError(result.error ?? "Access denied.");
      else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: unknown) {
      setAdminLoading(false);
      const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setAdminError("Invalid email or password.");
      } else {
        setAdminError(err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Sign-in failed.");
      }
    }
  }

  async function onAdminForgotPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      const continueUrl = typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined;
      await sendPasswordResetEmail(auth, email, continueUrl ? { url: continueUrl, handleCodeInApp: false } : undefined);
      setResetSent(true);
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
      if (code === "auth/user-not-found") {
        setResetError("No account found with this email.");
      } else if (code === "auth/invalid-email") {
        setResetError("Please enter a valid email address.");
      } else {
        setResetError(err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Could not send reset email.");
      }
    }
  }

  if (role === null) {
    return (
      <div className="mt-8 space-y-4">
        <p className="text-[14px] text-[var(--muted)]">Choose how you&apos;re logging in:</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setRole("admin")}
            className="rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-6 text-left transition hover:border-[var(--accent)] hover:bg-[var(--accent-light)]"
          >
            <span className="text-2xl">👤</span>
            <h3 className="mt-3 font-semibold text-[var(--text)]">Admin / Organizer</h3>
            <p className="mt-1 text-[13px] text-[var(--muted)]">Manage groups, run matching, view results</p>
          </button>
          <button
            type="button"
            onClick={() => setRole("student")}
            className="rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-6 text-left transition hover:border-[var(--accent)] hover:bg-[var(--accent-light)]"
          >
            <span className="text-2xl">🎓</span>
            <h3 className="mt-3 font-semibold text-[var(--text)]">Participant / Student</h3>
            <p className="mt-1 text-[13px] text-[var(--muted)]">Join a group, fill questionnaire, see your match</p>
          </button>
        </div>
      </div>
    );
  }

  if (role === "admin") {
    return (
      <div className="mt-8">
        <button
          type="button"
          onClick={() => setRole(null)}
          className="mb-4 text-[13px] text-[var(--muted)] hover:text-[var(--text)]"
        >
          ← Back to choice
        </button>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
          <h2 className="font-serif text-[22px] tracking-tight">Admin login</h2>
          {adminError && (
            <div className="mt-4 rounded-lg border border-[#f5c6c3] bg-[#fdf1f0] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
              {adminError}
            </div>
          )}
          {showForgotPassword ? (
            resetSent ? (
              <div className="mt-6 space-y-5">
                <div className="rounded-lg border border-[var(--accent)] bg-[var(--accent-light)] px-3.5 py-3 text-[14px] text-[var(--text)]">
                  If an account exists for this email, you&apos;ll receive a reset link. Check your spam folder. The email must be registered in Firebase (Authentication → Users) and your site domain must be in Authentication → Settings → Authorized domains.
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
              <form onSubmit={onAdminForgotPasswordSubmit} className="mt-6 space-y-5">
                <p className="text-[14px] text-[var(--muted)]">
                  Enter your admin email and we&apos;ll send you a link to reset your password.
                </p>
                {resetError && (
                  <div className="rounded-lg border border-[#f5c6c3] bg-[#fdf1f0] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
                    {resetError}
                  </div>
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
                  <button type="submit" className="rounded-[10px] bg-[var(--accent)] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]">
                    Send reset link
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setResetError(null); }}
                    className="rounded-[10px] border-2 border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 text-sm font-medium text-[var(--text)] transition hover:border-[var(--accent)]"
                  >
                    ← Back to sign in
                  </button>
                </div>
              </form>
            )
          ) : (
            <form onSubmit={onAdminEmailSubmit} className="mt-6 space-y-5">
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
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[13px] text-[var(--accent)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={adminLoading}
                className="w-full rounded-[10px] bg-[var(--accent)] py-3.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
              >
                {adminLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </span>
                ) : (
                  "Enter Admin Panel →"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => setRole(null)}
        className="mb-4 text-[13px] text-[var(--muted)] hover:text-[var(--text)]"
      >
        ← Back to choice
      </button>
      <AuthForm />
    </div>
  );
}
