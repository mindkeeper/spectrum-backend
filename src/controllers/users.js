const usersRepo = require("../repo/users");

const create = async (req, res) => {
    try {
      const { body } = req;
      const response = await usersRepo.createUsers(body);
      res.status(201).json({
        msg: "user created",
        data: response.rows,
      });
    } catch (error) {
      return res.status(error.status).json({ msg: error.message ,  });
    }
  };

  const usersController = {create}

  module.exports = usersController;