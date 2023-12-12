const express = require("express");
const router = express.Router();

const validate = require("../../middleware/validate");
const {
  loginValidationSchema,
  registerValidationSchema,
} = require("../../validations/auth.validation");
const authController = require("../../controllers/auth.controller");

router.post("/register", validate(registerValidationSchema), authController.register);
router.post("/login", validate(loginValidationSchema), authController.login);

module.exports = router;
