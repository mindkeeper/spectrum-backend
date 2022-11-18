const express = require("express");
const productsController = require("../controllers/products");
const multipleUpload = require("../middleware/uploadMultiple");
const cloudinaryUpload = require("../middleware/cloudMultipleUpload");
const products = express.Router();

products.post(
  "/new",
  multipleUpload,
  cloudinaryUpload,
  productsController.createProduct
);
module.exports = products;
