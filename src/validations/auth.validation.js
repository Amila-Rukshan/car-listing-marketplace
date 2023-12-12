const Joi = require('joi');
const { password } = require('./custom.validation');

const registerValidationSchema = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    username: Joi.string().required(),
  }),
};

const loginValidationSchema = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

module.exports = {
  loginValidationSchema,
  registerValidationSchema,
};
