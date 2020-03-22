const express = require("express");
const app =  express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secret'],
}));

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
  'b2xVn2': { longURL: "http://www.lighthouselabs.ca", user: "abcd" },
  'b9m5xK': { longURL: "http://www.google.com", user: "abcd" }
};

const users = {};

const getUserByEmail = function(emailInput, database) {
  for (let userId in database) {
       if (users[userId].email === emailInput) {
      return true;
     } 
    }
};

app.get("/u/:shortURL", (req, res) => {
  shortURL = Object.keys(urlDatabase)[0];
  longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { users, userId: req.session.user_id };
  let loginStatus = req.session.user_id;
  if (!loginStatus) {
    res.redirect('/login');
  };
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

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6).toString();
  let longURL = req.body.longURL;
  userId = req.session.user_id;
  
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].user = userId;
  
  res.redirect('/urls/');      
});

app.post("/register", (req, res) => {
  
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('I\'m sorry, one of the fields are empty. Please try again.'); 
  } 
  
  if (getUserByEmail(req.body.email, users)) {
    res.status(400).send('That email address has already been registered. Please try again.');
  }

  let userId = generateRandomString(4).toString();
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userId] = { id: userId, email: req.body.email, password: hashedPassword };
  req.session.user_id = userId; 
  res.redirect('/urls/');  
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let loginStatus = req.session.user_id;
  if (!loginStatus) {
    res.status(403).send('You do not have permission.');
  };
  const deletedURL = req.params.shortURL;
  delete urlDatabase[deletedURL];
  res.redirect('/urls/');
});

app.post("/urls/:shortURL/update", (req, res) => {
  shortURL = req.params.shortURL;
  newLongURL = req.body.updatedURL;
  let loginStatus = req.session.user_id;
  if (!loginStatus) {
    res.status(403).send('You do not have permission.');
  };

  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect('/urls/');
});

app.post("/login", (req, res) => {
  let templateVars = { email: req.body.email, password: req.body.password };

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
  })

  Object.keys(users).forEach(function(userId) {
    if (!getUserByEmail(req.body.email, users)) {
      res.status(403).send('Sorry, there is no account registered with that email address.');
     } 
  });
})

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
  
  userId = req.session.user_id;
  shortURL = Object.keys(urlDatabase)[0];
  longURL = urlDatabase[shortURL].longURL;
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