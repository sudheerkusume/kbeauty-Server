const admin = require("firebase-admin");
const path = require("path");

console.log("🛠️ Attempting Firebase Initialization...");

try {
    if (admin.apps.length === 0) {
        let serviceAccount;

        // 1. Check for Environment Variables (Production/Render)
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            console.log("Using Firebase environment variables");
            
            // Clean the private key: remove quotes, handle escaped newlines, and trim
            const cleanedKey = process.env.FIREBASE_PRIVATE_KEY
                .replace(/"/g, '')
                .replace(/\\n/g, '\n')
                .trim();

            serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: cleanedKey,
            };
        }
        // 2. Fallback to JSON file (Local Dev)
        else {
            const serviceAccountPath = path.join(__dirname, "firebaseServiceAccount.json");
            serviceAccount = require(serviceAccountPath);
            console.log("✅ Firebase Admin: SUCCESS (using JSON file)");
        }

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("✅ Firebase Admin: INITIALIZED");
        }
    }
} catch (error) {
    console.error("❌ Firebase Admin: FAILED. Server will still run but OTP will fail.");
    console.error("Reason:", error.message);
}

module.exports = admin;