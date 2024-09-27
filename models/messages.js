const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
   sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
   },
   receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
   },
   text: String,
   file: {
      name: String,
      url: String,
   },
   time: String,
}, {timestamps: true});

module.exports = mongoose.model("MessageModel",messageSchema);