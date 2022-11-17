const postgreDb = require("../config/postgre");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { token } = require("morgan");
const users = require("../repo/users");
const response = require("../helpers/sendResponse")
const resHelper = require("../helpers/sendResponse");


const login = (body) => {
    return new Promise((resolve, reject) => {
      const { email, password } = body;
     
      const getPasswordByEmailQuery =
        "select id, email, password, roles_id from users where email = $1";
      const getPasswordByEmailValues = [email];
      postgreDb.query(
        getPasswordByEmailQuery,
        getPasswordByEmailValues,
        (err, response) => {
          if (err) {
            console.error(err);
        
            return reject({ err });
            
          }
          if (response.rows.length === 0)
            return reject({
              err: new Error("Email or password is wrong"),
              statuscode: 401,
            });
         
          const hashedPassword = response.rows[0].password;
          bcrypt.compare(password, hashedPassword, (err, isSame) => {
            if (err) {
              console.error(err);
              return reject({ err });
            }
            if (!isSame)
              return reject({
                err: new Error("Email or password is wrong"),
                statusCode: 401,
              });
           
            const payload = {
              user_id: response.rows[0].id,
              email: response.rows[0].email,
              email,
              roles_id: response.rows[0].roles_id,
            };
            const token = jwt.sign(
              payload,
              process.env.secret_key,
              {
                expiresIn: "60m",
                issuer: process.env.issuer,
              },        
              (err, token) => {
                if (err) {
                  console.error(err);
                  return reject({ err });
                }
                return resolve(
                  { 
                  token,
                  email: payload.email,
                  id: payload.user_id,
                  roles_id: payload.roles_id,
                },
                users.insertWhitelistToken(token)
                );
              }, 
            );
            
          });
        }
      );
    });
  };

const logout = async (req, res) => {
  try {
    const token = req.header("x-access-token");
    console.log(token);
    await users.deleteWhitelistToken(token);
    // response(res, { status: 200, message: "Logout success" });
    resHelper.success(res, response.status, response);
  } catch (error) {
    console.log(error);
    // return response(res, {
    //   error,
    //   status: 500,
    //   message: "Internal server error",
    // });
    res.status(500).json({error, msg: "internal server error" });
    // resHelper.error(res, error.status, error);
  }
}


const authRepo = {
  login,
  logout
};

module.exports = authRepo;
