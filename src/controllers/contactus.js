const contactRepo = require("../repo/contact");
const resHelper = require("../helpers/sendResponse");

const contactUsCont = async (req, res) => {
  try {
    const { body } = req;
    const response = await contactRepo.contactUs(body);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};


const promoController = {
    contactUsCont,
};

module.exports = promoController;
