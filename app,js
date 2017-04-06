// things to do
// not login with email and password
// first name
// last name
// username
// birthday

// store data
// see how it gets passed
// see ho edit form required

// edit form on separate page


const express = require('express');
const app = express();
var methodOverride = require('method-override')

const pgp = require('pg-promise')();
const mustacheExpress = require('mustache-express');
const bodyParser = require("body-parser");
const session = require('express-session');

const validator = require('validator');

/* BCrypt stuff here */
const bcrypt = require('bcrypt');
const salt = bcrypt.genSalt(10);

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use("/", express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

app.use(session({
  secret: 'HART',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

var db = pgp('postgres://benjamindejesus@localhost:5432/hart');








app.get('/', function(req, res){
  if(req.session.user){
    let data = {
     "logged_in": true,
      "email": req.session.user.email
    }
    res.render('index', data)
  }
  else{
    res.render('index')
  }
});

app.post('/login', function(req, res){
  let data = req.body
  db
    .one("SELECT * FROM users WHERE email = $1", [data.email])
    .catch(function(){
      res.send("Authorization Failed: Invalid email/password")
    })
    .then(function(user){
      bcrypt.compare(
        data.password,
        user.password_digest,
          function(err, cmp){
              if(cmp){
                req.session.user = user
                res.redirect("/")
              }
              else{
                res.send("Authorization Failed: Invalid email/password")
              }

          }
        )
    })
  //Compare that user's hased pass, to the hash o fthe req.body.email
  //if match, let user in
  // if not tell them error
  // email and/or pass no good
});

app.get('/signup', function(req, res){
  res.render('signup/index');
});

app.post('/signup', function(req, res){
  let data = req.body
  console.log(data)
  bcrypt
    .hash(data.password, 10, function(err, hash){
     console.log(hash)
      db
      .none(
        "INSERT INTO users (email, password_digest) VALUES ($1, $2)", [data.email, hash]
        )
      .then(function(){
          res.send("User created!")
        })

    })
});

// db
  //   .none("SELECT email FROM users WHERE email = $1", [data.email])
  //   .catch(function(){
  //     res.send("Email already exists in the database")
  //   })
  //   .then(function(){
  //     let hash = bcrypt.hashSync(data.password, salt)
  //     db
  //       .none("INSERT INTO users (email, password) VALUES (" + data.email + "," + hash + ")")
  //       .catch(function(){
  //         res.send('Could not add user to db')
  //       })
  //       .then(function(){
  //        // res.render('index')
  //       })
  //   })

app.put('/user', function(req,res){
  db
  .none("UPDATE users SET email = $1 WHERE email = $2", [req.body.email, req.session.user.email])
  .catch(function(){
    res.send('fail.')
  })
  .then(function(){
    res.send('Email updated')
  })
})

app.get('/logout', function(req, res){
    req.session.user = false
    res.redirect("/")
});

app.listen(3000, function () {
  console.log('HART App: listening on port 3000!');
});
