//dns resolution fix for Node 18+ & Firebase Cloud Functions
const dns = require("node:dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || "youpeak-9ff65";
process.env.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "youpeak-9ff65";

//express
const express = require("express");
const app = express();

//cors
const cors = require("cors");

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

//logging middleware
var logger = require("morgan");
app.use(logger("dev"));

//path
const path = require("path");

//dotenv
require("dotenv").config({ path: ".env" });

//node-cron
const cron = require("node-cron");

//moment
const moment = require("moment");

//connection.js (100% Firebase Firestore)
const db = require("./util/connection");

//fs
const fs = require("fs");

//socket io
const http = require("http");
const server = http.createServer(app);
global.io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//settingJson
const settingJson = require("./setting");

//Declare global variable
global.settingJSON = settingJson;

//Declare the function as a global variable to update the setting.js file
global.updateSettingFile = (settingData) => {
  try {
    const settingJSON = JSON.stringify(settingData, null, 2);
    fs.writeFileSync("setting.js", `module.exports = ${settingJSON};`, "utf8");
  } catch (e) {}
  global.settingJSON = settingData;
};

// Initialize routes & static folders
try {
  require("./socket");
} catch (e) {}

const routes = require("../../functions/backend/routes/index");
app.use(routes);
app.use("/api", routes);

app.get("/.well-known/assetlinks.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json(global?.settingJSON?.androidAssetLinks || []);
});

app.get("/.well-known/apple-app-site-association", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json(global?.settingJSON?.appleAppSiteAssociation || {});
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: true, message: "YouPeak Admin Backend is running!", timestamp: new Date().toISOString() });
});

// Start server for local development
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 ====================================`);
  console.log(`🔥 YouPeak Admin Backend Running!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`👑 Admin Panel: http://localhost:3000`);
  console.log(`💡 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Super Admin: youpeak24@gmail.com / 12345678`);
  console.log(`====================================\n`);
});

module.exports = app;
