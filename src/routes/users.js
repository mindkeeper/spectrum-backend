const express = require("express");

const users = express.Router();

const isLogin = require("../middleware/isLogin");
// const Profile = require("../controllers/users")

<<<<<<< HEAD
const { register, profile, editPwd } = require("../controllers/users");
=======
const { register, Profile, editProfileCont } = require("../controllers/users");
const uploadFile = require("../middleware/uploadSingle")
const uploaderCloudinary = require("../middleware/cloudinary")
>>>>>>> master

users.post("/register", register);

users.get("/profile", isLogin(), Profile );
users.patch("/profile/edit", isLogin(), uploadFile, uploaderCloudinary, editProfileCont );

users.patch("/editpwd", isLogin() , editPwd)

module.exports = users;
