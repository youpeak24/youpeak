// Vercel Serverless Function entrypoint with error capture
module.exports = (req, res) => {
  try {
    const app = require("../functions/backend/index");
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
