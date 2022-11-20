const transactionsRepo = require("../repo/transactions");
const resHelper = require("../helpers/sendResponse");

const createTransaction = async (req, res) => {
  try {
    const response = await transactionsRepo.createTransaction(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const transactionsControllers = {
  createTransaction,
};

module.exports = transactionsControllers;
