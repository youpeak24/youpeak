// Vercel Serverless Function entrypoint for Express app
const app = require("../functions/backend/index");

module.exports = (req, res) => {
  return app(req, res);
};
