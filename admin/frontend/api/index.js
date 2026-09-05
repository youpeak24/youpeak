// Vercel Serverless Function entrypoint inside admin/frontend
let app;
let errDetails = [];

try {
  app = require("../backend/index");
} catch (e1) {
  errDetails.push(`e1 (frontend/backend): ${e1.message} | ${e1.stack}`);
  try {
    app = require("../../functions/backend/index");
  } catch (e2) {
    errDetails.push(`e2 (functions/backend): ${e2.message} | ${e2.stack}`);
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
