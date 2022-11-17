// otorisasi cek apakah token ada ?
// const { checkWhitelistToken } = require("../repo/auth");
const db = require("../config/postgre");

const jwt = require("jsonwebtoken");
// const response = require("../helpers/response")
const resHelper = require("../helpers/sendResponse");

const isLogin = () => {
  return (req, res, next) => {
    const token = req.header("x-access-token");
    if (!token)
      return resHelper.error(res, 403, {
        status: 403,
        msg: "You have to login first",
      });

    const query = "select * from whitelist_token where token = $1";
    db.query(query, [token], (error, result) => {
      if (error) {
        console.log(error);
        return resHelper.error(res, 500, {
          status: 500,
          msg: "Internal Server Error",
        });
      }
      if (result.rows.length === 0)
        return resHelper.error(res, 403, {
          status: 403,
          msg: "You have to login first",
        });

      jwt.verify(token, process.env.SECRET_KEY, (error, decodedPayload) => {
        if (error) {
          console.log(error);
          return resHelper.error(res, 403, {
            status: 403,
            msg: "You have to login first",
          });
        }
        req.userPayload = decodedPayload;
        console.log(req.userPayload);
        next();
      });
    });
  };
};

// const isLogin = () => {
//   return async (req, res, next) => {
//     const token = req.header("x-access-token");
//     if (!token)
//       return resHelper.error(res, 403, {
//         status: 403,
//         msg: "You need to login first",
//       });
//     const checkToken = await checkWhitelistToken(token);
//     if (checkToken.rows.length === 0) {
//       return resHelper(res, 403, {
//         status: 403,
//         message: "You've been logged out, please log back in!",
//       });
//     }
//     //verifikasi
//     jwt.verify(
//       token,
//       process.env.SECRET_KEY,
//       { issuer: process.env.ISSUER },
//       (err, decodedPayload) => {
//         if (err) {
//           console.error(err);
//           return resHelper.error(res, 500, {
//             status: 500,
//             msg: "Internal Server Error",
//           });
//         }
//         console.log("-->", decodedPayload);
//         req.userPayload = decodedPayload;
//         next();
//       }
//     );
//   };
// };

module.exports = isLogin;
