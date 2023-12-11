const express = require("express");
const compression = require("compression");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const secret = "your-secret-key";

const { databaseMiddleware } = require("./middleware/database");
const { authenticated } = require("./middleware/authn");
const { authorized } = require("./middleware/authz");
const { generate_access_token } = require("./utils/auth");
const { getFormattedDate } = require("./utils/date");
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

const SUPER_ADMIN_ROLE = "super-admin";
const ADMIN_ROLE = "admin";
const USER_ROLE = "user";

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
      const access_token = generate_access_token(rows[0]);
      res.send({ access_token });
    }
  );
});

// post car, check role of admin / super admin
app.post(
  "/car",
  authenticated,
  authorized(SUPER_ADMIN_ROLE, ADMIN_ROLE),
  (req, res) => {
    req.db.query(
      "INSERT INTO car (make, model, year, mileage, price, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        req.body.make,
        req.body.model,
        req.body.year,
        req.body.mileage,
        req.body.price,
        req.body.description,
        req.body.image_url,
      ],
      (err, result) => {
        if (err) {
          req.db.release();
          console.error(err);
          res.status(500).send({
            message: "Internal server error",
          });
          return;
        }
        // insert this car into car_time_slot_lock table with 1 hour time slot the next day (should be configurable)
        let carId = result.insertId;
        // set start time to next day start time for the next day 00:00:00
        let currentTime = new Date();
        currentTime.setDate(currentTime.getDate() + 1);
        currentTime.setHours(0, 0, 0, 0);
        let bookingSlotsEndTime = new Date();
        bookingSlotsEndTime.setDate(currentTime.getDate());
        bookingSlotsEndTime.setHours(24, 0, 0, 0);

        for (
          let timeSlot = new Date(currentTime);
          timeSlot < bookingSlotsEndTime;
          timeSlot.setHours(timeSlot.getHours() + 1)
        ) {
          let startTime = new Date(timeSlot);
          let endTime = new Date(timeSlot);
          endTime.setHours(endTime.getHours() + 1);

          req.db.query(
            "INSERT INTO car_time_slot_lock (car_id, start_time, end_time) VALUES (?, ?, ?)",
            [carId, startTime, endTime],
            (err, result) => {
              if (err) {
                req.db.release();
                console.error(err);
                res.status(500).send({
                  message: "Internal server error",
                });
                return;
              }
            }
          );
        }
        req.db.release();
        res.status(200).send({
          message: "Car posted successfully!",
        });
      }
    );
  }
);

// book car / need to do transaction with serializable isolation level (enable 2PL) and test
// check role of user
// {
//   "car_id": 1,
//   "start_time": "2020-01-01 12:00:00",
//   "end_time": "2020-01-02 01:00:00"
// }
app.post("/book", authenticated, authorized(USER_ROLE), (req, res) => {
  // insert a booking after checking if the car is not booked for the same slot
  req.db.beginTransaction((err) => {
    if (err) {
      console.error(err);
      res.status(500).send({
        message: "Internal server error 1",
      });
      req.db.release();
      return;
    }

    // lock the time slots (materialized locking is used) before checking if the car is available to avoid double booking
    req.db.query(
      "SELECT * FROM car_time_slot_lock WHERE car_id = ? AND start_time >= ? AND end_time <= ? FOR UPDATE",
      [req.body.car_id, req.body.start_time, req.body.end_time],
      (err, results) => {
        if (err) {
          req.db.rollback(() => {
            res.status(409).send({
              message: "Conflict error 0",
            });
          });
          req.db.release();
          return;
        }

        // check if the car is available for the given time slot
        req.db.query(
          "SELECT * FROM booking WHERE car_id = ? AND end_time > ? AND start_time < ?",
          [req.body.car_id, req.body.start_time, req.body.end_time],
          (err, results) => {
            if (err) {
              req.db.rollback(() => {
                res.status(409).send({
                  message: "Conflict error 1",
                });
              });
              req.db.release();
              return;
            }
            if (results.length === 0) {
              req.db.query(
                "INSERT INTO booking (car_id, user_id, start_time, end_time, created_at) VALUES (?, ?, ?, ?, ?)",
                [
                  req.body.car_id,
                  req.user.id,
                  req.body.start_time,
                  req.body.end_time,
                  new Date(),
                ],
                (err, results) => {
                  if (err) {
                    req.db.rollback(() => {
                      res.status(409).send({
                        message: "Conflict error 2",
                      });
                    });
                    req.db.release();
                    return;
                  }

                  req.db.commit((err) => {
                    if (err) {
                      req.db.rollback(() => {
                        res.status(409).send({
                          message: "Conflict error 3",
                        });
                      });
                      req.db.release();
                      return;
                    }

                    res.status(200).send({
                      message: "Booking is sucessful!",
                      data: {
                        bookingId: results.insertId,
                      },
                    });
                    req.db.release();
                  });
                }
              );
            } else {
              res.status(400).send({
                message:
                  "Booking cannot be placed due to already existing bookings.",
              });
              req.db.release();
            }
          }
        );
      }
    );
  });
});

// cancel booking, need to check within 24 hours
app.delete("/book", authenticated, authorized(USER_ROLE), (req, res) => {
  req.db.query(
    "DELETE FROM booking WHERE id = ? AND user_id = ? AND DATE_ADD(created_at, INTERVAL 24 HOUR) < ?",
    [req.body.booking_id, req.user.id, getFormattedDate(new Date())],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send({
          message: "Internal server error",
        });
        req.db.release();
        return;
      }
      if (results.affectedRows === 0) {
        res.status(400).send({
          message: "Booking cannot be cancelled.",
        });
        req.db.release();
        return;
      }
      res.status(200).send({
        message: "Booking cancelled successfully!",
      });
      req.db.release();
    }
  );
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
app.get(
  "/users",
  authenticated,
  authorized(SUPER_ADMIN_ROLE, ADMIN_ROLE),
  (req, res) => {
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
  }
);

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
