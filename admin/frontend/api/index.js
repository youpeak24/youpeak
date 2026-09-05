// Vercel Serverless Function entrypoint inside admin/frontend
const app = require("../../../functions/backend/index");

module.exports = (req, res) => {
  return app(req, res);
};
