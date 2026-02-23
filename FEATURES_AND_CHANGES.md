# Sprout — Features & What We’ve Done

## Git-ignored (sensitive)

These are in `.gitignore` so they are **never committed**:

- **`.env`**, **`.env.local`**, **`.env.*.local`** — all env files with secrets (Firebase API keys, service account, `ADMIN_*`)
- **`!.env.local.example`** — only the example template is committed (no real values)
- **Firebase service account JSON files** — e.g. `*firebase*adminsdk*.json`, `*service*account*.json` (use `FIREBASE_*` in `.env.local` instead)
- **`*.pem`** — private keys
- **`.next/`**, **`node_modules/`**, **`.vercel/`** — build/cache/deploy artifacts

---

## App features (product)

- **Landing (`/`)** — “Join a group” CTA → `/join`
- **Join (`/join`)** — Enter group code → cookie → redirect to `/auth`
- **Auth (`/auth`)** — Choose Admin vs Participant; sign up / sign in (Firebase Email/Password); forgot password; avatar upload (Firebase Storage)
- **Questionnaire (`/questionnaire`)** — 5 sections, 28 questions; submit → Firestore; then redirect to `/dashboard`
- **Dashboard (`/dashboard`)** — “Waiting for match” or match card with link to `/match/[id]`
- **Match (`/match/[id])** — Full match details (pair/trio)
- **Admin (`/admin`)** — Sign in with email (must be in `ADMIN_EMAILS`); create groups (custom or auto join code); view users & groups; **Trigger matching** (runs matching algo for a group)
- **API** — `POST /api/match` with `ADMIN_SECRET` (e.g. for cron) to trigger matching

Tech: Next.js (App Router), Firebase (Auth + Firestore + Storage), Tailwind; deploy target Vercel.

---

## What we did (recent work)

1. **Firebase env and .env.local**
   - Kept `.env.local` in correct **KEY=value** format (no JS/JSON).
   - Filled the 6 **NEXT_PUBLIC_FIREBASE_*** vars and **FIREBASE_PROJECT_ID** / **FIREBASE_CLIENT_EMAIL** / **FIREBASE_PRIVATE_KEY** (service account); left **ADMIN_*** for you to set.

2. **Dev behaviour when env is missing**
   - In **lib/firebase/config.ts**, `requireClientEnv()` in **development** only logs a warning (no crash); in **production** it still throws.

3. **“Firebase not configured” / env “changing”**
   - **Cause:** `NEXT_PUBLIC_*` are inlined into the client bundle at build time; old/cached builds could have empty env.
   - **Fix:** Layout (server) reads the 6 vars and (a) injects `window.__FIREBASE_ENV__` in the page and (b) passes `firebaseEnvFromServer` to **FirebaseEnvGuard**. Guard and **lib/firebase/config.ts** use that server-injected env on the client so the app no longer depends on build-time inlining for these vars.

4. **Dev server lock**
   - Killed extra `next dev` processes that held `.next/dev/lock` so you could run a single `npm run dev`.

5. **Restarts and cache**
   - Cleared `.next` and restarted dev server so env and client bundle were fresh.

6. **Issues log**
   - Documented the above in **issues_log.txt**.

7. **.gitignore**
   - Confirmed all sensitive env and key files are ignored; added a short “SENSITIVE” section in `.gitignore` for clarity.

---

## Optional next steps (your side)

- Set **ADMIN_EMAILS**, **ADMIN_PASSWORD**, **ADMIN_SECRET** in `.env.local` if you use the admin panel or the match API.
- For deploy: add the same env vars in Vercel and add your domain to Firebase Auth → Authorized domains (see **VERCEL_DEPLOYMENT.md**).
