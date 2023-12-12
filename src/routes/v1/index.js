const express = require("express");
const authRoute = require("./auth.route");
const bookRoute = require("./book.route");
const carRoute = require("./car.route");
const searchRoute = require("./search.route")

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/book",
    route: bookRoute,
  },
  {
    path: "/car",
    route: carRoute,
  },
  {
    path: "/search",
    route: searchRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
