"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { createAdminDoc, setAdminSession } from "../actions";

const AUTH_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "This email is already registered. Sign in instead.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/weak-password": "Password should be at least 8 characters.",
};

export default function AdminSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName) {
      setError("Enter your name.");
      return;
    }
    if (!trimmedEmail) {
      setError("Enter your email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const userCred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const idToken = await userCred.user.getIdToken();
      const createResult = await createAdminDoc(idToken, trimmedName, trimmedEmail);
      if (!createResult.ok) {
        setError(createResult.error ?? "Could not create admin record.");
        return;
      }
      const sessionResult = await setAdminSession(idToken);
      if (!sessionResult.ok) {
        setError(sessionResult.error ?? "Could not start session.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
      setError(AUTH_ERRORS[code] ?? (err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Sign-up failed."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-61px)] bg-[var(--bg)]">
      <main className="mx-auto max-w-[400px] px-6 py-[80px]">
        <h1 className="font-serif text-[32px] tracking-tight">Create admin account</h1>
        <p className="mt-2 text-[14px] text-[var(--muted)]">Sign up to create groups and run matching. You will only see your own groups and participants.</p>
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg border border-[#f5c6c3] bg-[#fdf1f0] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="w-full rounded-[10px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-3.5 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">Email</label>
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
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">Password (min 8 characters)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={8}
                className="w-full rounded-[10px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-3.5 py-3 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={8}
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
                  Creating…
                </span>
              ) : (
                "Create account →"
              )}
            </button>
          </form>
          <p className="mt-6 text-center text-[13px] text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/admin" className="text-[var(--accent)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
