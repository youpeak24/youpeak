"use strict";
const firestoreDb = require("./functions/backend/util/firestoreDb.service");

async function updateSettings() {
  try {
    const db = firestoreDb.getDb();
    if (!db) {
      console.log("No DB connection");
      return;
    }
    const r2Data = {
      storage: {
        local: false,
        awsS3: false,
        digitalOcean: false,
        cloudflareR2: true,
      },
      r2AccountId: "9786595ca4817b10c795d62912615e",
      r2AccessKeyId: "cdb9bcad2d6459c3d9c99533d11934b",
      r2SecretAccessKey: "b5413dc98dc5cf032ac30d53f7d8389ff4a84c47211b77c334025554a0fcca30",
      r2BucketName: "youpeak-videos",
      r2Endpoint: "https://9786595ca4817b10c795d62912615e.r2.cloudflarestorage.com",
      r2PublicDomain: "https://pub-9786595ca4817b10c795d62912615e.r2.dev",
      r2CdnUrl: "https://pub-9786595ca4817b10c795d62912615e.r2.dev",
      updatedAt: new Date().toISOString(),
    };

    const snapshot = await db.collection("settings").get();
    if (!snapshot.empty) {
      snapshot.forEach(async (doc) => {
        await db.collection("settings").doc(doc.id).set(r2Data, { merge: true });
        console.log("Updated settings doc:", doc.id);
      });
    } else {
      await db.collection("settings").doc("default_settings").set(r2Data, { merge: true });
      console.log("Created default_settings document");
    }
    console.log("✅ Cloudflare R2 Credentials updated in Firestore successfully!");
  } catch (err) {
    console.error("Error updating settings:", err);
  }
}

updateSettings();
