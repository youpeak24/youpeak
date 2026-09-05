// Vercel Serverless Function entrypoint
const app = require("../functions/backend/index");

module.exports = (req, res) => {
  return app(req, res);
};
