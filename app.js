//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

 mongoose.connect('mongodb+srv://Logio:u1LK6WLeFqi9o8Z6@cluster0.a75fhwm.mongodb.net/userDB?retryWrites=true&w=majority');

 const userSchema = {
    email:String,
    password: String
 };

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