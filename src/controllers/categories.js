const productsRepo = require("../repo/categories");
const resHelper = require("../helpers/sendResponse");

const getCategory = async (req, res) => {
  try {
    const response = await productsRepo.getCategory();
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const categoriesControllers = {
  getCategory,
};

module.exports = categoriesControllers;
