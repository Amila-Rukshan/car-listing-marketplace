const ROLES = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  USER: 3,
};

const SUPER_ADMIN_ROLE = "super-admin";
const ADMIN_ROLE = "admin";
const USER_ROLE = "user";

const INVERSE_ROLES = {
  1: SUPER_ADMIN_ROLE,
  2: ADMIN_ROLE,
  3: USER_ROLE,
};

module.exports = {
  ROLES,
  SUPER_ADMIN_ROLE,
  ADMIN_ROLE,
  USER_ROLE,
  INVERSE_ROLES,
};
