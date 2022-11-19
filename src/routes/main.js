const express = require("express");

const users = require("./users");
const authRouter = require("./auth");
const promoRouter = require("./promo");
const products = require("./products");
const transaction = require("./transactions")

const mainRouter = express.Router();

const prefix = "/api";

mainRouter.use(`${prefix}/users`, users);
mainRouter.use(`${prefix}/auth`, authRouter);
mainRouter.use(`${prefix}/promo`, promoRouter);
mainRouter.use(`${prefix}/products`, products);
mainRouter.use(`${prefix}/transaction`, transaction);

mainRouter.get(`/`, (req, res) => {
  res.json({ msg: "Welcome" });
});

module.exports = mainRouter;
