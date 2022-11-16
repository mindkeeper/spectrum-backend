const usersRepo = require("../repo/users");
const resHelper = require("../helpers/sendResponse");

const create = async (req, res) => {
  try {
    const { body } = req;
    const response = await usersRepo.register(body);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const usersController = { create };

module.exports = usersController;
