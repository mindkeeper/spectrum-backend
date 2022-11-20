const transactionsControllers = require("../controllers/transactions");
const express = require("express");
const isLogin = require("../middleware/isLogin");
const allowedRoles = require("../middleware/allowedRoles");
const transactions = express.Router();

transactions.post(
  "/new",
  isLogin(),
  allowedRoles(1),
  transactionsControllers.createTransaction
);

module.exports = transactions;
