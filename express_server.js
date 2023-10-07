const express = require('express');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;
const { generateSixRandomChars, findUserByEmail, urlsForUser } = require('./helpers');

app.set("view engine", "ejs");
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['asupersecretstring', 'theywontknowwhatthisis', 'wouldneverguessthisinamillionyears']
}));
app.use(express.urlencoded({ extended: true }));

// Database //

const users = {
  // Example User
  userRandomID: {
    id: "a1b2c3",
    email: "example@mail.com",
    password: "123",
  }
};

const urlDatabase = {
  // Example Tiny Url
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "a1b2c3",
    clicks: {
      userID: "a1b2c3",
      timeStamp: ""
    },
  },
};

// Function //

const validateUser = function(action, usersID, shortUrl, res) {
  if (!(users[usersID] && usersID === urlDatabase[shortUrl].userID)) {
    res.status(401).send(`<h1>Only the creator of the Tiny Url can ${action} the url when logged in</h1>`);
  }
};

// Routes //

// G E T  R O U T E S //

// Register Page
app.get('/register', (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect('urls');
  }

  const templateVars = { user: users[req.session.user_id] };
  res.render('register', templateVars);
});

// Login Page
app.get('/login', (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect('urls');
  }

  const templateVars = { user: users[req.session.user_id] };
  res.render('login', templateVars);
});

// My Urls Page
app.get('/urls', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

// Create TinyUrl Page
app.get('/urls/new', (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect('/login');
  }

  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

// Edit TinyUrl Page
app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const usersID = req.session.user_id;
  validateUser("view", usersID, shortUrl, res);

  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl].longURL, user: users[usersID] };
  res.render("urls_show", templateVars);
});

// Tiny Url's Redirect
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  if (!longURL) {
    res.status(404).send("<h1>Url Not In Database</h1>");
  }

  res.redirect(longURL);
});

// P O S T   R O U T E S //

// Register
app.post('/register', (req, res) => {
  const id = generateSixRandomChars();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (findUserByEmail(email, users)) {
    res.status(400).send("This email has already been registered. Please login or register another email.");

  } else if (!email || !password) {
    res.status(400).send("Email and password are both required fields.");
  }

  req.session.user_id = id;
  users[id] = { id, email, hashedPassword };
  res.redirect('/urls');
});

// Login
app.post('/login', (req, res) => {
  const loginPassword = req.body.password;
  const email = req.body.email;
  const user = findUserByEmail(email, users);

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

// Logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('login');
});

// Create Tiny Url
app.post('/urls', (req, res) => {
  const currentUser = req.session.user_id;
  const shortUrl = generateSixRandomChars();

  if (!users[currentUser]) {
    res.status(401).send("<h1>Please Login Or Register To Create Tiny Urls</h1>");
  }

  urlDatabase[shortUrl] = { longURL: req.body.longURL, userID: currentUser };
  res.redirect(`/urls/${shortUrl}`);
});

// Edit Long Url
app.put('/urls/:id', (req, res) => {
  const shortUrl = req.params.id;
  const usersID = req.session.user_id;
  validateUser('edit', usersID, shortUrl, res);

  urlDatabase[shortUrl].longURL = req.body.longURL;

  res.redirect(`/urls`);
});

// Delete Tiny Url
app.delete("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const usersID = req.session.user_id;

  validateUser('delete', usersID, shortUrl, res);


  delete urlDatabase[shortUrl];
  res.redirect('/urls');
});

// SERVER //

app.listen(PORT, () => {
  console.log(`Tiny App Server listening on port ${PORT}`);
});
