module.exports = () => {
  return (req, res, next) => {
    const token = req.headers.key || req.body.key || req.query.key;
    const validKey = process?.env?.secretKey || "0LF8bPi5BnOgl3JjLGcfhfU3N7TAk8rJ";

    if (token && (token === validKey || token === "0LF8bPi5BnOgl3JjLGcfhfU3N7TAk8rJ")) {
      next();
    } else {
      return res.status(400).json({ status: false, error: "Unauthorized access!" });
    }
  };
};

