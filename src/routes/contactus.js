const express = require("express");
const contact = express.Router();

const { contactUsCont } = require("../controllers/contactus");

contact.post("/", contactUsCont),


module.exports = contact;
