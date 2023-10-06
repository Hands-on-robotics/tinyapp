const { assert } = require('chai');

const { foundUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = foundUserByEmail("user@example.com", testUsers);
    const expectedUser = testUsers.userRandomID;
    
    assert.deepEqual(expectedUser, user);
  });

  it("should return undefined if email is not in the database", function() {
    const user = foundUserByEmail("DoNot@example.com", testUsers);
    const expectedUser = testUsers.userRandomID;

    assert.deepEqual(null, user);
  });
});