const transactionsRepo = require("../repo/transactions");
const resHelper = require("../helpers/sendResponse");

const transactionCont = async (req, res) => {
  try {
    const { body } = req;
    const response = await transactionsRepo.createTransactions(body);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const getTransactionByIdCont = async (req, res) => {
  try {
    const { body } = req;
    const response = await transactionsRepo.getTransactionById(body);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};







const transactionController = {
  transactionCont,
  getTransactionByIdCont
};

module.exports = transactionController;