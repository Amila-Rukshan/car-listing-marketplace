const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit : 5,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ,
  user: "user",
  password: "",
  database: "car-listing-marketplace",
});

module.exports.databaseMiddleware = (req, res, next) => {
    pool.getConnection((err, connection) => {
      if (err) {
        next(err);
        return;
      }
      req.db = connection;
      next();
    });
}
