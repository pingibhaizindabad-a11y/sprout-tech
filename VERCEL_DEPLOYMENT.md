# Vercel Deployment Checklist

1. **Environment variables**  
   In Vercel → Project → Settings → Environment Variables, add **all** vars from `.env.local.example` for **Production** (and Preview if you want):
   - **NEXT_PUBLIC_FIREBASE_*** (6 vars) — from Firebase Console → Project settings → General → Your apps (Web).
   - **FIREBASE_SERVICE_ACCOUNT_JSON** — paste the full service account JSON as one line (single-quoted in Vercel if needed).  
     Or use **FIREBASE_PROJECT_ID**, **FIREBASE_CLIENT_EMAIL**, **FIREBASE_PRIVATE_KEY** (Vercel-friendly): for `FIREBASE_PRIVATE_KEY`, paste the key with literal `\n` for newlines.
   - **ADMIN_EMAILS** — comma-separated admin emails (e.g. `you@example.com`).
   - **ADMIN_SECRET** — long random string; required for `/api/match` (trigger matching from admin panel or cron). Generate with `openssl rand -hex 32`.

2. **Firebase Auth authorized domains**  
   Firebase Console → Authentication → Settings → Authorized domains → Add:
   - `your-app.vercel.app` (and any preview domains if needed)
   - Your production domain (e.g. `sprout.yourdomain.com`)

3. **Firestore**  
   Create the database if needed. Deploy rules from `firestore.rules` (Firebase Console → Firestore → Rules). Create composite indexes when prompted (see `FIRESTORE_INDEXES.md`).

4. **Storage**  
   Enable Firebase Storage. Deploy rules from `storage.rules`.  
   Optional CORS for Storage (if you need cross-origin uploads):
   ```json
   [{"origin":["*"],"method":["GET","POST","PUT"],"maxAgeSeconds":3600}]
   ```
   Run: `gsutil cors set cors.json gs://YOUR_BUCKET_NAME`

5. **Build**  
   Run locally: `npm run build` — must pass with zero errors before deploying.

6. **Deploy**  
   `vercel --prod` (or connect the repo in Vercel for automatic deploys). After deploy, confirm env vars are set and add the Vercel URL to Firebase authorized domains if you didn’t already.
