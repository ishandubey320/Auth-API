const User = require("../Models/user.model");

async function isAdmin(req, res, next) {
  try {
    const userId = req.playload.aud;
    const user = await User.findById(userId);

    if (user && user.roles.includes("admin")) {
      next();
    } else
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
  } catch (error) {
    next(error);
  }
}

module.exports = { isAdmin };
