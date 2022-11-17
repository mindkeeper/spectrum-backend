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

const Profile = async (req, res) => {
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

const editProfileCont = async (req, res) => {
  try {
    const { userPayload } = req;
    const response = await usersRepo.editProfile(
      userPayload.user_id,
      userPayload.roles_id,
      req.body,
      req.file
    );
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const usersController = {
  register,
  Profile,
  editProfileCont
};

module.exports = usersController;
