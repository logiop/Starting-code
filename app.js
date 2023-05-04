//jshint esversion:6
/////// on the top dotenv////////
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session= require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

////////////// express-session ////////
app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized :  false
}));

//////////////// passport ////////////
app.use(passport.initialize());
app.use(passport.session());

 mongoose.connect('mongodb+srv://Logio:'+process.env.PSW+'@cluster0.a75fhwm.mongodb.net/userDB?retryWrites=true&w=majority');

 const userSchema = new mongoose.Schema({
    email:String,
    password: String
 });

 userSchema.plugin(passportLocalMongoose);

 const User = new mongoose.model('User', userSchema);

/////////////////////// passportLocalMongoose //////////////////////
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())


app.get('/', function(req,res){
    res.render('home')
})
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



