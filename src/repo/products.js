const db = require("../config/postgre");

const createProduct = (req) => {
  return new Promise((resolve, reject) => {
    const { body, userPayload } = req;
    const images = req.file;
    const timeStamp = Date.now() / 1000;
    // const categories = body.categories;
    const userId = userPayload.user_id;
    const {
      product_name,
      price,
      stock,
      brand_id,
      color_id,
      conditions,
      description,
      // user_id,
    } = body;

    // if (!images)
    //   return reject({ status: 500, msg: "Field Image cant be empty" });

    const addProductQuery =
      "insert into products(product_name, price, user_id, stock, brand_id, color_id, conditions, description, created_at, updated_at) values($1, $2, $3, $4, $5, $6, $7, $8, to_timestamp($9), to_timestamp($10)) returning *";
    const addProductValues = [
      product_name,
      price,
      userId,
      // user_id,
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

const getDetailsById = (req) => {
  return new Promise((resolve, reject) => {});
};

const searchProducts = (req) => {
  return new Promise((resolve, reject) => {
    const {
      search,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      colorId,
      sort,
      page,
      limit,
    } = req.query;

    let link = "";
    let countQuery =
      "select count(distinct p.id) count from products p join brands b on b.id = p.brand_id join product_categories pc on pc.product_id = p.id join categories c on c.id = pc.category_id join product_colors pc2 on pc2.id = p.color_id ";
    let searchQuery =
      "select p.id, p.product_name, p.price, (select images from product_images where product_id = p.id limit 1) as image from products p join brands b on b.id = p.brand_id join product_categories pc on pc.product_id = p.id join categories c on c.id = pc.category_id join product_colors pc2 on pc2.id = p.color_id ";

    let checkWhere = true;
    if (search) {
      link += `search=${search}&`;
      countQuery += `${
        checkWhere ? "WHERE" : "AND"
      } lower(p.product_name) like lower('%${search}%') `;
      searchQuery += `${
        checkWhere ? "WHERE" : "AND"
      } lower(p.product_name) like lower('%${search}%') `;
      checkWhere = false;
    }
    if (categoryId) {
      link += `categoryId=${categoryId}&`;
      countQuery += `${
        checkWhere ? "WHERE" : "AND"
      } pc.category_id = ${categoryId} `;
      searchQuery += `${
        checkWhere ? "WHERE" : "AND"
      } pc.category_id = ${categoryId} `;
      checkWhere = false;
    }
    if (brandId) {
      link += `brandId=${brandId}&`;
      countQuery += `${checkWhere ? "WHERE" : "AND"} b.id = ${brandId} `;
      searchQuery += `${checkWhere ? "WHERE" : "AND"} b.id = ${brandId} `;
      checkWhere = false;
    }

    if (colorId) {
      link += `colorId=${colorId}&`;
      countQuery += `${checkWhere ? "WHERE" : "AND"} pc2.id = ${colorId} `;
      searchQuery += `${checkWhere ? "WHERE" : "AND"} pc2.id = ${colorId} `;
      checkWhere = false;
    }

    if (minPrice && maxPrice) {
      link += `minPrice=${minPrice}&maxPrice=${maxPrice}&`;
      countQuery += `${
        checkWhere ? "WHERE" : "AND"
      } p.price between ${minPrice} and ${maxPrice} `;
      searchQuery += `${
        checkWhere ? "WHERE" : "AND"
      } p.price between ${minPrice} and ${maxPrice} `;
      checkWhere = false;
    }
    if (!minPrice && maxPrice) {
      link += `maxPrice=${maxPrice}&`;
      countQuery += `${checkWhere ? "WHERE" : "AND"} p.price <= ${maxPrice} `;
      searchQuery += `${checkWhere ? "WHERE" : "AND"} p.price <= ${maxPrice} `;
      checkWhere = false;
    }
    if (minPrice && !maxPrice) {
      link += `minPrice=${minPrice}&`;
      countQuery += `${checkWhere ? "WHERE" : "AND"} p.price >= ${minPrice} `;
      searchQuery += `${checkWhere ? "WHERE" : "AND"} p.price >= ${minPrice} `;
      checkWhere = false;
    }
    searchQuery += "group by p.id ";
    if (sort) {
      if (sort.toLowerCase() === "newest") {
        link += "sort=newest&";
        searchQuery += "order by p.created_at desc ";
      }
      if (sort.toLowerCase() === "oldest") {
        link += "sort=oldest&";
        searchQuery += "order by p.created_at asc ";
      }
      if (sort.toLowerCase() === "cheapest") {
        link += "sort=cheapest&";
        searchQuery += "order by p.price asc ";
      }
      if (sort.toLowerCase() === "priciest") {
        link += "sort=priciest&";
        searchQuery += "order by p.created_at desc ";
      }
    }
    searchQuery += "limit $1 offset $2";
    db.query(countQuery, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length === 0)
        return reject({ status: 404, msg: "Product not found" });

      const totalData = parseInt(result.rows[0].count);
      const sqlLimit = limit ? parseInt(limit) : 20;
      const sqlOffset =
        !page || page === "1" ? 0 : (parseInt(page) - 1) * sqlLimit;

      const currentPage = parseInt(page) || 1;
      const totalPage =
        sqlLimit > totalData ? 1 : Math.ceil(totalData / sqlLimit);

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

      console.log(countQuery);
      db.query(searchQuery, [sqlLimit, sqlOffset], (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        return resolve({
          status: 200,
          msg: "list Product",
          data: result.rows,
          meta,
        });
      });
    });
  });
};
const productsRepo = {
  createProduct,
  searchProducts,
};

module.exports = productsRepo;
