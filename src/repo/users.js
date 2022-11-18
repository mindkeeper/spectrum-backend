const postgreDB = require("../config/postgre");
const bcrypt = require("bcrypt");

const register = (body) => {
  return new Promise((resolve, reject) => {
    const { email, password, roles } = body;
    const timeStamp = Date.now() / 1000;
    const checkEmailQuery = "select email from users where email = $1";

    postgreDB.query(checkEmailQuery, [email], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length > 0)
        return reject({ status: 403, msg: "Email Already Exist" });

      bcrypt.hash(password, 10, (error, hashedPwd) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        const createUserQuery =
          "insert into users(email, password, roles_id, created_at, updated_at) values ($1, $2, $3, to_timestamp($4), to_timestamp($5)) returning id";

        postgreDB.query(
          createUserQuery,
          [email, hashedPwd, parseInt(roles), timeStamp, timeStamp],
          (error, result) => {
            if (error) {
              console.log(error);
              return reject({ status: 500, msg: "Internal Server Error" });
            }
            const id = result.rows[0].id;
            let createProfileQuery = "";
            if (parseInt(roles) === 1)
              createProfileQuery =
                "insert into customers(user_id, created_at, updated_at) values($1, to_timestamp($2), to_timestamp($3)) returning *";
            if (parseInt(roles) === 2)
              createProfileQuery =
                "insert into sellers(user_id, created_at, updated_at) values($1, to_timestamp($2), to_timestamp($3)) returning *";
            console.log(parseInt(roles), id, createProfileQuery);
            postgreDB.query(
              createProfileQuery,
              [id, timeStamp, timeStamp],
              (error, result) => {
                if (error) {
                  console.log(error);
                  return reject({ status: 500, msg: "Internal Server Error" });
                }
                return resolve({
                  status: 201,
                  msg: "Your account created successfully",
                  data: { ...result.rows[0] },
                });
              }
            );
          }
        );
      });
    });
  });
};

const getProfile = (id, role) => {
  return new Promise((resolve, reject) => {
    let query = "";
    console.log(id);
    if (parseInt(role) === 1)
      query =
        "select c.display_name, c.gender, c.address, c.image, u.email, r.role from customers c join users u on u.id = c.user_id join roles r on r.id = u.roles_id where c.user_id = $1 and c.deleted_at is null";
    if (parseInt(role) === 2)
      query =
        "select s.display_name, s.gender, s.address, s.image, s.store_name, s.store_desc, u.email, r.role from sellers s join users u on u.id = s.user_id join roles r on r.id = u.roles_id where s.user_id = $1 and s.deleted_at is null";
    console.log(query);
    postgreDB.query(query, [id], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      return resolve({
        status: 200,
        msg: "Profile Details",
        data: { ...result.rows[0] },
      });
    });
  });
};

const editProfile = (id, role, body, file) => {
  return new Promise((resolve, reject) => {

    const timeStamp = Date.now() / 1000;
    const values = [];
    let query = "";
    if (parseInt(role) === 1) query = "update customers set ";
    if (parseInt(role) === 2) query = "update sellers set ";

    let imageUrl = "";
    if (file) {
      imageUrl = `${file.url} `;
      if (Object.keys(body).length > 0) {
        query += `image = '${imageUrl}', `;
      }
      if (Object.keys(body).length === 0) {
        query += `image = '${imageUrl}', updated_at = to_timestamp($1) where user_id = $2 returning display_name`;
        values.push(timeStamp, id);
      }
    }

    Object.keys(body).forEach((key, idx, array) => {
      if (idx === array.length - 1) {
        query += ` ${key} = $${idx + 1} where user_id = $${idx + 2} returning display_name`;
        values.push(body[key], id);
        return;
      }
      query += `${key} = $${idx + 1},`;
      values.push(body[key]);
    });
    postgreDB.query(query, values, (err, result) => {
      if (err) {
        console.log(query, values, file);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      console.log(values, query);
      console.log(result);
      let data = {};
      if (file) data = { Image: imageUrl, ...result.rows[0]  };
      data = { Image: imageUrl, ...result.rows[0] }
      return resolve({
        status: 200,
        msg: `${result.rows[0].display_name} Your profile has been updated`,
        data,
        
      });
    });
  });
};

const updateUser = (id, body, file) => {
  return new Promise((resolve, reject) => {
    const timeStamp = Date.now() / 1000;
    const values = [];
    let query = "update customers set ";
    let imageUrl = "";
    if (file) {
      imageUrl = `${file.url} `;
      if (Object.keys(body).length > 0) {
        query += `image = '${imageUrl}', `;
      }
      if (Object.keys(body).length === 0) {
        query += `image = '${imageUrl}', updated_at = to_timestamp($1) where user_id = $2 returning display_name`;
        values.push(timeStamp, id);
      }
    }
    Object.keys(body).forEach((key, index, array) => {
      if (index === array.length - 1) {
        query += `${key} = $${index + 1}, updated_at = to_timestamp($${
          index + 2
        }) where user_id = $${index + 3} returning display_name`;
        values.push(body[key], timeStamp, id);
        return;
      }
      query += `${key} = $${index + 1}, `;
      values.push(body[key]);
    });
    console.log(query);
    db.query(query, values, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      let data = {};
      if (file) data = { Image: imageUrl, ...result.rows[0] };
      data = { Image: imageUrl, ...result.rows[0] };
      return resolve({
        status: 200,
        msg: `${result.rows[0].display_name}, your profile successfully updated`,
        data,
      });
    });
  });
};

const usersRepo = {
  register,
  getProfile,
  editProfile,
  updateUser,
};

module.exports = usersRepo;
