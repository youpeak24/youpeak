module.exports = (req, res) => {
  try {
    const app = require("../backend/index");
    return app(req, res);
  } catch (err) {
    return res.status(200).json({ status: false, error: err.message, stack: err.stack });
  }
};
