
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

const foundUserByEmail = function(email) {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

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
    urls: urlsForUser(req.cookies.user_id)
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
  const usersID = req.cookies.user_id;
  const urlUserID = urlDatabase[shortUrl].id;
  console.log("Is the User ID in cookie: ", req.cookies.user_id, "Equal to the user ID in Database:", users[req.cookies.user_id], "?");

  if (!users[req.cookies.user_id] || usersID === urlUserID) {
    res.status(401).send("<h1>Only the creator of the Tiny Url can view the url when Logged In</h1>");
  }

  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl].longURL, user: users[req.cookies.user_id]};
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

  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };

  console.log("tinyUrl created", urlDatabase[shortUrl]);

  res.redirect(`/urls/${shortUrl}`);
});

// Edit Original Url
app.post('/urls/:id', (req, res) => {
  const usersID = req.cookies.user_id;
  const shortUrl = req.params.id;
  const urlUserID = urlDatabase[shortUrl].id;
  if (!users[req.cookies.user_id] || usersID === urlUserID) {
    res.status(401).send("<h1>Only the creator of the Tiny Url can edit the url when Logged In</h1>");
  }
  urlDatabase[shortUrl].longURL = req.body.longURL;

  res.redirect(`/urls`);
});

// Delete Tiny Url
app.post("/urls/:id/delete", (req, res) => {
  const usersID = req.cookies.user_id;
  const shortUrl = req.params.id;
  const urlUserID = urlDatabase[shortUrl].id;
  if (!users[req.cookies.user_id] || usersID === urlUserID) {
    res.status(401).send("<h1>Only the creator of the Tiny Url can delete the url when Logged In</h1>");
  }
  delete urlDatabase[shortUrl];
  res.redirect('/urls');
});

// SERVER //

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
