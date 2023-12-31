const express = require("express");
const router = express.Router();
const AuthController = require("../Controller/Auth.route");
const { verifyAccessToken } = require("../helper/jwt_helper");
const upload = require("../middleware/multerConfig");

//Register Route
router.post("/register", upload.single("image"), AuthController.register);

//logout Route
router.post("/login", AuthController.login);

//Update User
router.put(
  "/updateUser/id/:id",
  upload.single("image"),
  verifyAccessToken,
  AuthController.updateUser
);

//Refresh-token Route
router.post("/refresh-token", AuthController.refreshToken);

router.delete("/logout", AuthController.logout);

module.exports = router;
