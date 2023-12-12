const { StatusCodes } = require("http-status-codes");

module.exports.authorized = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(StatusCodes.FORBIDDEN).send({ message: "Unauthorized" });
    return;
  }
  next();
};
