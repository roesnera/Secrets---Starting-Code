require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

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


// USERDBKEY set in .env file and compiled into environment variables using dotenv package
// const secret = process.env.USERDBKEY;
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] })

// console.log(process.env.USERDBKEY)

const User = mongoose.model("User", userSchema);

app.get('/', function(req, res) {
    res.render('home');
});

app.get('/login', function(req, res){
    res.render('login');
});

app.post('/login', function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, function(err, foundName){
        if(err){
            console.log(err);
            res.render('login');
        } else {
            if(foundName){
                bcrypt.compare(password, foundName.password, function(err, result){
                    if(result===true){
                        res.redirect('secrets');
                    } else {
                        res.render('login');
                    }
                })
            } else {
                res.render('login');
            }
        }
    });
    // res.render('login');
})

app.get('/register', function(req, res){
    res.render('register');
});

app.post('/register', function(req, res){

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.

        const newUser = new User({
            email: req.body.username,
            password: hash
        });
    
        newUser.save(function(err){
            if(err){
                console.log(err);
            } else {
                res.redirect('/secrets');
            }
        })
    });

    
});

app.get('/secrets', function(req,res){
    res.render('secrets');
})

app.listen(3000, function() {
    console.log('Server lsitening on port 3000')
})