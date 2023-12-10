module.exports.authorized = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(403).send({ message: "Unauthorized" });
    return;
  }
  next();
};
