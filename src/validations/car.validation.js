const Joi = require("joi");

const carValidationSchema = {
  body: Joi.object().keys({
    make: Joi.string().required(),
    model: Joi.string().required(),
    year: Joi.number().integer().min(1886).required(),
    mileage: Joi.number().min(0).required(),
    price: Joi.number().min(0).required(),
    description: Joi.string().required(),
    image_url: Joi.string().uri().required(),
  }),
};

module.exports = {
  carValidationSchema,
};
