const express = require("express");

const transaction = express.Router();

const { transactionCont } = require("../controllers/promo");

promo.post("/add",addPromo),

promo.get("/",getTransactions),

module.exports = transaction;