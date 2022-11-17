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
    const response = await usersRepo.getProfileId(userPayload);
    console.log(response.rows);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const usersController = { 
  register,
  Profile,
};




module.exports = usersController;
