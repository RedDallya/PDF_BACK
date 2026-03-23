// middlewares/validateTokenFromQuery.js
const jwt = require("jsonwebtoken");

module.exports = function validateTokenFromQuery(req, res, next) {
  const token = req.query.token;
  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};
