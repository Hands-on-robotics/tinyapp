
// express_server.js

const express = require('express');
const app = express();
const PORT = 8080;

function generateRandomString() {};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase }; // So did we create an object around urlDatabase with the key urls?
  res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render("urls_new");
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('Ok');
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] }; // <--- How do I access the longURL? Is this the correct understanding? How was id: assigned to the short url? Was that done here?
  res.render("urls_show", templateVars);
});

