const db = require("../config/postgre");

const createProduct = (req) => {
  return new Promise((resolve, reject) => {
    const { body } = req;
    const images = req.file;
    const timeStamp = Date.now() / 1000;
    // const categories = body.categories;
    // const userId = userPayload.user_id;
    const {
      product_name,
      price,
      stock,
      brand_id,
      color_id,
      conditions,
      description,
      user_id,
    } = body;

    // if (!images)
    //   return reject({ status: 500, msg: "Field Image cant be empty" });

    const addProductQuery =
      "insert into products(product_name, price, user_id, stock, brand_id, color_id, conditions, description, created_at, updated_at) values($1, $2, $3, $4, $5, $6, $7, $8, to_timestamp($9), to_timestamp($10)) returning *";
    const addProductValues = [
      product_name,
      price,
      user_id,
      stock,
      brand_id,
      color_id,
      conditions,
      description,
      timeStamp,
      timeStamp,
    ];
    db.query(addProductQuery, addProductValues, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      let createdProduct = { ...result.rows[0] };
      const productId = result.rows[0].id;
      let imageValues = "values";
      const prepareImageValues = [];
      images.forEach((image, index) => {
        if (index !== images.length - 1) {
          imageValues += `($${1 + index * 4}, $${
            2 + index * 4
          }, to_timestamp($${3 + index * 4}), to_timestamp($${
            4 + index * 4
          })), `;
        } else {
          imageValues += `($${1 + index * 4}, $${
            2 + index * 4
          }, to_timestamp($${3 + index * 4}), to_timestamp($${4 + index * 4}))`;
        }
        prepareImageValues.push(productId, image, timeStamp, timeStamp);
      });
      const addImageQuery = `insert into product_images(product_id, images, created_at, updated_at) ${imageValues} returning *`;
      db.query(addImageQuery, prepareImageValues, (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server" });
        }
        const imagreResult = [];

        result.rows.forEach((image) => imagreResult.push(image.images));
        createdProduct = { ...createdProduct, image: imagreResult };
        const categories = JSON.parse(body.categories);
        const prepareCategoryValues = [];
        let categoryValues = "values";

        categories.forEach((categoryId, index) => {
          if (index !== categories.length - 1) {
            categoryValues += `($${1 + index * 4}, $${
              2 + index * 4
            }, to_timestamp($${3 + index * 4}), to_timestamp($${
              4 + index * 4
            })), `;
          } else {
            categoryValues += `($${1 + index * 4}, $${
              2 + index * 4
            }, to_timestamp($${3 + index * 4}), to_timestamp($${
              4 + index * 4
            }))`;
          }
          prepareCategoryValues.push(
            productId,
            categoryId,
            timeStamp,
            timeStamp
          );
        });
        const insertCategotyQuery = `insert into product_categories(product_id, category_id, created_at, updated_at) ${categoryValues} returning *`;
        db.query(
          insertCategotyQuery,
          prepareCategoryValues,
          (error, result) => {
            if (error) {
              console.log(error);
              return reject({ status: 500, msg: "Internal Server Error" });
            }

            const categoryResult = [];
            result.rows.forEach((category) =>
              categoryResult.push(category.category_id)
            );
            createdProduct = { ...createdProduct, category: categoryResult };
            return resolve({
              status: 201,
              msg: `Product ${createdProduct.product_name} created successfully`,
              data: createdProduct,
            });
          }
        );
      });
    });
  });
};

const productsRepo = {
  createProduct,
};

module.exports = productsRepo;
