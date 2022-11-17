const express = require("express");

const users = require("./users");
const authRouter = require("./auth");
const promoRouter = require('./promo')

const mainRouter = express.Router();


const prefix = "/api";

mainRouter.use(`${prefix}/users`, users);
mainRouter.use(`${prefix}/auth`, authRouter);
mainRouter.use(`${prefix}/promo`, promoRouter)


mainRouter.get(`/`, (req, res) => {
  res.json({ msg: "Welcome" });
});

module.exports = mainRouter;
