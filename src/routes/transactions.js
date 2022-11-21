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
transactions.get(
  "/history/",
  isLogin(),
  allowedRoles(1, 2),
  transactionsControllers.userTransactions
);
module.exports = transactions;
