const brandsRouter = require("express").Router();
const brandsController = require("../controllers/brands");

brandsRouter.get("/", brandsController.getBrandsCont);


module.exports = brandsRouter;
