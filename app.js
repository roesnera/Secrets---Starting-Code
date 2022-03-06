require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

const yourDB = 'userDB';
const url = `mongodb://localhost:27017/${yourDB}`;
mongoose.connect(url);

const userSchema = mongoose.Schema({
    email: {
        type: String
    },
    password: {
        type: String
    }
});

userSchema.plugin(passportLocalMongoose);

// USERDBKEY set in .env file and compiled into environment variables using dotenv package
// const secret = process.env.USERDBKEY;
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] })

// console.log(process.env.USERDBKEY)

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req, res) {
    res.render('home');
});

app.get('/login', function(req, res){
    res.render('login');
});

app.post('/login', function(req, res){
    
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        } else {
            passport.authenticate('local')(req,res, function(){
                res.redirect('/secrets');
            })
        }
    })
})

app.get('/register', function(req, res){
    res.render('register');
});

app.post('/register', function(req, res){

    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req,res, function(){
                res.redirect('/secrets')
            })
        }
    })

});

app.get('/secrets', function(req,res){
    if(req.isAuthenticated()){
        res.render('secrets');
    } else {
        res.redirect('/login')
    }
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
})

app.listen(3000, function() {
    console.log('Server lsitening on port 3000')
})