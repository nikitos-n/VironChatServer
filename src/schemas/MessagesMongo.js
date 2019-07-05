const mongoose = require('mongoose');

const MessagesSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    chatRoomId: String,
    messages: []
});

module.exports = mongoose.model('Messages', MessagesSchema);