const categories = require("express").Router();
const categoriesControllers = require("../controllers/categories");

categories.get("/", categoriesControllers.getCategory);

module.exports = categories;
