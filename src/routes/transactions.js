const express = require("express");
const transaction = express.Router();
const { transactionCont, getTransactionByIdCont } = require("../controllers/transactions");

transaction.post("/add", transactionCont),
transaction.get("/order-list", getTransactionByIdCont),

module.exports = transaction;