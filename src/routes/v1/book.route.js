const express = require("express");
const router = express.Router();

const validate = require("../../middleware/validate");
const { databaseMiddleware } = require("../../middleware/database");
const {
  placeBookingValidationSchema,
  cancelBookingValidationSchema,
} = require("../../validations/book.validation");
const { USER_ROLE } = require("../../config/consts/role");
const bookController = require("../../controllers/book.controller");
const { authenticated } = require("../../middleware/authn");
const { authorized } = require("../../middleware/authz");

router.post(
  "/place",
  authenticated,
  authorized(USER_ROLE),
  validate(placeBookingValidationSchema),
  databaseMiddleware,
  bookController.place
);
router.delete(
  "/cancel",
  authenticated,
  authorized(USER_ROLE),
  validate(cancelBookingValidationSchema),
  databaseMiddleware,
  bookController.cancel
);

module.exports = router;
