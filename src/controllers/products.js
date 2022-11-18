const resHelper = require("../helpers/sendResponse");
const productsRepo = require("../repo/products");

const createProduct = async (req, res) => {
  try {
    const response = await productsRepo.createProduct(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    return resHelper.error(res, error.status, error);
  }
};

const productsController = {
  createProduct,
};

module.exports = productsController;
