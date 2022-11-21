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
const userTransactions = async (req, res) => {
  try {
    const response = await transactionsRepo.userTransactions(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const updateStatusTrans = async (req, res) => {
  try {
    const response = await transactionsRepo.updateStatusTrans(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};
const cancelTransactions = async (req, res) => {
  try {
    const response = await transactionsRepo.cancelTransactions(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const transactionsControllers = {
  createTransaction,
  userTransactions,
  updateStatusTrans,
  cancelTransactions,
};

module.exports = transactionsControllers;
