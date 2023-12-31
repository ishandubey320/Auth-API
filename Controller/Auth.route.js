const createError = require("http-errors");
const User = require("../Models/user.model");
const { authSchema } = require("../helper/validate_schema");
const {
  signWithAccess,
  signWithRefreshToken,
  verifyRefreshToken,
} = require("../helper/jwt_helper");
const client = require("../helper/init_redis");

module.exports = {
  register: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);

      if (!req.file) {
        return res.status(400).send("No file uploaded");
      }

      console.log("result");
      console.log(result);

      const doesUserExist = await User.findOne({ email: result.email });

      if (doesUserExist)
        throw createError.Conflict(`${result.email} is already registered`);

      const user = new User({
        email: result.email,
        password: result.password,
        userName: result.userName,
        profileImage: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        },
      });

      const saveUser = await user.save();
      const accessToken = await signWithAccess(saveUser.id);
      const refreshToken = await signWithRefreshToken(saveUser.id);

      console.log(saveUser);
      res.send({ accessToken, refreshToken });
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);
      console.log(result.email, result.password);
      const user = await User.findOne({ email: result.email });

      if (!user) {
        throw createError.NotFound("user does not exist");
      }

      const isMatch = await user.isValidPassword(result.password);

      if (!isMatch) throw createError.Unauthorized("Bad Credentials");

      const accessToken = await signWithAccess(user.id);
      const refreshToken = await signWithRefreshToken(user.id);

      res.send({ accessToken: accessToken, refreshToken: refreshToken });
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest("Invalid Username/password"));

      next(error);
    }
  },
  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) next(createError.BadRequest());

      const userId = await verifyRefreshToken(refreshToken);

      const accessToken = await signWithAccess(userId);
      const refToken = await signWithRefreshToken(userId);

      res.send({ accessToken: accessToken, refreshToken: refToken });
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const userId = req.playload.aud;
      const id = req.params.id;
      const user = await User.findById(id);
      console.log("here");
      console.log(userId, id);

      if (user.roles === "admin" || id === userId) {
        console.log(req.body);
        const name = req.body.userName;
        const image = req.file;

        if (!name && !image)
          return res
            .status(400)
            .json({ message: "Name or profile image is required for update" });

        if (name) {
          user.userName = name;
        }
        if (image) {
          user.profileImage = image;
        }

        const savedUser = await user.save();
        return res.status(200).json({ message: "user details updated!!" });
      } else return next(createError.Unauthorized("Permission Denied"));
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();

      const userId = await verifyRefreshToken(refreshToken);

      client.DEL(userId, (error, val) => {
        if (error) throw createError.InternalServerError();

        console.log(val);
        res.sendStatus(204);
      });
    } catch (error) {
      next(error);
    }
  },
};
