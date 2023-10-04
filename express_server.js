
// express_server.js

// Setup //

const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Database //

const users = {
  // Examples
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  // Examples
  "b2xVn2": "http://www.lighthouselabs.ca",
  "fsm5xK": "http://www.google.com"
};

// Functions //

const foundUserByEmail = function(email) {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return null;
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
  if (users[req.cookies.user_id]) {
    res.redirect('urls');
  }

  const templateVars = { user: users[req.cookies.user_id] };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  if (users[req.cookies.user_id]) {
    res.redirect('urls');
  }

  const templateVars = { user: users[req.cookies.user_id] };
  res.render('login', templateVars);
});

// View All Tiny Urls
app.get('/urls', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// Create TinyUrl
app.get('/urls/new', (req, res) => {
  if (!users[req.cookies.user_id]) {
    res.redirect('/login');
  }
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

// View/Edit TinyUrl
app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl], user: users[req.cookies.user_id]};

  res.render("urls_show", templateVars);
});

// Tiny Url's End Point
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
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

  if (foundUserByEmail(email)) {
    res.status(400).send("This email has already been registered. Please login or enter another email.");
  } else if (!email || !password) {
    res.status(400).send("Email and password are both required fields.");
  }

  const id = generateSixRandomChars();
  users[id] = { id, email, password};

  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const loginPassword = req.body.password;
  const user = foundUserByEmail(email);

  if (user) {
    if (user.password === loginPassword) {
      res.cookie('user_id', user.id);
      res.redirect('/urls');
    } else {
      res.status(403).send("<h1>Password Does Not Match</h1>");
    }
  } else {
    res.status(403).send("<h1>User Not Found</h1>");
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('login');
});

// Create Tiny Url
app.post('/urls', (req, res) => {
  if (!users[req.cookies.user_id]) {
    res.status(401).send("<h1>Please Login Or Register To Create Tiny Urls</h1>");
  }

  const shortUrl = generateSixRandomChars();
  urlDatabase[shortUrl] = req.body.longURL;

  res.redirect(`/urls/${shortUrl}`);
});

// Edit Original Url
app.post('/urls/:id', (req, res) => {
  const shortUrl = req.params.id;
  urlDatabase[shortUrl] = req.body.longURL;

  res.redirect(`/urls`);
});

// Delete Tiny Url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// SERVER //

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
