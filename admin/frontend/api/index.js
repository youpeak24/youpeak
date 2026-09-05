// Vercel Serverless Function entrypoint inside admin/frontend
const app = require("../backend/index");

module.exports = (req, res) => {
  return app(req, res);
};
