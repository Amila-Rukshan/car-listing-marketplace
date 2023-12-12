const express = require("express");
const compression = require("compression");
const cors = require("cors");
const morgan = require("morgan");
const { StatusCodes } = require("http-status-codes");

const { databaseMiddleware } = require("./middleware/database");
const { authenticated } = require("./middleware/authn");
const { authorized } = require("./middleware/authz");
const { generate_access_token } = require("./utils/auth");
const { getFormattedDate } = require("./utils/date");
const {
  ROLES,
  USER_ROLE,
  ADMIN_ROLE,
  SUPER_ADMIN_ROLE,
} = require("./config/consts/role");
const routes = require("./routes/v1");

const app = express();

app.use(morgan("combined"));
app.use(databaseMiddleware);
app.use(express.json());
app.use(compression());
app.use(cors());
app.options("*", cors());

app.get("/", (req, res) => res.json({ message: "Welcome to Car Rental API" }));

// register user
app.post("/register", (req, res) => {
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
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                  message: "Internal server error",
                });
                return;
              }
            }
          );
        }
        req.db.release();
        res.status(StatusCodes.OK).send({
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
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
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
            res.status(StatusCodes.CONFLICT).send({
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
                res.status(StatusCodes.CONFLICT).send({
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
                      res.status(StatusCodes.CONFLICT).send({
                        message: "Conflict error 2",
                      });
                    });
                    req.db.release();
                    return;
                  }

                  req.db.commit((err) => {
                    if (err) {
                      req.db.rollback(() => {
                        res.status(StatusCodes.CONFLICT).send({
                          message: "Conflict error 3",
                        });
                      });
                      req.db.release();
                      return;
                    }

                    res.status(StatusCodes.OK).send({
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
              res.status(StatusCodes.CONFLICT).send({
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
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          message: "Internal server error",
        });
        req.db.release();
        return;
      }
      if (results.affectedRows === 0) {
        res.status(StatusCodes.FORBIDDEN).send({
          message: "Booking cannot be cancelled.",
        });
        req.db.release();
        return;
      }
      res.status(StatusCodes.OK).send({
        message: "Booking cancelled successfully!",
      });
      req.db.release();
    }
  );
});

// search with make/model/year/mileage need index
// we should partition to make this performant
// filter input will look like
// {
//   filter: {
//     make: "Mazda",
//     model: "Rx-8",
//     year: {
//       start: 2005,
//       end: 2022,
//     },
//     milage: {
//       start: 0,
//       end: 10000,
//     },
//     price: {
//       start: 20000,
//       end: 30000,
//     },
//   },
//   metadata: {
//     limit: 2,
//     page: 4,
//   },
// }
app.get("/search", authenticated, authorized(USER_ROLE), (req, res) => {
  let limit =
    req.body.metadata && req.body.metadata.limit
      ? parseInt(req.body.metadata.limit)
      : 10; // Default limit is 10
  let page =
    req.body.metadata && req.body.metadata.page
      ? parseInt(req.body.metadata.page)
      : 1; // Default page is 1
  let offset = (page - 1) * limit;

  let filters = [];
  if (req.body.filter && req.body.filter.make) {
    filters.push(`make = ${req.db.escape(req.body.filter.make)}`);
  }
  if (req.body.filter && req.body.filter.model) {
    filters.push(`model = ${req.db.escape(req.body.filter.model)}`);
  }
  if (req.body.filter && req.body.filter.year) {
    filters.push(
      `year BETWEEN ${req.db.escape(
        req.body.filter.year.start
      )} AND ${req.db.escape(req.body.filter.year.end)}`
    );
  }
  if (req.body.filter && req.body.filter.mileage) {
    filters.push(
      `mileage BETWEEN ${req.db.escape(
        req.body.filter.mileage.start
      )} AND ${req.db.escape(req.body.filter.mileage.end)}`
    );
  }
  if (req.body.filter && req.body.filter.price) {
    filters.push(
      `price BETWEEN ${req.db.escape(
        req.body.filter.price.start
      )} AND ${req.db.escape(req.body.filter.price.end)}`
    );
  }

  let filterQuery =
    filters.length > 0 ? ` WHERE ${filters.join(" AND ")} ` : "";

  let sql = `
      SELECT filtered_car.id, filtered_car.make, filtered_car.model, filtered_car.year, filtered_car.mileage, filtered_car.price, 
      JSON_ARRAYAGG(JSON_OBJECT('start', booking.start_time, 'end', booking.end_time)) AS booked_times 
      FROM (
        SELECT * FROM car
        ${filterQuery}
      ) AS filtered_car
      LEFT JOIN booking ON filtered_car.id = booking.car_id 
      GROUP BY filtered_car.id
      LIMIT ${limit} OFFSET ${offset}
    `;

  req.db.query(sql, (err, rows) => {
    req.db.release();
    if (err) {
      console.error(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Database error");
      return;
    }
    rows.forEach((row) => {
      row.booked_times = JSON.parse(row.booked_times);
    });
    res.status(StatusCodes.OK).send({ data: rows });
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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
