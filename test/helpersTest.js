const { assert } = require('chai');
const users = require('../express_server');

const getUserByEmail = require('../helpers.js');


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", users)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
});