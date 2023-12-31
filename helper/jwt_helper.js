const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const client = require("./init_redis");

module.exports = {
  signWithAccess: (userId) => {
    return new Promise((resolve, reject) => {
      const playload = {};
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        expiresIn: "1h",
        issuer: "ishan",
        audience: userId,
      };
      JWT.sign(playload, secret, options, (error, token) => {
        if (error) return reject(error);
        resolve(token);
      });
    });
  },

  verifyAccessToken: (req, res, next) => {
    console.log(`auth:: ${req.headers["authorization"]}`);

    if (!req.headers["authorization"]) return next(createError.Unauthorized());

    const bearerToken = req.headers["authorization"].split(" ");
    const token = bearerToken[1];
    console.log(token);
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, playload) => {
      if (error) {
        const message =
          error.name === "JsonWebTokenError" ? "Unauthorized" : error.message;
        return next(createError.Unauthorized(message));
      }

      req.playload = playload;
      return next();
    });
  },

  signWithRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      const playload = {};
      const secret = process.env.REFRESH_TOKEN_SECRET;
      const options = {
        expiresIn: "1y",
        issuer: "ishan",
        audience: userId,
      };
      JWT.sign(playload, secret, options, (error, token) => {
        if (error) return reject(error);

        client.SET(userId, token, "EX", 365 * 24 * 60 * 60, (error, reply) => {
          if (error) return reject(createError.InternalServerError());

          resolve(token);
        });
      });
    });
  },

  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (error, playload) => {
          if (error) return reject(createError.Unauthorized());

          const userId = playload.aud;
          client.GET(userId, (error, result) => {
            if (error) return reject(createError.InternalServerError());

            if (result === refreshToken) return resolve(userId);

            return reject(createError.Unauthorized());
          });
        }
      );
    });
  },
};
