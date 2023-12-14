const Joi = require("joi");

const placeBookingValidationSchema = {
  body: Joi.object().keys({
    car_id: Joi.string().length(36).required(),
    start_time: Joi.date().greater(new Date()).required(),
    end_time: Joi.date().greater(Joi.ref("start_time")).required(),
  }),
};

const cancelBookingValidationSchema = {
  body: Joi.object().keys({
    booking_id: Joi.string().length(36).required(),
  }),
};

module.exports = {
  placeBookingValidationSchema,
  cancelBookingValidationSchema,
};
