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





/* HOME PAGE */

app.get('/', function(req, res){
  if(req.session.user){
    let data = {
     "logged_in": true,
     "name": req.session.user.name,
      "email": req.session.user.email,
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
    .one("SELECT * FROM persons WHERE email = $1", [data.email])
    .catch(function(){
      res.send("Authorization Failed: Invalid email/password")
    })
    .then(function(user){
      bcrypt.compare(
        data.password,
        user.password,
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
});


/*  HORSES / JOURNALS  */
app.get('/journals', function(req, res){
  if(req.session.user)
    db
      .any("SELECT * FROM horses WHERE person_id = $1", [req.session.user.id])
      .then(function(horses){
          let view_data = {
            journals: horses
          }
          res.render('journals/', view_data)
      })
  else
    res.send('<a href="/">please log in</a>')
})


app.get('/journals/new', function(req, res){
  if(req.session.user)
    res.render('journals/new');
  else
    res.send('<a href="/">please log in</a>')
});

app.post('/journals', function(req, res){
  let data = req.body
  console.log(data)

  db
    .none("SELECT * FROM horses WHERE LOWER(name) = LOWER($1) AND person_id = $2", [data.name, req.session.user.id])
    .then(function(){
      db
        .none(
          "INSERT INTO horses (name, person_id) VALUES ($1, $2)", [data.name, req.session.user.id]
          )
        .then(function(e){
          res.redirect("/")
        })
        .catch(function(){
          res.send('error creating journal')
        })

    })
    .catch(function(){
      res.send("You already have a journal by that name!  <a href='/'>Home</a>")
    })
})


/*  SIGN UP   */

app.get('/signup', function(req, res){
  res.render('signup/index');
});


let createAccount = function(user){
  if (validator.isEmail(user.email) || user.password.length < 8)
  bcrypt
      .hash(user.password, 10, function(err, hash){
       console.log(hash)
        db
        .none(
          "INSERT INTO persons (name, email, password) VALUES ($1, $2, $3)", [user.name, user.email, hash]
          )
        .then(function(e){
          console.log('account created')
        })
        .catch(function(){
          console.log('error creating account')
        })
      })
  else
    console.log('invalid email or password')
}

app.post('/signup', function(req, res){
  let data = req.body
  console.log(data)

  db
    .none("SELECT email FROM persons WHERE LOWER(email) = LOWER($1)", [data.email])
    .then(function(){
      let user_data = {
        name: data.name,
        email: data.email,
        password: data.password
      }
      createAccount(user_data)
      res.redirect("/")
    })
    .catch(function(){
      console.log
      res.render("signup/index", {err:"Email already exists in the database"})
    })
})




/*  BADGES  */

app.get('/badges/my', function(req, res){
  if(req.session.user){
    let data = {
     "logged_in": true,
     "name": req.session.user.name,
      "email": req.session.user.email
    }
    db
      .any("SELECT * FROM personsToBadges JOIN badges ON personsToBadges.badge_id = badges.id WHERE personsToBadges.person_id = " + req.session.user.id)
      .then(function(data){
          let view_data = {
            title: 'Badges for ' + req.session.user.name,
            badges: data
          }
          res.render('badges/index', view_data)
        }
      )
  }
  else{
    console.log('not logged in')
  }
});

app.get('/badges/', function(req, res){
  if(req.session.user){
    // let data = {
    //  "logged_in": true,
    //  "name": req.session.user.name,
    //   "email": req.session.user.email
    // }
    db
      .any("SELECT * FROM badges")
      .then(function(data){
          let view_data = {
            title: 'All Badges',
            badges: data
          }
          res.render('badges/index', view_data)
        }
      )
  }
  else{
    console.log('not logged in')
  }
});




app.put('/user', function(req,res){
  db
  .none("UPDATE persons SET email = $1 WHERE email = $2", [req.body.email, req.session.user.email])
  .catch(function(){
    res.send('fail.')
  })
  .then(function(){
    res.send('Email updated')
  })
})

app.get('/logout', function(req, res){
    req.session.user = false
    res.render("index")
});

app.listen(3000, function () {
  console.log('HART App: listening on port 3000!');
});
