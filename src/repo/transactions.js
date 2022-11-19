const postgreDB = require("../config/postgre");

const createTransactions = (body) => {
  return new Promise((resolve, reject) => {
    const query =
      "insert into transactions (user_id, product_name, price, quantity, promo_code, cart_total, shipping, total, status, created_at, updated_at) values($1, $2, $3, $4, $5, $6, $7, $8, $9, to_timestamp($10), to_timestamp($11)) returning *";
    const {
      user_id,
      product_name,
      price,
      quantity,
      promo_code,
      cart_total,
      shipping,
      total,
      status
    } = body;
    const timeStamp = Date.now() / 1000;
    const values = [
      user_id,
      product_name,
      price,
      quantity,
      promo_code,
      cart_total,
      shipping,
      total,
      status,
      timeStamp,
      timeStamp,
    ];

    postgreDB.query(query, values, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal server error" });
      }
      return resolve({
        status: 201,
        msg: "transaction created",
        data: { ...result.rows[0] },
      });
    });
  });
};

const getTransactionById = (id) => {
  return new Promise((resolve, reject) => {
    const query =
      "select p.product_name, p.price, t.quantity, t.total, t.status from transactions t join customers u on c.user_id = t.user_id join products p on p.id = t.product_id where t.id = $1";
      postgreDB.query(query, [id], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length === 0)
        return reject({ status: 404, msg: "Transaction cannot be found" });
      return resolve({
        status: 200,
        msg: "Transaction Details",
        data: { ...result.rows[0] },
      });
    });
  });
};

const transactionsRepo = {
  createTransactions,
  getTransactionById,
};

module.exports = transactionsRepo;
