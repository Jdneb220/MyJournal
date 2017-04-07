const express = require('express');
const app = express();
var methodOverride = require('method-override')

const pgp = require('pg-promise')();
const mustacheExpress = require('mustache-express');
const bodyParser = require("body-parser");
const session = require('express-session');

const validator = require('validator');

const bcrypt = require('bcrypt');

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
    .one("SELECT * FROM persons WHERE email = $1;", [data.email])
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


app.get('/journal/:id', function(req, res){
  if(req.session.user)
    db.tx(t => {
      let queries = [
        t.one("SELECT * FROM horses WHERE id = $1;", [parseInt(req.params.id)]),
        t.any("SELECT * FROM rides  WHERE horse_id = $1;", [parseInt(req.params.id)])
      ]
      return t.batch(queries)
      })
      .then(function(data){
          let view_data = {
            journal: data[0],
            logs: data[1]
          }
          res.render('journals/edit', view_data)
      })
  else
    res.send('<a href="/">please log in</a>')
})

app.put('/journal/:id', function(req,res){
  db
  .none("UPDATE horses SET name = $1 WHERE id = $2;", [req.body.name, parseInt(req.params.id)])
  .catch(function(){
    res.send('fail.')
  })
  .then(function(){
    res.send('Jounral updated.  <a href="/">home</a>')
  })
})



app.get('/journals', function(req, res){
  if(req.session.user)
    db
      .any("SELECT * FROM horses WHERE person_id = $1;", [req.session.user.id])
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
    .none("SELECT * FROM horses WHERE LOWER(name) = LOWER($1) AND person_id = $2;", [data.name, req.session.user.id])
    .then(function(){
      db
        .none(
          "INSERT INTO horses (name, person_id) VALUES ($1, $2);", [data.name, req.session.user.id]
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


/*  RIDES / LOGS  */
app.get('/logs', function(req, res){
  if(req.session.user)
    db
      .any("SELECT * FROM rides WHERE person_id = $1;", [req.session.user.id])
      .then(function(data){
          let view_data = {
            logs: data
          }
          res.render('logs/', view_data)
      })
  else
    res.send('<a href="/">please log in</a>')
})


app.post('/logs', function(req, res){
  if(req.session.user) {
    let data = req.body
    db.tx(t => {
      let queries = [
        t.one("INSERT INTO rides (horse_id, person_id, date, hours, info, type) VALUES ($1, $2, $3, $4, $5, $6) returning id;", [data.horse_id, req.session.user.id, data.date, data.hours, data.info, data.type]),
      ]
      return t.batch(queries)
      })
      .then(function(data){
          console.log(data)
          res.send('log created')
      })
      .catch(function(){
        res.send('could not create log')
      })
    }
  else
    res.send('<a href="/">please log in</a>')
})


app.get('/logs/new/:id', function(req, res){
  if(req.session.user)
    db
      .tx(t => {
      let queries = [
        t.one("SELECT * FROM horses WHERE person_id = $1 AND id = $2;", [req.session.user.id, parseInt(req.params.id)]),
        t.any("SELECT * FROM horses WHERE person_id = $1;", [req.session.user.id])
      ]
      return t.batch(queries)
      })
      .then(function(data){
        let view_data = {
          name: data[0].name,
          journals: data[1]
        }
        res.render('logs/new', view_data);
      })
      .catch(function(){
        res.send('No journals yet.  Please <a href="/journals/">create a journal</a>')
      })
  else
    res.send('<a href="/">please log in</a>')
})

app.get('/logs/new', function(req, res){
  res.send('please select a <a href="/journals/">journal</a>')
  // if(req.session.user)
  //   db
  //     .any("SELECT * FROM horses WHERE person_id = $1;", [req.session.user.id])
  //     .then(function(data){
  //       let view_data = {
  //         name: 'Select a journal',
  //         journals: data
  //       }
  //       console.log(view_data)
  //       res.render('logs/new', view_data);
  //     })
  //     .catch(function(){
  //       res.send('No journals yet.  Please <a href="/journals/">create a journal</a>')
  //     })
  // else
  //   res.send('<a href="/">please log in</a>')
})

app.put('/log/:id', function(req,res){
        // t.one("INSERT INTO rides (horse_id, person_id, date, hours, info, type) VALUES horse_id = $1, person_id = $2, date = $3 hours = $4, info = $5, type = $6", [data.horse_id, req.session.user.id, data.date, data.hours, data.info, data.type]),
})

app.get('/log/:id', function(req, res){
  if(req.session.user)
    db
      .one("SELECT * FROM rides WHERE id = $1;", [parseInt(req.params.id)])
      .then(function(data){
          let view_data = {
            logs: data
          }
          res.render('logs/edit', view_data)
      })
  else
    res.send('<a href="/">please log in</a>')
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
});





app.get('/logout', function(req, res){
    req.session.user = false
    res.render("index")
});

app.listen(3000, function () {
  console.log('HART App: listening on port 3000!');
});
