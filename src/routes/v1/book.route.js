const express = require("express");
const router = express.Router();

const { USER_ROLE } = require("../../config/consts/role");
const bookController = require("../../controllers/book.controller");
const { authenticated } = require("../../middleware/authn");
const { authorized } = require("../../middleware/authz");

router.post(
  "/place",
  authenticated,
  authorized(USER_ROLE),
  bookController.place
);
router.delete(
  "/cancel",
  authenticated,
  authorized(USER_ROLE),
  bookController.cancel
);

module.exports = router;
