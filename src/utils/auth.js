const jwt = require("jsonwebtoken");
const { INVERSE_ROLES } = require("../config/consts/role");

module.exports.generate_access_token = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: INVERSE_ROLES[user.role_id],
    },
    process.env.JWT_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
      subject: user.username,
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    }
  );
