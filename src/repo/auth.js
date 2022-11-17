const postgreDb = require("../config/postgre");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const client = require("../config/redis");
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

const resetPassword = (body) => {
  return new Promise((resolve, reject) => {
    const { email, new_password, code } = body;

    if (email && !code && !new_password) {
      const getEmailQuery = "select email from users where email = $1";
      postgreDb.query(getEmailQuery, [email], (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        if (result.rows.length === 0)
          return reject({ status: 400, msg: "Your email isn't registered" });
        const otp = Math.floor(Math.random() * 1e6);

        client
          .get(email)
          .then((result) => {
            if (result)
              client
                .del(email)
                .then()
                .catch((error) => {
                  console.log(error);
                  return reject({ status: 500, msg: "Internal Server Error" });
                });

            client
              .set(email, otp, { EX: 120, NX: true })
              .then(() => resolve({ status: 200, data: { otp } }))
              .catch((error) => {
                console.log(error);
                return reject({ status: 500, msg: "Internal Server Error" });
              });
          })
          .catch((error) => {
            console.log(error);
            return reject({ status: 500, msg: "Internal Server Error" });
          });
      });
    }
    if (email && code && new_password) {
      const query =
        "update users set password = $1, updated_at=to_timestamp($2) where email = $3";
      const timeStamp = Date.now() / 1000;

      client
        .get(email)
        .then((userOtp) => {
          if (userOtp != code) return reject({ status: 401, msg: "Wrong OTP" });
          bcrypt.hash(new_password, 10, (error, hashedPwd) => {
            if (error) {
              console.log(error);
              return reject({ status: 500, msg: "Internal Server Error" });
            }
            postgreDb.query(
              query,
              [hashedPwd, timeStamp, email],
              (error, result) => {
                if (error) {
                  console.log(error);
                  return reject({ status: 500, msg: "Internal Server Error" });
                }
                client
                  .del(email)
                  .then(() =>
                    resolve({
                      status: 200,
                      msg: "Your password has been changed, plase login again!",
                    })
                  )
                  .catch((error) => {
                    console.log(error);
                    return reject({
                      status: 500,
                      msg: "Internal Server Error",
                    });
                  });
              }
            );
          });
        })
        .catch((error) => {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        });
    }
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
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      resolve(result);
    });
  });
};

const authRepo = {
  login,
  deleteWhitelistToken,
  checkWhitelistToken,
  resetPassword,
};

module.exports = authRepo;
