//jshint esversion:6
/////// on the top dotenv////////
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');


const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

 mongoose.connect('mongodb+srv://Logio:'+process.env.PSW+'@cluster0.a75fhwm.mongodb.net/userDB?retryWrites=true&w=majority');

 const userSchema = new mongoose.Schema({
    email:String,
    password: String
 });


 /////// plugin(encrpt,{}) should be position before the Model//////////
 userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']});

 const User = new mongoose.model('User', userSchema);


app.get('/', function(req,res){
    res.render('home')
})
app.get('/login', function(req,res){
    res.render('login')
})
app.get('/register', function(req,res){
    res.render('register')
})


////////// Register and render to the secret page ///////
app.post('/register', function(req,res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save().then(() => {
            res.render('secrets');
            })
            .catch((err) => {
                console.log(err);
            })
});

////////  Login /////////////
    app.post('/login', function(req,res){
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({email: username}).then(( foundUser) => {
                if (foundUser) {
                    if (foundUser.password === password) {
                        res.render('secrets');
                    }
                }
            })
                .catch((err) => {
                    console.log(err);
                });
    });

app.listen(3000)