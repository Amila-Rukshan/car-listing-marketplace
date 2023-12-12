const Joi = require("joi");

const searchValidationSchema = {
  body: Joi.object({
    filter: Joi.object({
      make: Joi.string(),
      model: Joi.string(),
      year: Joi.object({
        start: Joi.number().integer().min(1886),
        end: Joi.number().integer().min(Joi.ref("start")),
      }),
      milage: Joi.object({
        start: Joi.number().min(0),
        end: Joi.number().min(Joi.ref("start")),
      }),
      price: Joi.object({
        start: Joi.number().min(0),
        end: Joi.number().min(Joi.ref("start")),
      }),
    }),
    metadata: Joi.object({
      limit: Joi.number().integer().min(1),
      page: Joi.number().integer().min(1),
    }),
  }),
};

module.exports = {
  searchValidationSchema,
};
