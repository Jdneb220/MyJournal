const express = require('express');
const expressSanitizer = require('express-sanitizer');
const app = express();
var methodOverride = require('method-override')

const pgp = require('pg-promise')();
const mustacheExpress = require('mustache-express');
const bodyParser = require("body-parser");
const session = require('express-session');

const validator = require('validator');
var moment = require('moment');
const bcrypt = require('bcrypt');

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use("/", express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(expressSanitizer());

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
                res.render('index', {err:'Authentication failed.  Email/password incorrect'})
              }

          }
        )
    })
    .catch(function(){
      res.render('index', {err:'Authentication failed.  Email/password incorrect'})
    })
});






/*  HORSES / JOURNALS  */


app.get('/journal/:id', function(req, res){
  if(req.session.user)
    db.tx(t => {
      let queries = [
        t.one("SELECT * FROM horses WHERE id = $1;", [parseInt(req.params.id)]),
        t.any("SELECT * FROM rides  WHERE horse_id = $1 ORDER BY date DESC;", [parseInt(req.params.id)])
      ]
      return t.batch(queries)
      })
      .then(function(data){
          let view_data = {
            journal: data[0],
            logs: data[1]
          }
          view_data.logs.forEach(function(x){
            x.date = moment(x.date).format("MMMM D, YYYY")
          })
          res.render('journals/edit', view_data)
      })
  else
    res.send('<a href="/">please log in</a>')
})

app.put('/journal/:id', function(req,res){
  db
    .none("SELECT * FROM horses WHERE name = $1 AND person_id = $2;", [req.body.name, req.session.user.id])
    .then(function(){
      db
      .none("UPDATE horses SET name = $1 WHERE id = $2;", [req.body.name, parseInt(req.params.id)])
      .catch(function(){
        res.send('fail.')
      })
      .then(function(){
        res.redirect('/journal/' + parseInt(req.params.id))
      })
    })
    .catch(function(){
      res.send('you already have a journal by that name')
    })
})

app.delete('/journal/:id', function(req,res){
  if(req.session.user)
     db
      .one("DELETE FROM horses WHERE id = $1 returning name;", [parseInt(req.params.id)])
      .then(function(deleted_journal){
          //console.log(deleted_journal.name)
          res.redirect('/')
      })
      .catch(function(x){
         console.log('error deleting journal', x)
         res.redirect('/')
      })
  else
    res.send('<a href="/">please log in</a>')
})

app.get('/journals', function(req, res){
  if(req.session.user)
    db
      .any("SELECT * FROM horses WHERE person_id = $1 ORDER BY id ASC;", [req.session.user.id])
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
  //console.log(data)
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
      .any("SELECT * FROM rides WHERE person_id = $1 ORDER BY date DESC;", [req.session.user.id])
      .then(function(data){
          let view_data = {
            logs: data
          }
          view_data.logs.forEach(function(x){
            x.date = moment(x.date).format("MMMM D, YYYY")
          })
          res.render('logs/', view_data)
      })
  else
    res.send('<a href="/">please log in</a>')
})

app.get('/logs/:id', function(req, res){
  if(req.session.user)
    db
      .any("SELECT * FROM rides WHERE person_id = $1 and horse_id = $2 ORDER BY date DESC;", [req.session.user.id, parseInt(req.params.id)])
      .then(function(data){
          let view_data = {
            logs: data
          }
          view_data.logs.forEach(function(x){
            x.date = moment(x.date).format("MMMM D, YYYY")
          })
          res.render('logs/', view_data)
      })
      .catch(function(){
        res.send('error fetching logs')
      })
  else
    res.send('<a href="/">please log in</a>')
})



app.post('/log/new/:id', function(req, res){
  if(req.session.user) {
    let data = req.body
    db.tx(t => {
      let queries = [
        t.one("INSERT INTO rides (horse_id, person_id, date, hours, info, type) VALUES ($1, $2, $3, $4, $5, $6) returning id;", [parseInt(req.params.id), req.session.user.id, data.date, data.hours, req.sanitize(data.info), data.type]),
      ]
      return t.batch(queries)
      })
      .then(function(data){
          res.redirect('/journal/' + parseInt(req.params.id))
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
        //t.any("SELECT * FROM horses WHERE person_id = $1;", [req.session.user.id])
      ]
      return t.batch(queries)
      })
      .then(function(data){
        let view_data = {
          name: data[0].name,
          id: data[0].id
          //journals: data[1]
        }
        res.render('logs/new', view_data);
      })
      .catch(function(){
        res.send('No journals yet.  Please <a href="/journals/">create a journal</a>')
      })
  else
    res.send('<a href="/">please log in</a>')
})


app.delete('/log/:id', function(req,res){
  if(req.session.user)
     db
      .one("DELETE FROM rides WHERE id = $1 returning horse_id;", [parseInt(req.params.id)])
      .then(function(deleted_ride){
        //console.log(deleted_ride.horse_id)
          res.redirect('/journal/' + deleted_ride.horse_id)
      })
      .catch(function(x){
        console.log('error deleting log', x)
        res.redirect('/')
      })
  else
    res.send('<a href="/">please log in</a>')
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

app.get('/signup/form', function(req, res){
  res.render('signup/form');
});


let createAccount = function(req, res, user){
  if (validator.isEmail(user.email) || user.password.length < 8)
  bcrypt
      .hash(user.password, 10, function(err, hash){

        db
        .one(
          "INSERT INTO persons (name, email, password) VALUES ($1, $2, $3) returning *;", [user.name, user.email, hash]
          )
        .then(function(user){
          console.log('account created')

          req.session.user = user
          //console.log('req.session.user=',req.session.user)
          res.redirect("/journals/new")
        })
        .catch(function(){
          console.log('error creating account')
          res.redirect('/')
        })
      })
  else
    res.render("signup/index", {err:"Invalid email or password"})
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
      createAccount(req, res, user_data)
    })
    .catch(function(){
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
    res.redirect("/")
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



/* STATS / GOOGLE CHARTS */

app.get('/stats/', function(req, res){
    if(req.session.user){
    db
      .tx(t => {
      let queries = [
        t.any("SELECT SUM(hours) as hours, date FROM rides GROUP BY date ORDER BY date ASC;"),
        t.any("SELECT SUM(hours) as hours, date FROM rides WHERE person_id = " + req.session.user.id + " GROUP BY date ORDER BY date ASC;"),
        t.any("SELECT SUM(hours) as hours, horses.name FROM rides JOIN horses ON rides.horse_id = horses.id WHERE rides.person_id = " + req.session.user.id + " GROUP BY horses.name ORDER BY hours ASC;")
      ]
      return t.batch(queries)
      })
      .then(function(data){
          let view_data = {
            logsPerDay: data[0].map(function(x){return "["+x.hours+", " + moment(x.date).format("YYYY, M, D")+"]"}),
            myLogsPerDay: data[1].map(function(x){return "["+x.hours+", " + moment(x.date).format("YYYY, M, D")+"]"}),
            myHoursPerJournal: data[2].map(function(x){return "["+x.hours+", \"" + x.name+"\"]"})
          }
          res.render('stats/index', view_data)
        }
      )
      .catch(function(){
        res.send('error')
      })
    }
    else
      res.send('<a href="/">please log in</a>')
});


app.get('/stats/users', function(req, res){
    db
      .tx(t => {
      let queries = [
        t.one("SELECT COUNT(*) AS count FROM persons;"),
        t.one("SELECT COUNT(*) AS count FROM horses;"),
        t.one("SELECT COUNT(*) AS count, SUM(hours) AS total_hours FROM rides;")
      ]
      return t.batch(queries)
      })
      .then(function(data){
          let view_data = {
            num_users: data[0].count,
            num_journals: data[1].count,
            num_logs: data[2].count,
            total_hours: data[2].total_hours
          }
          res.render('stats/users', view_data)
        }
      )
      .catch(function(){
        res.send('error')
      })
});


app.get('/logout', function(req, res){
    req.session.user = false
    res.render("index")
});

app.listen(3000, function () {
  console.log('HART App: listening on port 3000!');
});
