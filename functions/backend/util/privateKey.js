const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  try {
    admin.initializeApp();
    console.log("🔥 Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.log("Firebase Admin SDK init note:", error.message);
  }
}

module.exports = admin;
