const express = require("express");

const users = express.Router();

const isLogin = require("../middleware/isLogin");

const { register, Profile } = require("../controllers/users");

users.post("/register", register);

users.get("/profile", isLogin(), Profile);

module.exports = users;
