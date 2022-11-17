const express = require("express");

const users = express.Router();

const { register } = require("../controllers/users");
const { login } = require("../repo/auth");

users.post("/register", register);
// users.post("/login", login)

module.exports = users;
