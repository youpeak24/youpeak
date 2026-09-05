// Vercel Serverless Function entrypoint inside admin/frontend with diagnostic error logging
module.exports = (req, res) => {
  try {
    const app = require("../backend/index");
    return app(req, res);
  } catch (err) {
    console.error("Vercel Serverless Function Error:", err);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      status: false,
      error: "Vercel Function Error",
      message: err.message,
      stack: err.stack,
    });
  }
};
