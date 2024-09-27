const jwt = require('jsonwebtoken');

const User = require('../models/users');
const { request } = require('express');

const  Authenticate = async (req, res, next) =>{
    try{
        const token = req.cookies?.jwtoken;

        // console.log(req.cookies);
        // console.log(token);
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(verifyToken);
        const rootUser = await User.findOne({ _id: verifyToken._id, "tokens.token": token });

        if(!rootUser){
            throw new Error('User not found');
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser._id;
        // res.status(200);

        next();

    } catch(err){
        res.status(401).json({message: 'Unauthorized: No token provided'});
        console.log(err);
    }
}

module.exports = Authenticate;