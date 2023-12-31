const express = require("express");
const createError = require("http-errors");
const morgan = require("morgan");
require("dotenv").config();
const AuthRouter = require("./routes/Auth.route.js");
require("./helper/init_mongodb.js");
const { verifyAccessToken } = require("./helper/jwt_helper.js");
const client = require("./helper/init_redis.js");
const User = require("./Models/user.model.js");
const { isAdmin } = require("./middleware/isAdmin.js");

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extend: true }));

app.get("/", verifyAccessToken, async (req, res, next) => {
  const userId = req.playload.aud;
  const user = await User.findById(userId);
  if (!user.profileImage || !user.profileImage.data) {
    return res.status(404).json({ message: "Profile image not found" });
  }
  res.set("Content-Type", user.profileImage.contentType);
  // Send the image data as the response
  res.send(user.profileImage.data);
});

app.use("/auth", AuthRouter);

app.get("/admin-panel", verifyAccessToken, isAdmin, (req, res) => {
  // Only users with 'admin' role can access this route
  res.send("Admin panel accessed successfully");
});

app.use(async (req, res, next) => {
  next(createError.NotFound("this url does not exist!"));
});

app.use(async (error, req, res, next) => {
  res.status(error.status || 500);
  res.send({
    error: {
      status: error.status || 500,
      message: error.message,
    },
  });
});

app.listen(PORT, () => {
  console.log(`server connected at http://localhost:${PORT}`);
});
