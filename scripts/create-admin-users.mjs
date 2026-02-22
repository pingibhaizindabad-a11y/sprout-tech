#!/usr/bin/env node
/**
 * Create Firebase Auth users for every admin email (from Firestore config/admin or ADMIN_EMAILS env)
 * so they can sign in and use "Forgot password". Run from project root:
 *   node --env-file=.env.local scripts/create-admin-users.mjs
 */

let app;
const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (json) {
  try {
    const { initializeApp, cert } = await import("firebase-admin/app");
    app = initializeApp({ credential: cert(JSON.parse(json)) });
  } catch (e) {
    console.error("Invalid FIREBASE_SERVICE_ACCOUNT_JSON:", e.message);
    process.exit(1);
  }
} else {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    console.error("Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY in .env.local");
    process.exit(1);
  }
  const { initializeApp, cert } = await import("firebase-admin/app");
  app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const { getAuth } = await import("firebase-admin/auth");
const { getFirestore } = await import("firebase-admin/firestore");
const auth = getAuth(app);
const db = getFirestore(app);

let emailsToCreate = [];
const configSnap = await db.collection("config").doc("admin").get();
const fromDoc = configSnap.data()?.emails;
if (Array.isArray(fromDoc) && fromDoc.length > 0) {
  emailsToCreate = fromDoc.map((e) => String(e).trim().toLowerCase()).filter(Boolean);
}
if (emailsToCreate.length === 0) {
  emailsToCreate = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}
if (emailsToCreate.length === 0) {
  console.error("No admin emails found. Add emails in Admin panel → Admins tab, or set ADMIN_EMAILS in .env.local.");
  process.exit(1);
}

function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let s = "";
  for (let i = 0; i < 14; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

console.log("Creating Firebase Auth users for:", emailsToCreate.join(", "));
for (const email of emailsToCreate) {
  try {
    const password = randomPassword();
    await auth.createUser({ email, password, emailVerified: true });
    console.log(`  Created ${email} — temp password: ${password} (change via Forgot password in the app)`);
  } catch (e) {
    if (e.code === "auth/email-already-exists") {
      console.log(`  ${email} — already exists. Use "Forgot password" in the app to get a reset email.`);
    } else {
      console.error(`  ${email} — error:`, e.message);
    }
  }
}
console.log("Done. Add your site domain (e.g. localhost) in Firebase Console → Authentication → Settings → Authorized domains so reset links work.");
