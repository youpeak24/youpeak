// Vercel Serverless Function entrypoint
module.exports = (req, res) => {
  try {
    const app = require("../functions/backend/index");
    return app(req, res);
  } catch (err) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      status: false,
      error: err.message,
      stack: err.stack ? err.stack.split("\n") : []
    });
  }
};
