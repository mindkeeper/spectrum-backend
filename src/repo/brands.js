const postgreDB = require("../config/postgre");

const getAllBrands = () => {
    return new Promise((resolve, reject) => {
      const query =
        "select id, brand_name from brands ";
      postgreDB.query(query, (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        if (result.rows.length === 0) {
          return reject({
            status: 200,
            msg: "brand not found",
          });
        }
        return resolve({
          status: 200,
          msg: "list brands",
          data: { ...result.rows },
          
        });
      });
    });
  };

  const brandsRepo = {
    getAllBrands,
  };
  module.exports = brandsRepo;