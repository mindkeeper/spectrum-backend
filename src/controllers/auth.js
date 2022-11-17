const authRepo = require("../repo/auth");
const resHelper = require("../helpers/sendResponse");

const authCon = (req, res) => {
  authRepo
    .login(req.body)
    .then((response) => {
      res.status(200).json({
        data: response,
        msg: "Login Succesfully",
      });
    })
    .catch((objErr) => {
      const statusCode = objErr.statusCode || 500;
      res.status(statusCode).json({ msg: objErr.err.message });
    });
};

// const authCon = async (req, res) => {
//   try {
//     const { body } = req;
//     const response = await authRepo.login(body);
//     resHelper.success(res, response.status, response);
//   } catch (objErr) {
//     const statusCode = objErr.statusCode || 500;
//     res.status(statusCode).json({ msg: objErr.err.message });
//     // resHelper.error(res, error.status, error);
//   }
// };







const authController = {
  authCon,
};

module.exports = authController;
