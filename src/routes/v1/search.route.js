const express = require("express");
const router = express.Router();

const { USER_ROLE } = require("../../config/consts/role");
const searchController = require("../../controllers/search.controller");
const { authenticated } = require("../../middleware/authn");
const { authorized } = require("../../middleware/authz");

router.get(
  "/",
  authenticated,
  authorized(USER_ROLE),
  searchController.search
);

module.exports = router;
