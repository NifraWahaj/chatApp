const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
//const cookieSession = require('cookie-session');
const session = require('express-session');
const cors = require('cors'); 
const bodyParser = require('body-parser');
const authRoute = require('./routes/auth');

const User = require('./model'); 

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Set to true if using HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use("/auth", authRoute);

require('dotenv').config();

// app.use(cookieSession({
//     maxAge: 24 * 60 * 60 * 1000,
//     keys: [process.env.COOKIE_KEY]
// }));




const connectDB = async() =>{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        console.log(error);
    }
    console.log(`Connected to MongoDB ${mongoose.connection.host}`);
}

connectDB();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3001/auth/google/callback',
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await User.findOne({ email: profile.emails[0].value });
        if (existingUser) {
            console.log("User already exists: ", existingUser.email);
            return done(null, existingUser);
        }
        const newUser = new User({ googleId: profile.id, name: profile.displayName, email: profile.emails[0].value });
        await newUser.save();
        done(null, newUser);
    } catch (error) {
        done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err, null);
        });
});

app.get('/', async (req, res) => {
    console.log("hello world");
});

app.post('/signup', async (req, res) => {
    try{
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();
        console.log('User created successfully!');
        res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        res.status(500).json({ error: 'Error creating user' });
    }
});

app.post('/login', async (req, res) => {
    try{
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        console.log(existingUser.email, existingUser.password, existingUser.googleId);
        if (!existingUser) {
            return res.status(400).json({ error: 'Invalid email' });
        }
        if(existingUser.googleId){
            res.status(201).json({ message: 'User Logged In successfully!' });
        }

        if (existingUser.password !== password) {
            return res.status(400).json({ error: 'Invalid password' });
        }
        res.status(201).json({ message: 'User Logged In successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Error Logging In user' });
    }
});

app.listen(port, (error) => {
    if (error) {
        console.log(error);
    }
    console.log(`Example app listening at http://localhost:${port}`);
});