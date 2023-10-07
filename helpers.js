
// helpers.js

const generateSixRandomChars = function() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = chars.charAt(Math.floor(Math.random() * chars.length));
    randomString += randomIndex;
  }

  return randomString;
};

const findUserByEmail = function(email, users) {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }

  return null;
};

const urlsForUser = function(id, urlDatabase) {
  let urls = {};
  for (const tinyUrl in urlDatabase) {
    if (urlDatabase[tinyUrl].userID === id) {
      urls[tinyUrl] = urlDatabase[tinyUrl];
    }
  }

  return urls;
};

module.exports = { generateSixRandomChars, findUserByEmail, urlsForUser };