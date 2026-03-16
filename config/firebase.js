const admin = require("firebase-admin");
const path = require("path");

console.log("🛠️ Attempting Firebase Initialization...");

try {
    if (admin.apps.length === 0) {
        // Use ABSOLUTE path to avoid confusion on Windows
        const serviceAccountPath = path.join(__dirname, "firebaseServiceAccount.json");
        const serviceAccount = require(serviceAccountPath);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("✅ Firebase Admin: SUCCESS (using JSON file)");
    }
} catch (error) {
    console.error("❌ Firebase Admin: FAILED. Server will still run but OTP will fail.");
    console.error("Reason:", error.message);
    // We don't re-throw here so the main server (app.js) can still start and serve products/brands
}

module.exports = admin;