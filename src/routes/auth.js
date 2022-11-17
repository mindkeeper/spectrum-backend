const authRouter = require("express").Router()
const authController = require("../controllers/auth")
// const {logout} = require ("../repo/auth")
const authRepo = require ("../repo/auth")
// const {checkWhitelistToken} = require ('../repo/users')
//login
authRouter.post("/login", authController.authCon)
authRouter.delete("/logout", authRepo.logout)

module.exports = authRouter