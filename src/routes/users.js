const express = require("express");

const users = express.Router();

const { register } = require("../controllers/users");

users.post("/register", register);

module.exports = users;
