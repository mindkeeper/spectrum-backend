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

const getAllPromo = (page, limit) => {
  return new Promise((resolve, reject) => {
    console.log(limit);
    let link = "/promo/?";
    const countQuery = "select count(id) as count from promo";
    const sqlLimit = !limit ? 4 : parseInt(limit);
    const sqlOffset = !page || page === "1" ? 0 : parseInt(page - 1) * limit;
    postgreDB.query(countQuery, (error, result) => {
      if (error) {
        console.log(error);
        return reject({
          status: 500,
          msg: "Internal server error",
        });
      }
      const totalData = parseInt(result.rows[0].count);
      const currentPage = page ? parseInt(page) : 1;
      const totalPage = sqlLimit > totalData ? 1 : Math.ceil(totalData / limit);
      const prev =
        currentPage === 1
          ? null
          : link + `page=${currentPage - 1}&limit=${sqlLimit}`;
      const next =
        currentPage === totalPage
          ? null
          : link + `page=${currentPage + 1}&limit=${sqlLimit}`;
      const meta = {
        page: currentPage,
        totalPage,
        limit: sqlLimit,
        totalData,
        prev,
        next,
      };
      const query =
        "select * from promo order by created_at desc limit  $1 offset  $2";
      postgreDB.query(query, [sqlLimit, sqlOffset], (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        return resolve({
          status: 201,
          msg: "this is promo",
          data: { ...result.rows },
          meta,
        });
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
