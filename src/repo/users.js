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

const getProfileId = (payload) => {
  return new Promise((resolve, reject) => {
    const { roles_id, user_id } = payload;
    let query = ""
    if (parseInt(roles_id) === 1) {
      return query =
        "select display_name,address,gender,images from customers where users_id = $1 and deleted_at = null";
    }
    if (parseInt(roles_id) === 2) {
      return query =
        "select display_name,address,gender,images,store_name,store_desc from sellers where users_id = $1 and deleted_at = null";
      }
        postgreDB.query(query, [user_id], (error, result) => {
          if (error) {
            console.log(error);
            return reject({ status: 500, msg: "Internal Server Error" });
          }
          resolve({ status: 201,
            msg: "Your account created successfully",
            data: { ...result.rows[0] },}
           )
      })});
    }

const usersRepo = {
  register,
  getProfileId,
};

module.exports = usersRepo;
