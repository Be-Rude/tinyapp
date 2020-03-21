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
  ab: {
    id: 'abcd',
    email: 'brad@email.com',
    password: '123'
  }

  };

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { users, userId: req.cookies['user_id'] };
  console.log(templateVars)

  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = { users, userId: req.cookies['user_id'],  };

  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { users, userId: req.cookies['user_id'],  };

  res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6).toString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls/');      
});

app.post("/register", (req, res) => {
  
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('I\'m sorry, one of the fields are empty. Please try again.'); 
  } 
  
  Object.keys(users).forEach(function(userId) {
    if (req.body.email === users[userId].email) {
     res.status(400).send('That email address has already been registered. Please try again.');
    } 
  });

  let userId = generateRandomString(4).toString();
  
  users[userId] = { id: userId, email: req.body.email, password: req.body.password };
  console.log(users)
  res.cookie('user_id', userId); 
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
  let templateVars = { email: req.body.email, password: req.body.password };

  Object.keys(users).forEach(function(userId) {
    if (req.body.email === users[userId].email) {
    res.cookie('user_id', userId); 
    res.redirect('/urls/');
    }
  });

  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('I\'m sorry, one of the fields are empty. Please try again.'); 
  } 
  
  Object.keys(users).forEach(function(userId) {
    if (req.body.email !== users[userId].email) {
     res.status(403).send('Sorry, there is no account registered with that email address.');
    } 

    if (req.body.email === users[userId].email && req.body.password !== users[userId].password) {
      res.status(403).send('Sorry, the password is incorrect.');
    }
  });
  
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { users, userId: req.cookies['user_id'], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, users, userId: req.cookies['user_id'] };
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