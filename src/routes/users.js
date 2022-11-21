const express = require("express");

const users = express.Router();

const isLogin = require("../middleware/isLogin");

const { register, profile, editPwd } = require("../controllers/users");

users.post("/register", register);

users.get("/profile", isLogin(), profile);

users.patch("/editpwd", isLogin() , editPwd)

module.exports = users;
