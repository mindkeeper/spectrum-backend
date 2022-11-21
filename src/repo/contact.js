const postgreDB = require("../config/postgre");

const contactUs = (body) => {
  return new Promise((resolve, reject) => {
    const { name, email, website, business_plan, message } = body;
    const timeStamp = Date.now() / 1000;
    const query =
      "insert into contactus (name, email, website, business_plan, message,  created_at) values($1,$2,$3,$4,$5,to_timestamp($6))";
    postgreDB.query(
      query,
      [name, email, website, business_plan, message, timeStamp],
      (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        return resolve({
          status: 201,
          msg: "Added succesfully",
          data:  result.rows[0] ,
        })
        
      }
    );
  });
};

const promoRepo = {
    contactUs,
  };
  module.exports = promoRepo;
  