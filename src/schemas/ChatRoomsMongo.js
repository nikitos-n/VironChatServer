const mongoose = require('mongoose');

const ChatRoomsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    members: [String],
    messages: []
});

module.exports = mongoose.model('ChatRoom', ChatRoomsSchema);