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
  const promoController = {
    addPromo
  };
  
  module.exports = promoController;