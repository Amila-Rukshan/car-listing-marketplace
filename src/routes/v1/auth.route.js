const express = require("express");
const router = express.Router();

const validate = require("../../middleware/validate");
const { databaseMiddleware } = require("../../middleware/database");

const {
  loginValidationSchema,
  registerValidationSchema,
} = require("../../validations/auth.validation");
const authController = require("../../controllers/auth.controller");

router.post("/register", validate(registerValidationSchema), databaseMiddleware, authController.register);
router.post("/login", validate(loginValidationSchema), databaseMiddleware, authController.login);

module.exports = router;
