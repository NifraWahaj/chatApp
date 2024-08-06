const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const socketIo = require('socket.io');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors'); 
const bodyParser = require('body-parser');
const authRoute = require('./routes/auth');
const cookieParser = require('cookie-parser');
const User = require('./models/User'); 
const chatRequest = require('./models/chatRequest');
const Message = require('./models/Message');
const Chat = require('./models/Chat');
const join = require('node:path');
const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true
}));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 5000, 
     },
     sameSite: 'lax'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use("/auth", authRoute);
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

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3001/auth/google/callback',
    scope: ['profile', 'email'],
    passReqToCallback: true 
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await User.findOne({ email: profile.emails[0].value });
        if (existingUser) {
            req.session.email = existingUser.email;
            req.session.id = existingUser._id;
            return done(null, existingUser);
        }
        const newUser = new User({ googleId: profile.id, name: profile.displayName, email: profile.emails[0].value });
        await newUser.save();
        req.session.email = newUser.email;
        req.session.id = newUser._id;
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
    res.sendFile(join(__dirname, 'index.html'));
});

app.post('/signup', async (req, res) => {
    try{
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists', loginStatus: false });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();

        req.session.email = newUser.email;
        req.session.id = newUser._id;
    
        res.status(201).json({ message: 'User created successfully!', loginStatus: true });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Email already in use', loginStatus: false });
        }
        res.status(500).json({ error: 'Error creating user', loginStatus: false });
    }
});

app.post('/login', async (req, res) => {
    try{
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({ error: 'Invalid email', loginStatus: false});
        }
        if(existingUser.googleId){
            req.session.id = existingUser._id;
            req.session.email = existingUser.email;
            res.status(201).json({ message: 'User Logged In successfully!', loginStatus: true});
        }

        if (existingUser.password !== password) {
            return res.status(400).json({ error: 'Invalid password', loginStatus: false});
        }

        req.session.id = existingUser._id;
        req.session.email = existingUser.email;
        res.status(201).json({ message: 'User Logged In successfully!', loginStatus: true});
    } catch (error) {
        res.status(500).json({ error: 'Error Logging In user', loginStatus: false});
    }
});

app.get('/get-user', async (req, res) => {
    try{
        if(!req.session.email){
            return res.status(401).json({ error: 'Not authenticated' });
        }
        res.status(200).json({ email: req.session.email });
    } catch(error){
        res.status(400).json({ error: 'Error getting user' });
    }
});

app.get('/all-users', async (req, res) => {
    try {
        const loggedInEmail = req.session.email;
        const users = await User.find({ email: { $ne: loggedInEmail }}, '-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

app.post('/send-chat-request', async (req, res) => {
    const { to } = req.body;
    const from = req.session.email;

    if (!from) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const fromUser = await User.findOne({ email: from });
        const toUser = await User.findOne({ email: to });

        if (!fromUser || !toUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (fromUser.friends.includes(to)) {
            return res.status(400).json({ message: 'Already friends with this user' });
        }

        const existingRequest = await chatRequest.findOne({ from, to });
        if (existingRequest) {
            return res.status(400).json({ message: 'Chat request already sent' });
        }

        const newRequest = new chatRequest({ from, to });
        await newRequest.save();

        res.status(200).json({ message: 'Chat request sent' });
    } catch (error) {
        res.status(500).json({ error: 'Error sending chat request' });
    }
});


 app.get('/get-chat-requests', async (req, res) => {
    const  email = req.session.email;
    if (!email) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try{
        const requests = await chatRequest.find({to: email, status: 'pending'});
        res.status(200).json(requests);
    } catch(error){
        res.status(500).json({error: 'Failed to get chat requests'});
    }
});

app.post('/accept-chat-request', async (req, res) => {
    const { to, from, id } = req.body;

    try {
        const request = await chatRequest.findByIdAndUpdate(
            id,
            { status: 'accepted' },
            { new: true }
        );

        if (!request) {
            return res.status(400).json({ error: 'Request not found' });
        }

        const userFrom = await User.findOne({ email: from });
        const userTo = await User.findOne({ email: to });
        
        if (!userFrom) {
            return res.status(404).json({ error: 'User from not found' });
        }
        
        if (!userTo) {
            return res.status(404).json({ error: 'User to not found' });
        }
        
        if (userFrom.friends.includes(to)) {
            return res.status(400).json({ error: 'Already friends with this user' });
        }
        
        if (userTo.friends.includes(from)) {
            return res.status(400).json({ error: 'User is already friends with you' });
        }
        
        userFrom.friends.push(to);
        userTo.friends.push(from);
        
        await userFrom.save({ validateModifiedOnly: true });
        await userTo.save({ validateModifiedOnly: true });
    
        const deleteRequest = await chatRequest.findByIdAndDelete(id);
        if(! deleteRequest){
            return res.status(400).json({error: 'Request not found'});
        }
        res.status(200).json({ message: 'Chat request accepted' });
    } catch (error) {
        res.status(500).json({ error: 'Error accepting chat request' });
    }
});

app.post('/reject-chat-request', async (req, res) => {
    const { to, id } = req.body;
    const from = req.session.email; 

    if (!from) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const request = await chatRequest.findOneAndUpdate(
            { from: to, to: from, status: 'pending' },
            { status: 'rejected' },
            { new: true }
        );

        if (!request) {
            return res.status(400).json({ error: 'No pending request found' });
        }

       const deleteRequest = await chatRequest.findByIdAndDelete(id);
       if(! deleteRequest){
            return res.status(400).json({error: 'Request not found'});
       }
        res.status(200).json({ message: 'Chat request rejected' });
    } catch (error) {
        res.status(500).json({ error: 'Error rejecting chat request' });
    }
});

app.get('/get-friends', async (req, res) => {
    const email = req.session.email;

    if (!email) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const friends = await User.find({ email: { $in: user.friends } });
        res.status(200).json(friends);
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ error: 'Error fetching friends' });
    }
});

const server = app.listen(port, (error) => {
    if (error) {
        console.log(error);
    }
    console.log(`Example app listening at http://localhost:${port}`);
});

//Server = sc
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000', 
        methods: ['GET', 'POST']
    }
});

const users = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join room', (chatId) => {
        socket.join(chatId);
        console.log(`User joined room: ${chatId}`);
    });

    socket.on('chat message', async (msg) => {
        console.log('Received message:', msg);

        const messageWithTimestamp = {
            content: msg.content,
            chatId: msg.chatId,
            sender: msg.sender,
            timestamp: new Date()  
        };

        try {
            const updateResult = await Chat.updateOne(
                { _id: msg.chatId },
                { $push: { messages: messageWithTimestamp } }
            );

            if (updateResult.nModified === 0) {
                console.error('Chat not found or no update made');
            }
            
            io.to(msg.chatId).emit('chat message', messageWithTimestamp);
        } catch (error) {
            console.error('Error saving message to database:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

app.post('/create-or-fetch-chat', async (req, res) => {
    const { participants } = req.body;

    if (!participants || participants.length < 2) {
        return res.status(400).json({ error: 'At least two participants required' });
    }

    try {
        let chat = await Chat.findOne({ participants: { $all: participants } });

        if (!chat) {
            chat = new Chat({ participants });
            await chat.save();
        }

        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ error: 'Error creating or fetching chat' });
    }
});


