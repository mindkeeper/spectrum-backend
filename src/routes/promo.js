const express = require("express");

const promo = express.Router();

const { addPromo, getPromo , getPromoCode } = require("../controllers/promo");

promo.post("/add",addPromo),

promo.get("/",getPromo),

promo.get("/code" , getPromoCode)


module.exports = promo;