const express = require("express");

const users = express.Router();

const { create } = require("../controllers/users");

users.post("/register", create);

module.exports = users;