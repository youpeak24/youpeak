// Vercel Serverless Function entrypoint
let app;
try {
  app = require("../functions/backend/index");
} catch (e1) {
  try {
    app = require("../admin/frontend/backend/index");
  } catch (e2) {
    try {
      app = require("../backend/index");
    } catch (e3) {
      console.error("Failed to load backend application:", e1, e2, e3);
    }
  }
}

module.exports = (req, res) => {
  if (app) {
    return app(req, res);
  }
  return res.status(500).json({ status: false, error: "Backend application failed to load" });
};
