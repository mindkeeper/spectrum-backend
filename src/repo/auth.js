const postgreDb = require("../config/postgre");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = (body) => {
  return new Promise((resolve, reject) => {
    const { email, password } = body;

    const getCridentialsQuery =
      "select id, email, password, roles_id from users where email = $1";
    postgreDb.query(getCridentialsQuery, [email], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length === 0)
        return reject({ status: 401, msg: "Email/Password is wrong" });

      const hashedPassword = result.rows[0].password;
      bcrypt.compare(password, hashedPassword, (error, isSame) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        if (!isSame)
          return reject({ status: 401, msg: "Email/Password is wrong" });

        const payload = {
          user_id: result.rows[0].id,
          email: result.rows[0].email,
          roles_id: result.rows[0].roles_id,
        };
        jwt.sign(
          payload,
          process.env.SECRET_KEY,
          {
            expiresIn: "60m",
            issuer: process.env.ISSUER,
          },
          (error, token) => {
            if (error) {
              console.log(error);
              return reject({ status: 500, msg: "Internal Server Error" });
            }
            const inserTokenQuery =
              "insert into whitelist_token (token) values ($1) ";
            postgreDb.query(inserTokenQuery, [token], (error, result) => {
              if (error) {
                console.log(error);
                return reject({ status: 500, msg: "Internal Server Error" });
              }
              return resolve({
                status: 200,
                msg: "Login Successfull",
                data: { token, ...payload },
              });
            });
          }
        );
      });
    });
  });
};

const deleteWhitelistToken = (token) => {
  return new Promise((resolve, reject) => {
    const query = "delete from whitelist_token where token = $1";
    postgreDb.query(query, [token], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      console.log(query, result.rowCount);
      return resolve({ status: 200, msg: "Logout Successfull" });
    });
  });
};

const checkWhitelistToken = (token) => {
  return new Promise((resolve, reject) => {
    const query = "select * from whitelist_token where token = $1";
    postgreDb.query(query, [token], (error, result) => {
      if (error) {
        console.log(error);
        return reject(error);
      }
      resolve(result);
    });
  });
};

const authRepo = {
  login,
  deleteWhitelistToken,
  checkWhitelistToken,
};

module.exports = authRepo;
