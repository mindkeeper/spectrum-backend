const promoRepo = require("../repo/promo");
const resHelper = require("../helpers/sendResponse");

const addPromo = async (req, res) => {
  try {
    const { body } = req;
    const response = await promoRepo.addPromo(body);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const getPromo = async (req, res) => {
  try {
    const {query} = req
    const response = await promoRepo.getAllPromo(query.page, query.limit);
    resHelper.success(res, response.status, response,);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const getPromoCode = async (req, res) => {
    try {
    const {body} = req
      const response = await promoRepo.getPromoCode(body.code);
      resHelper.success(res, response.status, response);
    } catch (error) {
      resHelper.error(res, error.status, error);
    }
  };

const promoController = {
  addPromo,
  getPromo,
  getPromoCode,
};

module.exports = promoController;
