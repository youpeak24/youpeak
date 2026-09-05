// Vercel Serverless Function entrypoint
let app;
let errDetails = [];

try {
  app = require("../functions/backend/index");
} catch (e1) {
  errDetails.push(`e1 (functions/backend): ${e1.message} | ${e1.stack}`);
  try {
    app = require("../admin/frontend/backend/index");
  } catch (e2) {
    errDetails.push(`e2 (admin/frontend/backend): ${e2.message} | ${e2.stack}`);
    try {
      app = require("../backend/index");
    } catch (e3) {
      errDetails.push(`e3 (backend): ${e3.message} | ${e3.stack}`);
    }
  }
}

module.exports = (req, res) => {
  if (app) {
    return app(req, res);
  }
  return res.status(500).json({
    status: false,
    error: "Backend application failed to load",
    details: errDetails
  });
};
