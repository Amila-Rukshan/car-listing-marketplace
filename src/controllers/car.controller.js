const { StatusCodes } = require("http-status-codes");
const {v4: uuid4} = require("uuid");

// post car, check role of admin / super admin
const post = (req, res) => {
  const carId = uuid4();
  req.db.query(
    "INSERT INTO car (id, make, model, year, mileage, price, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      carId,
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
        console.error(err);
        res.status(500).send({
          message: "Internal server error",
        });
        return;
      }
      // insert this car into car_time_slot_lock table with 1 hour time slot the next day (should be configurable)
      // set start time to next day start time for the next day 00:00:00
      let currentTime = new Date();
      currentTime.setDate(currentTime.getDate() + 1);
      currentTime.setHours(0, 0, 0, 0);
      let bookingSlotsEndTime = new Date();
      bookingSlotsEndTime.setDate(currentTime.getDate());
      bookingSlotsEndTime.setHours(24, 0, 0, 0);

      let queryCount = 0;
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
            queryCount++;
            if (err) {
              console.error(err);
              if (!res.headersSent) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                  message: "Internal server error",
                });
              }
              return;
            } else if (queryCount === 24 && !res.headersSent) { // Assuming there are 24 time slots in a day
              req.db.release();
              res.status(StatusCodes.OK).send({
                message: "Car posted successfully!",
              });
            }
          }
        );
      }
    }
  );
};

module.exports = {
  post,
};
