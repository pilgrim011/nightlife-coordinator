var express = require('express');
var http = require("http");
var path = require('path');
var nodemon = require("nodemon");
var bodyParser = require("body-parser");
var yelp = require("yelp-fusion");
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var cel = require('connect-ensure-login');
var session = require('express-session');

//use passport for auth
passport.use(new Strategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: '/login/facebook/return'
},
function(accessToken, refreshToken, profile, cb) {
  return cb(null, profile);
}));
passport.serializeUser(function(user, cb) {
  cb(null, user);
});
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
var client = yelp.client("2a5yI5FtqylC_qq1cA4toLPnnsPE6DLWozgPp38pvTxcHQfRGdE4KS3P8HNNallAxo-5V4Cqx_Us2VcLQvHAtNBZwYrKFSOFGRuPBoNVCQi02Qkkyj8tKP3-uxZMWXYx");
// Create a new Express application.
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());
app.get('/favicon.ico', function(req, res) {
  res.sendStatus(204);
});
// Define routes.
app.get('/search', function(req, res) {
  var sess = req.session;
  console.log(req.query.search);
  sess.que = req.query.ID;
  res.locals.isLogged = req.isAuthenticated();
  var id = req.query.search;
  res.locals.id = id;
  client.search({
    term: 'bars',
    location: id
  }).then(function (response) {
    console.log(response.jsonBody.businesses);
    res.locals.results = response.jsonBody.businesses;
    if(typeof req.user !=="undefined"){
      console.log(req.user.provider);
      res.locals.provider = req.user.provider;
    }
    res.render("search");
  })
  .catch(function (err) {
    console.error(err);
    res.send("Could not execute search, try specifying a more exact location.");
  });
});
app.get('/login/facebook',
passport.authenticate('facebook'));
app.get('/login/facebook/return',
passport.authenticate('facebook', { failureRedirect: '/failure' }),
cel.ensureLoggedIn(),
function(req, res) {
  var sess = req.session;
  var redirSearch = req.headers.referer;
  res.locals.currentUser = req.user.displayName;
  res.locals.isLogged = req.isAuthenticated();
  res.redirect(redirSearch);
});
app.get('/', function(req, res) {
  var sess = req.session;
  res.locals.que = sess.que;
  if(typeof req.user !=="undefined"){
    console.log(req.user.provider);
    res.locals.provider = req.user.provider;
  }
  res.locals.isLogged = req.isAuthenticated();
  res.render("index");
});
app.use(function (req, res, next) {
  res.status(404);
  res.send('404: Page not found!');
});
app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500).send({status:500, message: 'internal error', type:'internal'});
});
app.listen(process.env.PORT || 5000);
console.log("Server running at http://localhost:5000/");
