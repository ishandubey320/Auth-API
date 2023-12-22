const express = require("express");
const createError = require("http-errors");
const morgan = require("morgan");
require("dotenv").config();
const AuthRouter = require("./routes/Auth.route.js");
require("./helper/init_mongodb.js");
const { verifyAccessToken } = require("./helper/jwt_helper.js");
const client = require("./helper/init_redis.js");

const PORT = process.env.PORT || 3000;
const app = express();

app.get("/", verifyAccessToken, async (req, res, next) => {
  console.log(req.headers["authorization"]);

  res.send("HOME PAGE!!");
});

app.use(express.json());
app.use(express.urlencoded({ extend: true }));
app.use("/auth", AuthRouter);

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
