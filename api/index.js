// Vercel Serverless Function diagnostic handler
module.exports = (req, res) => {
  const status = {};
  const modules = [
    "express",
    "cors",
    "morgan",
    "firebase-admin",
    "../backend/util/connection",
    "../backend/setting",
    "../backend/routes/index"
  ];

  for (const mod of modules) {
    try {
      require(mod);
      status[mod] = "OK";
    } catch (err) {
      status[mod] = `ERROR: ${err.message}`;
    }
  }

  try {
    const app = require("../backend/index");
    return app(req, res);
  } catch (err) {
    return res.status(200).json({
      status: false,
      diagnostics: status,
      error: err.message,
      stack: err.stack ? err.stack.split("\n") : []
    });
  }
};
