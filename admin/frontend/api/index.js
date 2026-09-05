// Vercel Serverless Function entrypoint inside admin/frontend
let app;
try {
  app = require("../backend/index");
} catch (e1) {
  try {
    app = require("../../functions/backend/index");
  } catch (e2) {
    console.error("Failed to load backend application in frontend/api:", e1, e2);
  }
}

module.exports = (req, res) => {
  if (app) {
    return app(req, res);
  }
  return res.status(500).json({ status: false, error: "Backend application failed to load" });
};
