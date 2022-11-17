const express = require("express");

const users = express.Router();

const isLogin = require("../middleware/isLogin");

const { register, profile } = require("../controllers/users");

users.post("/register", register);

users.get("/profile", isLogin(), profile);

module.exports = users;
