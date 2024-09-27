const mongoose = require('mongoose');

const dbURL = process.env.dbURL || 'mongodb://127.0.0.1:27017/vartavibes';

mongoose.connect(dbURL)
    .then(() => {
        console.log('Database Connected');
    })
    .catch((err) =>{
        console.log("Database Error: " + err);
    })