const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {

  const token = req.headers.authorization;

  if (!token)
    return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};
