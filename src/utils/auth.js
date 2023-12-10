const jwt = require("jsonwebtoken");
const { INVERSE_ROLES } = require("../consts/role");

// move to config env
const secret = "your-secret-key";

module.exports.generate_access_token = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: INVERSE_ROLES[user.role_id],
    },
    secret,
    {
      expiresIn: "1h",
      subject: user.username,
      issuer: "car-rental.com",
      audience: "car-rental.com",
    }
  );
