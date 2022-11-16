const usersRepo = require("../repo/users");
const authRepo = require("../repo/auth")
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

// const login = async (req, res) => {
//   try {
//     const { body } = req;
//     const response = await authRepo.login(body);
//     resHelper.success(res, response.status, response);
//   } catch (error) {
//     resHelper.error(res, error.status, error);
//   }
// };

const login = (req, res) => {
  authRepo.login(req.body)
    .then((response) => {
        res.status(200).json({
            data: response,
            msg: "Login Succesfully"
        })
    })
    .catch((objErr) => {
      const statusCode = objErr.statusCode || 500;
      res.status(statusCode).json({ msg: objErr.err.message });
    });
};





const usersController = { 
  register,
  login
};




module.exports = usersController;
