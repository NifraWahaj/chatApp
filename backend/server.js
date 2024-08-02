const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const bodyParser = require('body-parser');

const User = require('./model'); 

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

require('dotenv').config();
const connectDB = async() =>{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        console.log(error);
    }
    console.log(`Connected to MongoDB ${mongoose.connection.host}`);
}

connectDB();

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

app.listen(port, (error) => {
    if (error) {
        console.log(error);
    }
    console.log(`Example app listening at http://localhost:${port}`);
});