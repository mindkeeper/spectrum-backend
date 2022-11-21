const express = require("express");

const users = require("./users");
const authRouter = require("./auth");
const promoRouter = require("./promo");
const products = require("./products");
const brands = require("./brands");

const categories = require("./categories");
const transactions = require("./transactions");
const mainRouter = express.Router();

const prefix = "/api";

mainRouter.use(`${prefix}/users`, users);
mainRouter.use(`${prefix}/auth`, authRouter);
mainRouter.use(`${prefix}/promo`, promoRouter);
mainRouter.use(`${prefix}/products`, products);
mainRouter.use(`${prefix}/brands`, brands);
mainRouter.use(`${prefix}/categories`, categories);
mainRouter.use(`${prefix}/transactions`, transactions);

mainRouter.get(`/`, (req, res) => {
  res.json({ msg: "Welcome" });
});

module.exports = mainRouter;
