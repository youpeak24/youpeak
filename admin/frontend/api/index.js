// Vercel Serverless Function entrypoint inside admin/frontend/api with error capture
module.exports = (req, res) => {
  try {
    const app = require("../backend/index");
    return app(req, res);
  } catch (err) {
    console.error("Vercel Function Error:", err);
    return res.status(500).json({
      status: false,
      error: err.message || "Vercel Function Error",
      stack: err.stack ? err.stack.split("\n") : []
    });
  }
};
