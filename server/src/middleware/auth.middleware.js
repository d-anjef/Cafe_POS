const jwt = require("jsonwebtoken");
const User = require("../users/user.model");

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return res.status(401).json({ error: "Please log in to access this." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) return res.status(401).json({ error: "User no longer exists." });

    req.user = currentUser; // Inject user into request
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token. Please login again." });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action" });
    }
    next();
  };
};
