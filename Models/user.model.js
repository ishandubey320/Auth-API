const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  userName: {
    type: String,
    required: true,
  },

  roles: {
    type: String,
    default: "user",
  },

  profileImage: {
    data: Buffer, // Buffer type to store binary data
    contentType: String, // MIME type of the image
  },
});

UserSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    console.log(this.password);
    const hashPassword = await bcrypt.hash(this.password, salt);
    console.log(hashPassword);
    this.password = hashPassword;
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.isValidPassword = async function (password) {
  try {
    console.log(password, this.password);
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("user", UserSchema);
module.exports = User;
