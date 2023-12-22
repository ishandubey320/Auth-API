const express = require("express");
const router = express.Router();
const AuthController = require("../Controller/Auth.route");

//Register Route
router.post("/register", AuthController.register);

//logout Route
router.post("/login", AuthController.login);

//Refresh-token Route
router.post("/refresh-token", AuthController.refreshToken);

router.delete("/logout", AuthController.logout);

module.exports = router;
