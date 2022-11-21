const db = require("../config/postgre");

const userTransactions = (req) => {
  return new Promise((resolve, reject) => {
    const userId = req.userPayload.user_id;
    const { page, limit } = req.query;

    const sqlCount = `select count(ti.id) from transactions_items ti join transactions t on t.id = ti.transaction_id join users u on u.id = t.user_id where u.id = $1`;

    db.query(sqlCount, [userId], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length === 0)
        return reject({ status: 404, msg: "Sorry. we cant find anything" });

      let link = "";
      const totalData = parseInt(result.rows[0].count);
      const sqlLimit = !limit ? 5 : parseInt(limit);
      const sqlOffset = !page || page == 1 ? 0 : parseInt(page - 1) * sqlLimit;
      const currentPage = !page ? 1 : parseInt(page);
      const totalPage =
        totalData < sqlLimit ? 1 : Math.ceil(totalData / sqlLimit);
      const prev =
        currentPage === 1
          ? null
          : link + `page=${currentPage - 1}&limit=${sqlLimit}`;
      const next =
        currentPage === totalPage
          ? null
          : link + `page=${currentPage + 1}&limit=${sqlLimit}`;
      const meta = {
        page: parseInt(currentPage),
        totalPage: parseInt(totalPage),
        totalData: parseInt(totalData),
        prev,
        next,
      };
      const sqlSelect = `select t.id, p.id as product_id, p.product_name, p.price, ti.qty, ti.total as subtotal, 
      (select images from product_images pi2 where pi2.product_id = p.id limit 1) as image,
      s.status, s2.status as shipment_status, p2."method" as payment_method
      from transactions t 
      right join transactions_items ti on t.id = ti.transaction_id
      join products p on p.id = ti.product_id
      join status s on s.id = t.status_id
      join shipments s2 on s2.id = t.shipment_id
      join payments p2 on p2.id = t.payment_id 
      where t.deleted_at is null and  t.user_id = $1 limit $2 offset $3`;
      console.log(sqlLimit, sqlOffset);
      db.query(sqlSelect, [userId, sqlLimit, sqlOffset], (err, result) => {
        if (err) {
          console.log(err);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        return resolve({
          status: 200,
          msg: "Heres your history",
          data: result.rows,
          meta,
        });
      });

      // return resolve({ status: 200, msg: "", data: totalData });
    });
  });
};

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
      const productWithPrice = [];

      for (let i = 0; i < productList.length; i++) {
        let price = result.rows[i].price;
        if (result.rows[i].stock < productList[i].qty)
          return reject({
            status: 400,
            msg: `Sorry the stock of this ${result.rows[i].product_name} doesnt meet the quantity you wanted :(`,
          });
        prepareUpdateStockValues.push(
          parseInt(price),
          parseInt(result.rows[i].stock - productList[i].qty)
        );
        productWithPrice.push({
          ...productList[i],
          total: price * productList[i].qty,
        });
      }

      console.log(prepareUpdateStockValues, productWithPrice);
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
  userTransactions,
};

module.exports = transactionsRepo;
