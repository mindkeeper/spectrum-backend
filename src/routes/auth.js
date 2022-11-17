const authRouter = require("express").Router();
const authController = require("../controllers/auth");
// const {logout} = require ("../repo/auth")

// const {checkWhitelistToken} = require ('../repo/users')
//login
authRouter.post("/login", authController.login);
authRouter.delete("/logout", authController.logout);
authRouter.post("/reset", authController.resetPassword);

module.exports = authRouter;
