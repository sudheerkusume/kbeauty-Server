const admin = require("firebase-admin");
const path = require("path");

console.log("🛠️ Attempting Firebase Initialization...");

try {
    if (admin.apps.length === 0) {
        let serviceAccount;

        // 1. Check for Environment Variables (Production/Render)
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            console.log("Using Firebase environment variables");
            
            // Log key length and start/end (SAFE debugging)
            const rawKey = process.env.FIREBASE_PRIVATE_KEY;
            console.log(`Raw Key length: ${rawKey.length}`);
            console.log(`Raw Key starts with: ${rawKey.substring(0, 30)}...`);
            console.log(`Raw Key ends with: ...${rawKey.substring(rawKey.length - 30)}`);

            // Clean the private key: handle quotes, true newlines, and escaped newlines
            let cleanedKey = rawKey
                .replace(/"/g, '') // Remove double quotes
                .trim();
            
            // If it doesn't contain true newlines, but contains \n, replace them
            if (!cleanedKey.includes('\n') && cleanedKey.includes('\\n')) {
                cleanedKey = cleanedKey.replace(/\\n/g, '\n');
            }

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