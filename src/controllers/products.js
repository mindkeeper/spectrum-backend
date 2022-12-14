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

const searchProducts = async (req, res) => {
  try {
    const response = await productsRepo.searchProducts(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const getDetailsById = async (req, res) => {
  try {
    const response = await productsRepo.getDetailsById(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};
const getRelatedProducts = async (req, res) => {
  try {
    const response = await productsRepo.getRelatedProducts(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};
const deleteProduct = async (req, res) => {
  try {
    const response = await productsRepo.deleteProduct(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};
const getSellerProducts = async (req, res) => {
  try {
    const response = await productsRepo.getSellerProducts(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const productsController = {
  createProduct,
  searchProducts,
  getDetailsById,
  getRelatedProducts,
  deleteProduct,
  getSellerProducts,
};

module.exports = productsController;
