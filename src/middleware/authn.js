const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

module.exports.authenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
      if (err) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .send({ message: "Invalid token" });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(StatusCodes.UNAUTHORIZED).send({ message: "Unauthorized" });
  }
};
