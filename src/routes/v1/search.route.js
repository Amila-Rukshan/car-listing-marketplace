const express = require("express");
const router = express.Router();

const {
  searchValidationSchema,
} = require("../../validations/search.validation");
const validate = require("../../middleware/validate");
const { databaseMiddleware } = require("../../middleware/database");
const { USER_ROLE } = require("../../config/consts/role");
const searchController = require("../../controllers/search.controller");
const { authenticated } = require("../../middleware/authn");
const { authorized } = require("../../middleware/authz");

router.get(
  "/",
  authenticated,
  authorized(USER_ROLE),
  validate(searchValidationSchema),
  databaseMiddleware,
  searchController.search
);

module.exports = router;
