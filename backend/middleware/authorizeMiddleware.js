const authMiddleware = require("./authMiddleware");

module.exports = {
  authMiddleware,
  authenticate: authMiddleware,
};
