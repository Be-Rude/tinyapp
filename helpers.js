const users = require('./express_server');

const getUserByEmail = function(emailInput, database) {
  for (let userId in database) {
    if (database[userId].email === emailInput) {
      return userId;
    }
  }
};

module.exports = getUserByEmail;
