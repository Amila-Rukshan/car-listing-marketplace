const { StatusCodes } = require("http-status-codes");
const { ROLES } = require("../config/consts/role");
const { generate_access_token } = require("../utils/auth");

const register = (req, res) => {
  req.db.query(
    "INSERT INTO user (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)",
    [req.body.username, req.body.email, req.body.password, ROLES.USER],
    (err, result) => {
      req.db.release();
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          res.status(StatusCodes.CONFLICT).send({
            message: "Usename/email already exists!!",
          });
          return;
        } else {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            message: "Internal server error",
          });
        }
        return;
      }
      res.status(StatusCodes.OK).send({
        message: "User registered successfully!",
      });
    }
  );
};

const login = (req, res) => {
  req.db.query(
    "SELECT * FROM user WHERE email = ? AND password_hash = ?",
    [req.body.email, req.body.password],
    (err, rows) => {
      req.db.release();
      if (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          message: "Internal server error",
        });
        return;
      }
      if (rows.length === 0) {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .send({ message: "Invalid email or password" });
        return;
      }
      const access_token = generate_access_token(rows[0]);
      res.send({ access_token });
    }
  );
};

module.exports = {
  register,
  login,
};
