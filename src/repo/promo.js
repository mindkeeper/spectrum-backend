const postgreDB = require("../config/postgre");

const addPromo = (body) => {
  return new Promise((resolve, reject) => {
    const { code, discount } = body;
    const upsize = code.toUpperCase();
    const timeStamp = Date.now() / 1000;
    const query =
      "insert into promo(code,discount,created_at,updated_at) values($1,$2,to_timestamp($3),to_timestamp($4))";
    postgreDB.query(
      query,
      [upsize, discount, timeStamp, timeStamp],
      (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        return resolve({
          status: 201,
          msg: "Your promo created successfully",
          data: { ...result.rows[0] },
        });
      }
    );
  });
};

const getAllPromo = () => {
  return new Promise((resolve, reject) => {
    const query = "select * from promo";
    postgreDB.query(query, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      return resolve({
        status: 201,
        msg: "this is promo",
        data: { ...result.rows },
      });
    });
  });
};

const getPromoCode = (code) => {
  return new Promise((resolve, reject) => {
    const upsize = code.toUpperCase();
    const query = "select * from promo where promo.code = $1";
    postgreDB.query(query, [upsize], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length === 0) {
        return reject({
          status: 200,
          msg: "promo not found",
        });
      }
      return resolve({
        status: 200,
        msg: "this is promo",
        data: { ...result.rows[0] },
      });
    });
  });
};

const promoRepo = {
  addPromo,
  getAllPromo,
  getPromoCode,
};
module.exports = promoRepo;
