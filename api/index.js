// Vercel Serverless Function entrypoint
module.exports = async (req, res) => {
  try {
    let app;
    try {
      app = require("../functions/backend/index");
    } catch (e1) {
      try {
        app = require("../admin/frontend/backend/index");
      } catch (e2) {
        throw e1;
      }
    }
    return app(req, res);
  } catch (err) {
    console.error("Vercel Serverless Function Error:", err);
    return res.status(500).json({
      status: false,
      error: err.message,
      stack: err.stack ? err.stack.split("\n") : []
    });
  }
};
