const { StatusCodes } = require("http-status-codes");
const {v4: uuid4} = require("uuid");

const { getFormattedDate } = require("../utils/date");

// book car / need to do transaction with serializable isolation level (enable 2PL) and test
// check role of user
// {
//   "car_id": 1,
//   "start_time": "2020-01-01 12:00:00",
//   "end_time": "2020-01-02 01:00:00"
// }
const place = (req, res) => {
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
              const bookingId = uuid4();
              req.db.query(
                "INSERT INTO booking (id, car_id, user_id, start_time, end_time, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                [
                  bookingId,
                  req.body.car_id,
                  req.user.id,
                  req.body.start_time,
                  req.body.end_time,
                  new Date(),
                ],
                (err, results) => {
                  if (err) {
                    req.db.rollback(() => {
                      req.db.release();
                      res.status(StatusCodes.CONFLICT).send({
                        message: "Conflict error 2",
                      });
                    });
                    return;
                  }

                  req.db.commit((err) => {
                    if (err) {
                      req.db.rollback(() => {
                        req.db.release();
                        res.status(StatusCodes.CONFLICT).send({
                          message: "Conflict error 3",
                        });
                      });
                      return;
                    }

                    req.db.release();
                    res.status(StatusCodes.OK).send({
                      message: "Booking is sucessful!",
                      data: {
                        bookingId: bookingId,
                      },
                    });
                  });
                }
              );
            } else {
              req.db.release();
              res.status(StatusCodes.CONFLICT).send({
                message:
                  "Booking cannot be placed due to already existing bookings.",
              });
            }
          }
        );
      }
    );
  });
};

// cancel booking, need to check within 24 hours
const cancel = (req, res) => {
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
};

module.exports = {
  place,
  cancel,
};
