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
   Locally: copy `.env.local.example` to `.env.local`. **Production:** set the same variables in your host (e.g. Vercel). Never commit or document real emails, passwords, or keys. Set:
   - `NEXT_PUBLIC_FIREBASE_*` — from Project settings → General → Your apps (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).  
   - `FIREBASE_SERVICE_ACCOUNT_JSON` — full JSON from the service account key file (paste as one line, or minified).  
   - `ADMIN_SECRET` — long random string for `POST /api/match` (cron/external). Admin sign-in is self-serve at `/admin/signup`.

3. **Run**  
   `npm run dev` → [http://localhost:3000](http://localhost:3000)

4. **Deploy (Vercel)**  
   See `VERCEL_DEPLOYMENT.md`. Set all env vars in Vercel. Add your Vercel domain to Firebase Auth → Authorized domains. First admin creates an account at `/admin/signup`.

## Routes

- `/` — Landing; "Join a group"
- `/join` — Enter group code → cookie → `/auth`
- `/auth` — Sign up / Sign in (Firebase Auth)
- `/questionnaire` — 5 sections, 28 questions; submit → `/dashboard`
- `/dashboard` — Waiting or match card + link to `/match/[id]`
- `/match/[id]` — Full match details
- `/admin` — Firebase sign-in (must have an admin account from `/admin/signup`); create groups, view users, **Trigger matching**
- `/admin/signup` — Create a new admin account (self-serve)

## Firestore

Collections are created by the app: `groups`, `users`, `questionnaire_responses`, `matches`. If you see index errors in the console, use the link in the error to create the required composite index in Firebase Console.
