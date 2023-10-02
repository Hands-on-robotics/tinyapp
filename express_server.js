
// express_server.js

const express = require('express');
// Do we need const bodyParser = require('body-parser'); in this project? // written down
const app = express();
const PORT = 8080;

const generateRandomString = function() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = '';

  for (let i = 0; i < 7; i++) {
    const randomIndex = chars.charAt(Math.floor(Math.random() * chars.length));
    randomString += randomIndex;
  }

  return randomString;
};

// Viewing engine
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "fsm5xK": "http://www.google.com"
};

// Do We Need This At All? // written down
// app.get('/', (req, res) => {
//   res.send("Hello!");
// });

// Shows database without CSS
// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

// Home Page
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.get('/urls/new', (req, res) => {
  res.render("urls_new");
});

// shows Individual URL
app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl] };
  res.render("urls_show", templateVars);
});


// Redirects to longURL
app.get("/u/:id", (req, res) => {
  // long URL at short URL's address
  const longURL = urlDatabase[req.params.id];

  // redirects to real url
  res.redirect(longURL);
});

// Delete request for home page
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// P O S T  R O U T E


// (Cannot POST /urls/new) Creates a tiny url
app.post('/urls', (req, res) => {
  const shortUrl = generateRandomString();

  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`);
});


// (Unfinished) Edit feature for individual url
// app.post('urls/:id', (req, res) => {
//   const shortUrl = req.params.id;

//   urlDatabase[shortUrl] = req.body.longURL; //"submitted Long URL"


//   // redirects to updated page
//   // const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl] };
//   res.redirect(`/urls/${shortUrl}`);
// });

// Server on
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


