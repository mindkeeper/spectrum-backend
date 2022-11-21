const brandsRepo = require("../repo/brands");
const resHelper = require("../helpers/sendResponse");


const getBrandsCont = async (req, res) => {
    try {
      const {query} = req
      const response = await brandsRepo.getAllBrands(query.page, query.limit);
      resHelper.success(res, response.status, response,);
    } catch (error) {
      resHelper.error(res, error.status, error);
    }
  };
  

  const brandsController = {
    getBrandsCont,
  };
  
  module.exports = brandsController;