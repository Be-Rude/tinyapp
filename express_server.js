const express = require("express");
const app =  express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


app.set("view engine", "ejs");

function generateRandomString(length) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for ( var i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random(6) * randomChars.length));
    }
    return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  
};

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  // accounts.email = req.body["email"];
  // console.log(accounts)
  let accountVars = { email: req.body["email"], password: req.body.password, username: req.cookies["username"] };
  // console.log(accountVars)
  res.render("urls_registration", accountVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6).toString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls/');      
});

app.post("/register", (req, res) => {
  let userId = generateRandomString(3).toString();
  let id = userId;
  users[userId] = { id: id, email: req.body.email, password: req.body.password };
  res.cookie('user_id', userId);
  console.log(users)
  res.redirect('/urls/');      
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const deletedURL = req.params.shortURL;
  delete urlDatabase[deletedURL];
  res.redirect('/urls/');
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.updatedURL; 
  urlDatabase[shortURL] = newLongURL;
  res.redirect('/urls/');
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.redirect('/urls/');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});