
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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "fsm5xK": "http://www.google.com"
};

// Function //

// Generates the tiny urls
const generateRandomString = function() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = '';

  for (let i = 0; i < 7; i++) {
    const randomIndex = chars.charAt(Math.floor(Math.random() * chars.length));
    randomString += randomIndex;
  }

  return randomString;
};

// Routing //

// G E T  R O U T E S

// Create Home Page
// // (Login option, click on link, <a href="/login"> tag)
// app.get('/');

// Main Page
app.get('/urls', (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});

// New TinyUrl Page
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };

  res.render("urls_new", templateVars);
});

// Individual Url Page
app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl], username: req.cookies["username"]};
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

// Login
app.post('/login', (req, res) => {
  const username = req.body.username;

  res.cookie("username", username);
  res.redirect('/urls');
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});

// Creates a tiny url
app.post('/urls', (req, res) => {
  const shortUrl = generateRandomString();
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


