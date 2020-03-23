const express = require("express");
const app =  express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const getUserByEmail = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secret'],
}));

app.set("view engine", "ejs");


// Generates random strings for User Id and Short URLs
const generateRandomString = function(length) {
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
};



//Databases
const urlDatabase = {
  'b2xVn2': { longURL: "http://www.lighthouselabs.ca", user: "abcd" },
  'b9m5xK': { longURL: "http://www.google.com", user: "abcd" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//GET and POST call routing
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { users, userId: req.session.user_id };
  let loginStatus = req.session.user_id;
  if (!loginStatus) {
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = { users, userId: req.session.user_id  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { users, userId: req.session.user_id  };
  res.render("urls_login", templateVars);
});

//New Short URL creation
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6);
  let longURL = req.body.longURL;
  let userId = req.session.user_id;
  
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].user = userId;
  
  res.redirect('/urls/');
});

//New user registration
app.post("/register", (req, res) => {
  
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('I\'m sorry, one of the fields are empty. Please try again.');
  } else 
  
  if (getUserByEmail(req.body.email, users)) {
    res.status(400).send('That email address has already been registered. Please try again.');
  } else

  userId = generateRandomString(4);
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userId] = { id: userId, email: req.body.email, password: hashedPassword };
  req.session.user_id = userId;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let loginStatus = req.session.user_id;
  if (!loginStatus) {
    res.status(403).send('You do not have permission.');
  }
  const deletedURL = req.params.shortURL;
  delete urlDatabase[deletedURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/update", (req, res) => {
  let shortURL = req.params.shortURL;
  let newLongURL = req.body.updatedURL;
  let loginStatus = req.session.user_id;
  if (!loginStatus) {
    res.status(403).send('You do not have permission.');
  }

  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect('/urls/');
});

//Existing user login
app.post("/login", (req, res) => {

  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('I\'m sorry, one or more of the fields are empty. Please try again.');
  }
  
  Object.keys(users).forEach(function(userId) {
    if (getUserByEmail(req.body.email, users) && bcrypt.compareSync(req.body.password, users[userId].password)) {
      req.session.user_id = userId;
      res.redirect('/urls/');
    }
  });

  Object.keys(users).forEach(function(userId) {
    if (getUserByEmail(req.body.email, users) && !bcrypt.compareSync(req.body.password, users[userId].password)) {
      res.status(403).send('Sorry, the password is incorrect.');
    }
  });

  Object.keys(users).forEach(function(userId) {
    if (!getUserByEmail(req.body.email, users)) {
      res.status(403).send('Sorry, there is no account registered with that email address.');
    }
  });
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;

  let templateVars = { urls: urlDatabase, users, userId: req.session.user_id, shortURL, longURL };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  
  let userId = req.session.user_id;
  let shortURL = Object.keys(urlDatabase)[0];
  let longURL = urlDatabase[shortURL].longURL;
  let urls = {};

  if (!userId) {
    res.redirect('/login');
  }

  Object.keys(urlDatabase).forEach(function(shortURL) {
    if (urlDatabase[shortURL].user === userId) {
      urls[shortURL] = urlDatabase[shortURL].longURL;
    }
  });
  let templateVars = { urls, users, userId: req.session.user_id };

  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.redirect('/urls');
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

module.exports.users = users;