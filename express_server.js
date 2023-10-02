
// express_server.js


// Setup //

const express = require('express');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "fsm5xK": "http://www.google.com"
};

// Function creates the tiny urls
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

// GET Routes

// Home Page
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Shows create a new tiny url page
app.get('/urls/new', (req, res) => {
  res.render("urls_new");
});

// Shows Individual URL page
app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl] };
  res.render("urls_show", templateVars);
});

// Redirects to longURL page
app.get("/u/:id", (req, res) => {
  // long URL at short URL's address
  const longURL = urlDatabase[req.params.id];

  // redirects to real url
  res.redirect(longURL);
});


// P O S T   R O U T E S


// Creates a tiny url
app.post('/urls', (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;

  console.log("req.params.id", req.params.id);
  console.log("shortUrl", shortUrl);
  console.log("req.body.longURL", req.body.longURL);
  console.log("urlDatabase[shortUrl]", urlDatabase[shortUrl]);

  res.redirect(`/urls/${shortUrl}`);
});

// Edits a tiny urls long url
app.post('/urls/:id', (req, res) => {
  const shortUrl = req.params.id;
  urlDatabase[shortUrl] = req.body.longURL;

  console.log("shortUrl", shortUrl);
  console.log("urlDatabase[shortUrl]", urlDatabase[shortUrl]);

  // sends back to same page
  res.redirect(`/urls`);
});

// Deletes tiny url from database from index page
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});




// SERVER //


// Server on (always at bottom)
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


