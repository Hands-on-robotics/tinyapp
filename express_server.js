
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

const findUserByEmail = function(email) {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      console.log("findUserByEmail function should return user: ", user);
      return user;
    }
  }
  return null;
};

const sixRandomChars = function() {
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

// TODO // Home Page (Does not crash or load a page)
app.get('/', (req, res) => {
});

// Registration Page
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };

  res.render('register', templateVars);
});

// Login Page
app.get('/login', (req, res) => {
  res.render('login');
});

// Main Urls Page
app.get('/urls', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});

// Create TinyUrl Page
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };

  res.render("urls_new", templateVars);
});

// View/Edit TinyUrl Page
app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl], user: users[req.cookies.user_id]};
  res.render("urls_show", templateVars);
});

// Long Url's Page
app.get("/u/:id", (req, res) => {
  // long URL at short URL's address
  const longURL = urlDatabase[req.params.id];

  // redirects to real url
  res.redirect(longURL);
});

// P O S T   R O U T E S

//Register (automatically logs user in)
// TODO Check for existing email
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // TODO // FEATURE // reload page with fill form messages
  if (!email) {
    res.status(400).send("Email was left empty. Please enter a valid email.");
    // res.redirect('/register');
  } else if (!password) {
    res.status(400).send("password was left empty. Please enter a valid password.");
    // res.redirect('/register');
  } else if (findUserByEmail(email)) {
    res.status(400).send("This email has already been registered. Please login or enter another email.");
  }
  const id = sixRandomChars();
  
  users[id] = { id, email, password};
  res.cookie('user_id', id);
  res.redirect('/urls');
});


// TODO // Fix: Cannot login user in, because registration automatically does and logging out clears the cookie to log back in with.
// Login
app.post('/login', (req, res) => {
  const email = req.body.email;

  if (findUserByEmail(email)) {
    res.redirect('/urls'); // Do I need to pass user to /urls?
  } else {
    res.send("<h1>User Not Found</h1>");
  }
});

// Logout
app.post('/logout', (req, res) => {
  const email = req.body.email;
  console.log("user found by email", findUserByEmail(email));
  console.log("users database", users);
  res.clearCookie("user_id"); // Once cleared, you can't log back in.
  res.redirect('/urls');
});

// Creates a tiny url
app.post('/urls', (req, res) => {
  const shortUrl = sixRandomChars();
  urlDatabase[shortUrl] = req.body.longURL;

  res.redirect(`/urls/${shortUrl}`);
});

// Edits a tiny urls long url
app.post('/urls/:id', (req, res) => {
  const shortUrl = req.params.id;
  urlDatabase[shortUrl] = req.body.longURL;

  res.redirect(`/urls`);
});

// Deletes tiny url from database on index page
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];

  res.redirect('/urls');
});

// SERVER //

// Server on (always at bottom)
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
