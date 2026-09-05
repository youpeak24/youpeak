// YouPeak Functions Backend — Local Standalone Server
// Flutter App API (Port 5001)
// Run from: functions/ directory with: node backend/server.js

//dns resolution fix for Node 18+
const dns = require("dns");

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const path = require("path");
const fs = require("fs");

//dotenv — load from functions/backend/.env
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Set env fallbacks
process.env.secretKey = process.env.secretKey || "0LF8bPi5BnOgl3JjLGcfhfU3N7TAk8rJ";
process.env.JWT_SECRET = process.env.JWT_SECRET || "5BF2AE1515EA6";

const express = require("express");
const cors = require("cors");
const http = require("http");

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, key, Key, secretkey, secretKey");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(cors({ origin: true, credentials: true }));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Morgan logging
try {
  const logger = require("morgan");
  app.use(logger("dev"));
} catch (e) {}

// Firebase Admin (Firestore)
const admin = require("firebase-admin");
if (admin.apps.length === 0) {
  try {
    // Check for serviceAccountKey.json in the source root (2 levels up from functions/backend/)
    const serviceAccountPaths = [
      path.join(__dirname, "..", "..", "serviceAccountKey.json"),  // source/
      path.join(__dirname, "..", "serviceAccountKey.json"),        // functions/
      path.join(__dirname, "serviceAccountKey.json"),              // functions/backend/
    ];

    let initialized = false;
    for (const keyPath of serviceAccountPaths) {
      if (fs.existsSync(keyPath)) {
        const serviceAccount = require(keyPath);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        console.log("🔑 Firebase initialized with serviceAccountKey.json:", keyPath);
        initialized = true;
        break;
      }
    }

    if (!initialized) {
      admin.initializeApp();
      console.log("🔥 Firebase initialized with Application Default Credentials");
    }
  } catch (e) {
    console.log("⚠️  Firebase init note:", e.message);
  }
}

// Global settings initialization
try {
  const settingJson = require("./setting");
  global.settingJSON = settingJson;
  global.updateSettingFile = (settingData) => {
    try {
      const settingJSON = JSON.stringify(settingData, null, 2);
      fs.writeFileSync(path.join(__dirname, "setting.js"), `module.exports = ${settingJSON};`, "utf8");
    } catch (e) {}
    global.settingJSON = settingData;
  };
} catch (e) {
  global.settingJSON = {};
  global.updateSettingFile = () => {};
}

// Initialize Firestore seed data
try {
  const firestoreDb = require("./util/firestoreDb.service");
  firestoreDb.seedDefaultData().catch((err) => console.error("Seed error:", err));
} catch (e) {
  console.log("Firestore seed note:", e.message);
}

// Health ping
app.get("/ping", (req, res) => {
  res.json({ status: true, message: "YouPeak Flutter API is Live!", timestamp: new Date().toISOString() });
});

app.get("/health", (req, res) => {
  res.json({ status: true, message: "YouPeak Flutter Backend Running!", timestamp: new Date().toISOString() });
});

app.get("/api/ping", (req, res) => {
  res.json({ status: true, message: "YouPeak Flutter API /api is Live!", timestamp: new Date().toISOString() });
});

// Socket.IO for live features
const server = http.createServer(app);
global.io = require("socket.io")(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Import backend routes (routes/ is relative to functions/backend/)
try {
  const routes = require("./routes/index");
  app.use("/", routes);
  app.use("/api", routes);
  console.log("✅ Routes loaded successfully");
} catch (err) {
  console.error("Error loading routes:", err.message);
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`\n🚀 ====================================`);
  console.log(`📱 YouPeak Flutter API Backend Running!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📱 Android Emulator: http://10.0.2.2:${PORT}`);
  console.log(`💡 Health: http://localhost:${PORT}/health`);
  console.log(`====================================\n`);
});

module.exports = app;
