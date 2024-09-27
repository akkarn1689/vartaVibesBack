const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    username:{
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    cpassword: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    contactMessages: [],
    tokens: [],
});

// hash the passwords
userSchema.pre('save', async function (next) {
    // console.log("pre method called");
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        this.cpassword = await bcrypt.hash(this.cpassword, 12);
    }

    next();
});

// generate token
userSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
        // this.tokens = this.tokens.concat({ token: token });
        // this.tokens = this.tokens.push(token);
        // await this.save();
        return token;
    }
    catch (err) {
        console.log(err);
    }
}

// store the messages
userSchema.methods.addMessage = async function (message) {
    try {
        this.messages = this.messages.push({message});
        await this.save();
        return this.messages;
    } catch (err) {
        console.log(err);
    }
}

const User = mongoose.model('USERS', userSchema);
module.exports = User;