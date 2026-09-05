// Vercel Serverless Function entrypoint
const app = require("./admin/frontend/backend/index");

module.exports = (req, res) => {
  return app(req, res);
};
