const jwt = require("jsonwebtoken");

// move to config env
const secret = "your-secret-key";

module.exports.authenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.status(403).send({ message: "Invalid token" });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).sendStatus({ message: "Unanthicated"});
  }
};
