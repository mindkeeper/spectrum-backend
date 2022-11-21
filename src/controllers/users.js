const usersRepo = require("../repo/users");
const resHelper = require("../helpers/sendResponse");

const register = async (req, res) => {
  try {
    const { body } = req;
    const response = await usersRepo.register(body);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const profile = async (req, res) => {
  try {
    const { userPayload } = req;
    const response = await usersRepo.getProfile(
      userPayload.user_id,
      userPayload.roles_id
    );
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const editPwd = async (req,res) => {
  try {
    const {body , userPayload} = req;
    const response = await usersRepo.editPassword(body.new_password,userPayload.user_id);
    resHelper.success(res,response.status,response)
  } catch (error) {
    resHelper.error(res,error.status,error)
  }
}

const usersController = {
  register,
  profile,
  editPwd
};

module.exports = usersController;
