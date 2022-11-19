const createTransactions = (body) => {
    return new Promise((resolve, reject) => {
      const query =
        "insert into transactions (user_id, product_name, quantity, total, price, promo_code, cart_total, shipping, created_at, updated_at) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, to_timestamp($11), to_timestamp($12)) returning *";
      const {
        user_id,
        product_name,
        quantity,
        total,
        price,
        promo_code,
        cart_total,       
        shipping,
        status_id,
      } = body;
      const timeStamp = Date.now() / 1000;
      const values = [
        user_id,
        product_id,
        size_id,
        qty,
        promo_id,
        subtotal,
        delivery_id,
        total,
        payment_id,
        status_id,
        timeStamp,
        timeStamp,
      ];

      // return console.log(values);

      db.query(query, values, (error, result) => {
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
  }