//dns resolution fix for Node 18+ & Firebase Cloud Functions
const dns = require("dns");

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

//express
const express = require("express");
const app = express();

//cors
const cors = require("cors");

app.use(cors({ origin: true, credentials: true }));
app.options("*", cors());

// Safe Body Parser for Vercel
app.use((req, res, next) => {
  if (req.body && typeof req.body === "string") {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {}
  }
  next();
});
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

//logging middleware
var logger = require("morgan");
app.use(logger("dev"));

//path
const path = require("path");

//dotenv
require("dotenv").config({ path: ".env" });

//connection.js (100% Firebase Firestore)
const db = require("./util/connection");

//fs
const fs = require("fs");

//settingJson
const settingJson = require("./setting");

const os = require("os");

//Declare global variable
global.settingJSON = settingJson;

//Declare the function as a global variable to update the setting.js file
global.updateSettingFile = (settingData) => {
  try {
    const settingJSON = JSON.stringify(settingData, null, 2);
    const tmpFile = path.join(os.tmpdir(), "setting.js");
    fs.writeFileSync(tmpFile, `module.exports = ${settingJSON};`, "utf8");
  } catch (e) {}
  global.settingJSON = settingData;
};

const routes = require("./routes/index");
app.use("/", routes);
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

// Global Express Error Handler to catch all unhandled errors and return JSON
app.use((err, req, res, next) => {
  console.error("Express Global Error:", err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(200).json({
    status: false,
    message: err.message || "An unexpected error occurred",
  });
});

module.exports = app;
