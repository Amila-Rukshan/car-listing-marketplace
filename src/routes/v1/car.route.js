const express = require("express");
const router = express.Router();

const { ADMIN_ROLE, SUPER_ADMIN_ROLE } = require("../../config/consts/role");
const carController = require("../../controllers/car.controller");
const { authenticated } = require("../../middleware/authn");
const { authorized } = require("../../middleware/authz");

router.post(
  "/",
  authenticated,
  authorized(ADMIN_ROLE, SUPER_ADMIN_ROLE),
  carController.post
);

module.exports = router;
