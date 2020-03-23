const users = require('./express_server');

//Does email verification for register and login routing
const getUserByEmail = function(emailInput, database) {
  for (let userId in database) {
    if (database[userId].email === emailInput) {
      return userId;
    }
  }
};

module.exports = getUserByEmail;
