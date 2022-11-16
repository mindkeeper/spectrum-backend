const postgreDB = require("../config/postgre");
const bcrypt = require("bcrypt");

const createUsers = (body) => {
  return new Promise((resolve, reject) => {
    const { email, password, roles_id } = body;
    const queryCheckEmail = "select email from users where email = $1";
    postgreDB.query(queryCheckEmail, [email], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length > 0) {
        const errorMessage = [];
        if (result.rows[0].email == email)
          errorMessage.push(403, "Email already exist");
        return reject({
          status: errorMessage[0],
          msg: errorMessage[1],
        });
      }
      const timestamp = Date.now() / 1000;
      const query =
        "insert into users(email,password,roles_id,created_at,updated_at) values($1,$2,$3,to_timestamp($4),to_timestamp($5)) returning id";
      bcrypt.hash(password, 15, (err, hash) => {
        if (err) {
          console.log(err);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        postgreDB.query(
          query,
          [email, hash, roles_id, timestamp, timestamp],
          (err, result) => {
            if (err) {
              console.log(err);
              return reject({ status: 500, msg: "Internal Server Error" });}
            const id = result.rows[0].id;
            if (roles_id === 1) {
              const queryAddId =
                "insert into customers(user_id,created_at,updated_at) values($1,to_timestamp($2),to_timestamp($3))";
              postgreDB.query(
                queryAddId,
                [id, timestamp, timestamp],
                (err, result) => {
                  if (err) {
                    console.log(err);
                    return reject({
                      status: 500,
                      msg: "Internal Server Error",
                    });
                  }
                  return resolve(result);
                }
              );
            }
            if (roles_id === 2) {
              const queryAddId = `insert into sellers(user_id,created_at,updated_at) values($1,to_timestamp($2),to_timestamp($3))`;
              postgreDB.query(
                queryAddId,
                [id, timestamp, timestamp],
                (err, result) => {
                  if (err) {
                    console.log(err);
                    return reject({
                      status: 500,
                      msg: "Internal Server Error",
                    });
                  }
                  return resolve(result);
                }
              );
            }
          }
        );
      });
    });
  });
};

const usersRepo = {
  createUsers,
};

module.exports = usersRepo;
