const express = require("express");

const promo = express.Router();

const { addPromo } = require("../controllers/promo");

promo.post("/add",addPromo)


module.exports = promo;