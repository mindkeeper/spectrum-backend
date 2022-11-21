const authRouter = require("express").Router();
const authController = require("../controllers/auth");

authRouter.post("/login", authController.login);
authRouter.delete("/logout", authController.logout);
authRouter.post("/reset", authController.resetPassword);

module.exports = authRouter;
