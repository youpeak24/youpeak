// Vercel Serverless Function entrypoint inside admin/frontend
module.exports = async (req, res) => {
  try {
    let app;
    try {
      app = require("../backend/index");
    } catch (e1) {
      try {
        app = require("../../../functions/backend/index");
      } catch (e2) {
        throw e1;
      }
    }
    return app(req, res);
  } catch (err) {
    console.error("Vercel Serverless Function Error in frontend/api:", err);
    return res.status(500).json({
      status: false,
      error: err.message,
      stack: err.stack ? err.stack.split("\n") : []
    });
  }
};
