const express = require("express");
const productsController = require("../controllers/products");
const multipleUpload = require("../middleware/uploadMultiple");
const cloudinaryUpload = require("../middleware/cloudMultipleUpload");
const products = express.Router();
const isLogin = require("../middleware/isLogin");
const allowedRoles = require("../middleware/allowedRoles");
// const validate = require("../middleware/validate");

products.post(
  "/new",
  isLogin(),
  allowedRoles(1),
  multipleUpload,
  cloudinaryUpload,
  productsController.createProduct
);

products.get("/", productsController.searchProducts);
products.get("/details/:id", productsController.getDetailsById);

module.exports = products;
