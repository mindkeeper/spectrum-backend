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
  return new Promise((resolve, reject) => {
    const productId = req.params.id;

    const productQuery =
      "select p.id, p.product_name, p.price, p.stock, p.conditions, p.description, s.display_name, s.store_name, s.store_desc, b.brand_name  from products p join sellers s on s.user_id = p.user_id join brands b on b.id = p.brand_id where p.id = $1";

    db.query(productQuery, [productId], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length === 0)
        return reject({ status: 404, msg: "Product not found" });

      let detailProduct = { ...result.rows[0] };

      const getCategoryQuery =
        "select c.category_name from categories c join product_categories pc on c.id = pc.category_id where pc.product_id = $1";
      db.query(getCategoryQuery, [productId], (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        const categories = result.rows;

        const category = [];
        categories.forEach((e) => category.push(e.category_name));
        detailProduct = { ...detailProduct, categories: category };

        const getImageQuery =
          "select images from product_images where  product_id = $1";
        db.query(getImageQuery, [productId], (error, result) => {
          if (error) {
            console.log(error);
            return reject({ status: 500, msg: "Internal Server Error" });
          }
          const imageResult = result.rows;

          const images = [];
          imageResult.forEach((image) => images.push(image.images));
          detailProduct = { ...detailProduct, images: images };
          return resolve({
            status: 200,
            msg: "Detail Product",
            data: detailProduct,
          });
        });
      });
    });
  });
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
    searchQuery += `${
      checkWhere ? "WHERE" : "AND"
    } p.deleted_at IS NULL AND p.stock != 0 group by p.id `;
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
        searchQuery += "order by p.price desc ";
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

const getRelatedProducts = (req) => {
  return new Promise((resolve, reject) => {
    const productId = req.params.id;
    const getBrandQuey = "select p.brand_id  from products p where p.id = $1";

    db.query(getBrandQuey, [productId], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      const brandId = result.rows[0].brand_id;
      const getCategoryQuery =
        "select pc.category_id from product_categories pc where pc.product_id = $1";

      db.query(getCategoryQuery, [productId], (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }

        const categoryResult = result.rows;
        const categories = [];
        categoryResult.forEach((category) =>
          categories.push(category.category_id)
        );
        const prepareValues = [parseInt(productId), brandId];
        let relatedQuery = `select distinct p.id, p.product_name, p.price, (select pi2.images from product_images pi2 where pi2.product_id = $1 limit 1) from products p
        join product_categories pc on pc.product_id = p.id
        join categories c on c.id  = pc.category_id
        where p.id != $1 and p.deleted_at is null and p.brand_id = $2 and c.id in (`;

        categories.forEach((e, index, array) => {
          if (index === array.length - 1) {
            relatedQuery += `$${index + 3}`;
            prepareValues.push(e);
          } else {
            relatedQuery += `$${index + 3}, `;
            prepareValues.push(e);
          }
        });
        relatedQuery += `) limit 9`;

        db.query(relatedQuery, prepareValues, (error, result) => {
          if (error) {
            console.log(error);
            return reject({ status: 500, msg: "Internal server error" });
          }
          if (result.rows.length === 0)
            return reject({ status: 404, msg: "Related Products not found" });
          return resolve({
            status: 200,
            msg: "Related Products",
            data: result.rows,
          });
        });
      });
    });
  });
};

const deleteProduct = (req) => {
  return new Promise((resolve, reject) => {
    const userId = req.userPayload.user_id;
    const productId = req.params.id;

    const timeStamp = Date.now() / 1000;
    const query =
      "update products set deleted_at = to_timestamp($1) where user_id = $2 and id = $3 returning *";
    db.query(query, [timeStamp, userId, productId], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      return resolve({
        status: 200,
        msg: "Product deleted",
        data: result.rows[0],
      });
    });
  });
};

const getSellerProducts = (req) => {
  return new Promise((resolve, reject) => {
    const { filter, page, limit } = req.query;
    const userId = req.userPayload.user_id;
    let link = "";
    let countQuery =
      "select count(p.id) as count from products p where user_id = $1 ";
    let query =
      "select p.id, p.product_name, p.price, p.stock, (select images from product_images where product_id = p.id limit 1) as image from products p where user_id = $1 ";

    if (filter) {
      if (filter.toLowerCase() === "archived") {
        countQuery += "AND p.deleted_at IS NOT NULL AND p.stock != 0 ";
        query += "AND p.deleted_at IS NOT NULL AND p.stock != 0 ";
        link += "filter=archived&";
      }
      if (filter.toLowerCase() === "sold-out") {
        countQuery += "AND p.stock = 0 ";
        query += "AND p.stock = 0 ";
        link += "filter=sold-out&";
      }
    }
    if (!filter) {
      countQuery += "AND p.deleted_at IS NULL ";
      query += "AND p.deleted_at IS NULL ";
    }
    query += "limit $2 offset $3";
    console.log(countQuery);
    db.query(countQuery, [userId], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (parseInt(result.rows[0].count) === 0)
        return reject({ status: 404, msg: "Product not found" });
      const totalData = parseInt(result.rows[0].count);
      const sqlLimit = limit ? parseInt(limit) : 5;
      const sqlOffset =
        !page || page == 1 ? 0 : (parseInt(page) - 1) * sqlLimit;
      const currentPage = page ? parseInt(page) : 1;
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
        totalData: parseInt(totalData),
        limit: parseInt(sqlLimit),
        prev,
        next,
      };
      db.query(query, [userId, sqlLimit, sqlOffset], (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal server error" });
        }
        return resolve({
          status: 200,
          msg: "Your Product List",
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
  getDetailsById,
  getRelatedProducts,
  deleteProduct,
  getSellerProducts,
};

module.exports = productsRepo;
