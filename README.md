# sprout-tech

**Sprout** — group-based matching: join a private group by code, complete a questionnaire, get matched with teammates (pairs/trios). Next.js (App Router), **Firebase** (Auth + Firestore), Tailwind; deploy target Vercel.

## Setup

1. **Firebase**  
   - Use your project: [sprout-tech](https://console.firebase.google.com/project/sprout-tech/overview).  
   - **Authentication**: Enable **Email/Password** (Build → Authentication → Sign-in method).  
   - **Firestore**: Create a database (Build → Firestore Database). Start in production mode; the app uses the Admin SDK so client rules can deny all (see `firestore.rules`).  
   - **Project settings**: Copy the client config (Project settings → General → Your apps).  
   - **Service account**: Project settings → Service accounts → Generate new private key. You’ll use this as `FIREBASE_SERVICE_ACCOUNT_JSON`.

2. **Env**  
   `.env.local` is gitignored (never commit it). Copy `.env.local.example` to `.env.local` if needed, then set:
   - `NEXT_PUBLIC_FIREBASE_*` — from Project settings → General → Your apps (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).  
   - `FIREBASE_SERVICE_ACCOUNT_JSON` — full JSON from the service account key file (paste as one line, or minified).  
   - `ADMIN_EMAILS` — comma-separated admin emails; only these can sign in at `/admin` (Firebase Email/Password).  
   - `ADMIN_SECRET` — long random string; required for the matching API and admin “Trigger matching”.

3. **Run**  
   `npm run dev` → [http://localhost:3000](http://localhost:3000)

4. **Deploy (Vercel)**  
   See `VERCEL_DEPLOYMENT.md`. Set the same env vars in Vercel → Settings → Environment Variables and add your Vercel domain to Firebase Auth → Authorized domains.

## Routes

- `/` — Landing; "Join a group"
- `/join` — Enter group code → cookie → `/auth`
- `/auth` — Sign up / Sign in (Firebase Auth)
- `/questionnaire` — 5 sections, 28 questions; submit → `/dashboard`
- `/dashboard` — Waiting or match card + link to `/match/[id]`
- `/match/[id]` — Full match details
- `/admin` — Email sign-in (only emails in `ADMIN_EMAILS`); create groups (custom or auto code), view users, **Trigger matching**

## Firestore

Collections are created by the app: `groups`, `users`, `questionnaire_responses`, `matches`. If you see index errors in the console, use the link in the error to create the required composite index in Firebase Console.
