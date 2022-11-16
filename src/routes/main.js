const express = require("express");

const users = require("./users");

const mainRouter = express.Router();


const prefix = "/api";

mainRouter.use(`${prefix}/users`, users);


mainRouter.get(`/`, (req, res) => {
  res.json({ msg: "Welcome" });
});

module.exports = mainRouter;
