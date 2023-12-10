const express = require("express");
const compression = require("compression");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const secret = "your-secret-key";

const { databaseMiddleware } = require("./middleware/database");
const routes = require("./routes/v1");

const app = express();
const port = 3000;

app.use(databaseMiddleware);

app.use(express.json());

app.use(compression());

app.use(cors());
app.options("*", cors());

app.get("/", (req, res) => res.send("Hello World!\n"));

const ROLES = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  USER: 3,
};

const INVERSE_ROLES = {
  1: "super-admin",
  2: "admin",
  3: "user",
};

// register user
app.post("/register", (req, res) => {
  req.db.query(
    "INSERT INTO user (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)",
    [req.body.username, req.body.email, req.body.password, ROLES.USER],
    (err, result) => {
      req.db.release();
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          res.status(409).send({
            message: "Usename/email already exists!!",
          });
          return;
        } else {
          res.status(500).send({
            message: "Internal server error",
          });
        }
        return;
      }
      res.status(200).send({
        message: "User registered successfully!",
      });
    }
  );
});

// sign in user
app.post("/login", (req, res) => {
  req.db.query(
    "SELECT * FROM user WHERE email = ? AND password_hash = ?",
    [req.body.email, req.body.password],
    (err, rows) => {
      req.db.release();
      if (err) {
        console.error(err);
        res.status(500).send({
          message: "Internal server error",
        });
        return;
      }
      if (rows.length === 0) {
        res.status(401).send({ message: "Invalid email or password" });
        return;
      }
      const token = jwt.sign({ id: rows[0].id, email: rows[0].email }, secret);
      res.send({ token });
    }
  );
});

// add car, check role of admin / super admin
app.post("/car", (req, res) => {
  res.status(200).send({
    message: "OK",
  });
});

// book car / need to do transaction with serializable isolation level (enable 2PL) and test
// check role of user
app.post("/book?id=<car-id>", (req, res) => {
  res.status(200).send({
    message: "OK",
  });
});

// search with mode/model/year/milage need index, consider materialized view since join is expensive
// sample entry in search result
// {
//   "id": 1,
//   "model": "Toyota",
//   "mode": "Camry",
//   "year": 2019,
//   "milage": 10000,
//   "price": 10000,
//   "location": "San Francisco",
//   "booked-times": [
//      { start: "2020-01-01", end: "2020-01-02" },
//      { start: "2020-01-03", end: "2020-01-04" },
//   ]
// }
app.get("/search", (req, res) => {
  res.status(200).send({
    message: "OK",
  });
});

// get users from database
app.get("/users", (req, res) => {
  req.db.query("SELECT * FROM user", (err, rows) => {
    req.db.release();
    if (err) {
      // Log the error
      console.error(err);
      res.status(500).send("Database error");
      return;
    }
    res.send(rows);
  });
});

// gracefully shutdown database connection pool when app is terminated
process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  console.log("Closing http server.");
  app.close(() => {
    console.log("Http server closed.");
    req.db.end((err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log("Database connection pool closed.");
      process.exit(0);
    });
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
