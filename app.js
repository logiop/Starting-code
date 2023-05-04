//jshint esversion:6
/////// on the top dotenv////////
require('dotenv').config(); // Per caricare le variabili d'ambiente da un file .env
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session= require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


const app = express();

app.use(express.static('public')); // Middleware per servire file statici nella cartella public
app.set('view engine', 'ejs'); // Imposta EJS come view engine
app.use(bodyParser.urlencoded({ extended:true })); // Middleware per analizzare il corpo delle richieste POST

////////////// express-session ////////
app.use(session({
    secret: 'Our little secret.', // Chiave segreta per crittografare la sessione
    resave: false, // Flag che indica se salvare nuovamente la sessione ad ogni richiesta
    saveUninitialized :  false // Flag che indica se salvare una sessione vuota o meno
}));

//////////////// passport ////////////
app.use(passport.initialize()); // Middleware per inizializzare Passport
app.use(passport.session()); // Middleware per gestire la sessione di Passport

mongoose.connect('mongodb+srv://Logio:'+process.env.PSW+'@cluster0.a75fhwm.mongodb.net/userDB?retryWrites=true&w=majority'); // Collegamento al database

const userSchema = new mongoose.Schema({ // Definizione dello schema del modello User
    email:String,
    password: String,
    googleId: String
});

userSchema.plugin(passportLocalMongoose); // Plugin per semplificare l'utilizzo di Passport con Mongoose
userSchema.plugin(findOrCreate); // Plugin per semplificare la ricerca e creazione di un utente con Mongoose

const User = new mongoose.model('User', userSchema); // Definizione del modello User

/////////////////////// passportLocalMongoose //////////////////////
passport.use(User.createStrategy()); // Imposta l'utilizzo di Passport con la strategia di autenticazione locale

passport.serializeUser(function(user, cb) { // Serializzazione dell'utente per salvarlo nella sessione di Passport
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture
      });
    });
});

passport.deserializeUser(function(user, cb) { // Deserializzazione dell'utente dalla sessione di Passport
    process.nextTick(function() {
      return cb(null, user);
    });
});

passport.use(new GoogleStrategy({ // Configurazione della strategia di autenticazione con Google
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"   // URL del profilo utente Google
  },
  function(accessToken, refreshToken, profile, cb) { // Callback eseguita dopo l'autenticazione con Google
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get('/', function(req,res){
    res.render('home')
})

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', //////'/auth/google/callback' have to corrisponde to the URI that we put on the Authorized redirect in Google/////////
  passport.authenticate('google', { failureRedirect: "/login" }), //// autenticazione
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });


app.get('/login', function(req,res){
    res.render('login')
})
app.get('/register', function(req,res){
    res.render('register')
})

app.get('/secrets', (req,res) => {
    if (req.isAuthenticated()){
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });



////////// register ///////////
app.post('/register', function(req,res){
    User.register({username: req.body.username}, req.body.password, (err,user) => {
        if (err){
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req,res, () => {
                res.redirect('secrets')
            });
        }
    });
    });

////////  Login /////////////
    app.post('/login', function(req,res){
    
        const user = new User({
            username: req.body.username,
            password: req.body.password
        })
        req.login(user, (err) =>{          ///////passport method/////////
            if (err) {
                console.log(err);
            } else {
                passport.authenticate('local')(req,res, () => {
                    res.redirect('secrets')
                });
            }
        })
    });
app.listen(3000)





