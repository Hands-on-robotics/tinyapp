
// express_server.js

/*
(Stretch) activate href for tiny urls on main page
(Stretch) the date the short URL was created
(Stretch) the number of times the short URL was visited
(Stretch) the number number of unique visits for the short URL
*/

// Setup //

const express = require('express');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;
const { foundUserByEmail } = require('./helpers');

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['asupersecretstring', 'theywontknowwhatthisis', 'didyouguessthis']
}));
app.use(express.urlencoded({ extended: true }));

// Database //

const users = {
  // Example
  userRandomID: {
    id: "guy",
    email: "a@a.com",
    password: "123",
  }
};

const urlDatabase = {
  // Examples
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "guy",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "guy",
  },
};

// Functions //

const urlsForUser = function(id) {
  let urls = {};
  for (const tinyUrl in urlDatabase) {
    if (urlDatabase[tinyUrl].userID === id) {
      urls[tinyUrl] = urlDatabase[tinyUrl];
    }
  }

  return urls;
};

const generateSixRandomChars = function() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = chars.charAt(Math.floor(Math.random() * chars.length));
    randomString += randomIndex;
  }

  return randomString;
};

// Routing //

// G E T  R O U T E S

// TODO // GET Routes need if statements to redirect
app.get('/register', (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect('urls');
  }

  const templateVars = { user: users[req.session.user_id] };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect('urls');
  }

  const templateVars = { user: users[req.session.user_id] };
  res.render('login', templateVars);
});

// View All Tiny Urls
app.get('/urls', (req, res) => {

  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  };

  res.render("urls_index", templateVars);
});

// Create TinyUrl
app.get('/urls/new', (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect('/login');
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

// View/Edit TinyUrl
app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const usersID = req.session.user_id;
  const urlUserID = urlDatabase[shortUrl].id;

  if (!users[req.session.user_id] || usersID === urlUserID) {
    res.status(401).send("<h1>Only the creator of the Tiny Url can view the url when Logged In</h1>");
  }

  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl].longURL, user: users[req.session.user_id]};
  res.render("urls_show", templateVars);
});

// Tiny Url's End Point
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    res.status(404).send("<h1>Url Not In Database</h1>");
  }

  res.redirect(longURL);
});

// P O S T   R O U T E S

// TODO // FEATURE // if either registration fields are submitted as empty, page reloads with a message to please fill in both fields.
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (foundUserByEmail(email)) {
    res.status(400).send("This email has already been registered. Please login or enter another email.");
  } else if (!email || !password) {
    res.status(400).send("Email and password are both required fields.");
  }

  const id = generateSixRandomChars();
  users[id] = { id, email, hashedPassword};

  console.log(users[id].hashedPassword);

  req.session.user_id = id;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const user = foundUserByEmail(email);
  const loginPassword = req.body.password;

  if (user) {
    if (bcrypt.compareSync(loginPassword, user.hashedPassword)) {
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      res.status(403).send("<h1>Password Does Not Match</h1>");
    }
  } else {
    res.status(403).send("<h1>User Not Found</h1>");
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('login');
});

// Create Tiny Url
app.post('/urls', (req, res) => {
  if (!users[req.session.user_id]) {
    res.status(401).send("<h1>Please Login Or Register To Create Tiny Urls</h1>");
  }

  const shortUrl = generateSixRandomChars();

  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };

  console.log("tinyUrl created", urlDatabase[shortUrl]);

  res.redirect(`/urls/${shortUrl}`);
});

// Edit Original Url
app.post('/urls/:id', (req, res) => {
  const usersID = req.session.user_id;
  const shortUrl = req.params.id;
  const urlUserID = urlDatabase[shortUrl].id;
  if (!users[req.session.user_id] || usersID === urlUserID) {
    res.status(401).send("<h1>Only the creator of the Tiny Url can edit the url when Logged In</h1>");
  }
  urlDatabase[shortUrl].longURL = req.body.longURL;

  res.redirect(`/urls`);
});

// Delete Tiny Url
app.post("/urls/:id/delete", (req, res) => {
  const usersID = req.session.user_id;
  const shortUrl = req.params.id;
  const urlUserID = urlDatabase[shortUrl].id;
  if (!users[req.session.user_id] || usersID === urlUserID) {
    res.status(401).send("<h1>Only the creator of the Tiny Url can delete the url when Logged In</h1>");
  }
  delete urlDatabase[shortUrl];
  res.redirect('/urls');
});

// SERVER //

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
