
// helpers.js

const foundUserByEmail = function(email, users) {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

module.exports = { foundUserByEmail };