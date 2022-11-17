const authRepo = require("../repo/auth");
const resHelper = require("../helpers/sendResponse");

const login = async (req, res) => {
  try {
    const response = await authRepo.login(req.body);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const logout = async (req, res) => {
  try {
    const token = req.header("x-access-token");
    const response = await authRepo.deleteWhitelistToken(token);
    // response(res, { status: 200, message: "Logout success" });
    resHelper.success(res, response.status, response);
  } catch (error) {
    console.log(error);
    resHelper.error(res, error.status, error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const response = await authRepo.resetPassword(req.body);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const authController = {
  login,
  logout,
  resetPassword,
};

module.exports = authController;
