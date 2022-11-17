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

const logout = async (req, res) => {
  try {
    const token = req.header("x-access-token");
    console.log(token);
    await authRepo.deleteWhitelistToken(token);
    // response(res, { status: 200, message: "Logout success" });
    resHelper.success(res, response.status, response);
  } catch (error) {
    console.log(error);
    // return response(res, {
    //   error,
    //   status: 500,
    //   message: "Internal server error",
    // });
    res.status(500).json({error, msg: "internal server error" });
    // resHelper.error(res, error.status, error);
  }
}







const authController = {
  authCon,
  logout
};

module.exports = authController;
