const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

require('../db/connection');
const User = require('../models/users');
const MessageModel = require('../models/messages');
const authenticate = require("../middleware/authenticate");

router.get('/', (req, res) => {
    res.send("Hello! from router")
});

// to fetch messages from the database
router.get('/messages/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const userData = req.rootUser;
    const userId = userData._id;

    if(id && userId){
        const messagesData = await MessageModel.find({
            $and:[
                { sender: { $in: [id, userId] }},
                { receiver: { $in: [id, userId] }},
            ]
        }).sort({ createdAt: 1 });

        res.send(messagesData);
    }
    else{
        res.send("error");
    }
    
})

// Using Promises
// router.post('/register', (req, res) => {

//     const { name, email, password, cpassword } = req.body;
//     console.log(req.body);

//     if (!name || !email || !password || !cpassword) {
//         return res.status(422).json({ error: "please fill the fields properly" });
//     }

//     User.findOne({ email: email })
//         .then((userExist) => {
//             if (userExist) {
//                 return res.status(422).json({ error: "Email already exists" });
//             }

//             const user = new User({ name, email, password, cpassword });

//             user.save().then(() => {
//                 res.status(201).json({ message: "user registered successfully" });
//             }).catch((err) => res.status(500).json({ error: "Failed to register" }));

//         })
//         .catch((err) => {
//             console.log(err);
//         });
// });

// Using Async Await
router.post('/register', async (req, res) => {

    const { name, email, username, password, cpassword } = req.body;
    // console.log(req.body);

    if (!name || !email || !username || !password || !cpassword) {
        return res.status(422).json({ error: "please fill the fields properly" });
    }

    try {
        const userEmail = await User.findOne({ email: email });
        const userUsername = await User.findOne({ username: username });

        if (userEmail) {
            return res.status(422).json({ error: "Email already exists" });
        }
        else if (userUsername) {
            return res.status(422).json({ error: "Username already exists" });
        } else if (password !== cpassword) {
            return res.status(422).json({ error: "Password are not matching" });
        } else {
            const user = new User({ name, email, username, password, cpassword });

            const userRegistered = await user.save();

            if (userRegistered) {
                res.status(201).json({ message: "user registered successfully" });
            } else {
                res.status(500).json({ error: "Failed to register" });
            }
        }
    }
    catch (err) {
        console.log(err);
    }
});

// login route
router.post('/signin', async (req, res) => {
    try {
        let token;
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Please fill the required fields" });
        }

        const userLogin = await User.findOne({ email: email });

        // console.log(userLogin);

        if (userLogin) {
            const isMatch = await bcrypt.compare(password, userLogin.password);


            if (isMatch) {
                token = await userLogin.generateAuthToken();
                // console.log(token);
                userLogin.tokens.push({ token }); // Store token in user's tokens array
                await userLogin.save();

                res.cookie("jwtoken", token, {
                    expires: new Date(Date.now() + 604800000), // 604800000 store the token in cookies for 1 month
                    httpOnly: true,
                    sameSite: 'none',
                    secure: true,
                });
                res.status(200).json({ message: "user loged in successfully!" });
            }
            else {
                res.status(400).json({ error: "Invalid credentials! pass" });
            }
        }
        else {
            res.status(400).json({ error: "Invalid credentials!" });
        }



    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get('/about', authenticate, (req, res) => {
    res.send(req.rootUser);
});

// get user data for contact us
router.get('/getdata', authenticate, (req, res) => {
    res.send(req.rootUser);
});

// save contact data
router.post('/contact', authenticate, async (req, res) => {
    try {

        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            console.log("All the fields are not filled");
            return res.json({ error: "please fill the contact form" });
        }

        const userContact = await User.findOne({ _id: req.userId });

        if (userContact) {

            userContact.messages.push({ message }); // Store token in user's tokens array
            await userContact.save();

            res.status(201).json({ message: "message saved" })
        }

    } catch (err) {
        console.log(err);
    }
});

router.get('/logout', authenticate, (req, res) => {
    // console.log("My logout page");
    res.clearCookie('jwtoken', { path: '/' });
    res.status(200).send('User logged out');
});

module.exports = router;