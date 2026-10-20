const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({ message: "Invalid authorization format" });
  }

  try {
    const secret =
      process.env.JWT_SECRET_KEY ||
      process.env.JWT_SECRET ||
      "default_jwt_secret";
    const decoded = jwt.verify(token, secret);
    req.user = { _id: decoded.id, id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid or has expired" });
  }
};

module.exports = authMiddleware;
