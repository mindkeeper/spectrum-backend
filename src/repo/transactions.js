const db = require("../config/postgre");

const createTransaction = (req) => {
  return new Promise((resolve, reject) => {
    const {
      productList,
      promo_id = 4,
      total,
      payment_id,
      shipment_id,
      phone,
      address,
      status_id,
      receiver_name,
      subtotal,
    } = req.body;
    const userId = req.userPayload.user_id;
    const timeStamp = Date.now() / 1000;

    const transactionValues = [
      userId,
      receiver_name,
      promo_id,
      payment_id,
      shipment_id,
      status_id,
      phone,
      address,
      subtotal,
      total,
      timeStamp,
      timeStamp,
    ];

    const transactionQuery =
      "INSERT INTO transactions(user_id, receiver_name, promo_id, payment_id, shipment_id, status_id, phone, address, subtotal, total, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, to_timestamp($11), to_timestamp($12)) returning *";
    // console.log(productList);
    let getProductsQuery =
      "SELECT p.product_name, p.price, p.stock FROM products p where p.id in(";

    productList.forEach((e, index, array) => {
      if (index !== array.length - 1) {
        getProductsQuery += `${e.productId}, `;
      } else {
        getProductsQuery += `${e.productId})`;
      }
    });
    // console.log(prepareUpdateStockValues);
    // console.log(getProductsQuery);
    db.query(getProductsQuery, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }

      const prepareUpdateStockValues = [];
      const productWithPrice = productList.map((e, idx) => {
        let price = result.rows[idx].price;
        if (result.rows[idx].stock < e.qty)
          return reject({
            status: 400,
            msg: `Sorry the stock of this ${result.rows[idx].product_name} doesnt meet the quantity you wanted :(`,
          });
        prepareUpdateStockValues.push(
          parseInt(e.productId),
          parseInt(result.rows[idx].stock - e.qty)
        );
        return (e = { ...e, total: price * e.qty });
      });

      db.query(transactionQuery, transactionValues, (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal server error" });
        }
        const transactionsId = result.rows[0].id;
        const transactionResult = result.rows[0];
        const productWithTransactionsId = productWithPrice.map(
          (e) => (e = { ...e, transactionsId })
        );
        const prepareItemsValue = [];
        let values = "VALUES";
        productWithTransactionsId.forEach((e, index, array) => {
          if (index !== array.length - 1) {
            values += `($${1 + index * 6}, $${2 + index * 6}, $${
              3 + index * 6
            }, $${4 + index * 6}, to_timestamp($${
              5 + index * 6
            }), to_timestamp($${6 + index * 6})), `;
          } else {
            values += `($${1 + index * 6}, $${2 + index * 6}, $${
              3 + index * 6
            }, $${4 + index * 6}, to_timestamp($${
              5 + index * 6
            }), to_timestamp($${6 + index * 6}))`;
          }
          prepareItemsValue.push(
            e.transactionsId,
            e.productId,
            e.qty,
            e.total,
            timeStamp,
            timeStamp
          );
        });
        let transactionsItemsQuery = `INSERT INTO transactions_items(transaction_id, product_id, qty, total, created_at, updated_at) ${values} returning *`;
        db.query(transactionsItemsQuery, prepareItemsValue, (error, result) => {
          if (error) {
            console.log(error);
            return reject({ status: 500, msg: "Internal Server Error" });
          }
          const resultProductList = result.rows;

          let updateStock = "update products set stock = (CASE id ";
          let stockIdprepare = "";
          for (let i = 0; i < prepareUpdateStockValues.length / 2; i++) {
            updateStock += `when $${1 + i * 2} then $${2 + i * 2}::integer `;

            if (i === prepareUpdateStockValues.length / 2 - 1) {
              updateStock += "end) where id in(";
              stockIdprepare += `$${1 + i * 2}`;
            } else {
              stockIdprepare += `$${1 + i * 2}, `;
            }
          }
          const sqlUpdateStock = updateStock + stockIdprepare + ")";
          console.log(sqlUpdateStock);
          const stockvalues = prepareUpdateStockValues.map((e) => typeof e);
          console.log(stockvalues);
          db.query(
            sqlUpdateStock,
            prepareUpdateStockValues,
            (error, result) => {
              if (error) {
                console.log(error);
                return reject({ status: 500, msg: "Internal Server Error" });
              }
              return resolve({
                status: 201,
                msg: "Transaction created",
                data: { ...transactionResult, productList: resultProductList },
              });
            }
          );
        });
      });
    });
  });
};

const transactionsRepo = {
  createTransaction,
};

module.exports = transactionsRepo;
