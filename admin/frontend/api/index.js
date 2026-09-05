// Vercel Serverless Function entrypoint inside admin/frontend/api
const app = require("../backend/index");

module.exports = (req, res) => {
  return app(req, res);
};
