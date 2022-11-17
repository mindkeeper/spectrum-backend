const express = require("express");

const users = express.Router();

const { register, Profile } = require("../controllers/users");
// const { login } = require("../repo/auth");

users.post("/register", register);
// users.post("/login", login)
users.get("/profile", Profile);

module.exports = users;
