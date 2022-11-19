const db = require("../config/postgre");

const getCategory = () => {
  return new Promise((resolve, reject) => {
    const query =
      "select c.id , c.category_name ,count(pc.product_id) as total_product  from categories c join product_categories pc on pc.category_id = c.id join products p on p.id = pc.product_id where p.deleted_at is null group by c.id;";

    db.query(query, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      return resolve({
        status: 200,
        msg: "List Categories",
        data: result.rows,
      });
    });
  });
};

const categoriesRepo = {
  getCategory,
};

module.exports = categoriesRepo;
