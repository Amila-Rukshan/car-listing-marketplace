const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");
const {v4: uuid4} = require("uuid");
const { ROLES } = require("../config/consts/role");
const { generate_access_token } = require("../utils/auth");

const register = (req, res) => {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(req.body.password, salt, function (err, password_hash) {
      if (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          message: "Error hashing password",
        });
        return;
      }
      req.db.query(
        "INSERT INTO user (id, username, email, password_hash, role_id) VALUES (?, ?, ?, ?, ?)",
        [uuid4(), req.body.username, req.body.email, password_hash, ROLES.USER],
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
    });
  });
};

const login = (req, res) => {
  req.db.query(
    "SELECT * FROM user WHERE email = ?",
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

      if (rows.length > 0) {
        const user = rows[0];
        bcrypt.compare(
          req.body.password,
          user.password_hash,
          function (err, result) {
            if (result == true) {
              const access_token = generate_access_token(rows[0]);
              res.status(StatusCodes.OK).send({
                access_token,
              });
            } else {
              res.status(StatusCodes.NOT_FOUND).send({
                message: "Incorrect email/password!",
              });
            }
          }
        );
      } else {
        res.status(StatusCodes.NOT_FOUND).send({
          message: "Incorrect email/password!!",
        });
      }
    }
  );
};

module.exports = {
  register,
  login,
};
