const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({
      message: "No token"
    });
  }

  try {
    const verified = jwt.verify(token, "secret123");

    req.user = verified;

    next();
  } catch (err) {
    res.status(401).json({
      message: "Invalid token"
    });
  }
};

module.exports = auth;