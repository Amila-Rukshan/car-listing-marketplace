const Joi = require("joi");
const { StatusCodes } = require("http-status-codes");

const validate = (schema) => (req, res, next) => {
  const object = Object.keys(schema).reduce((obj, key) => {
    if (req && req.hasOwnProperty(key)) {
      obj[key] = req[key];
    }
    return obj;
  }, {});
  const { value, error } = Joi.compile(schema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
    res.status(StatusCodes.BAD_REQUEST).send({ message: errorMessage });
    return;
  }
  return next();
};

module.exports = validate;
