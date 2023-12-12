const { StatusCodes } = require("http-status-codes");

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
const search = (req, res) => {
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
};

module.exports = {
  search,
};
