const mongoose = require('mongoose');

const ChatRoomsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    members: [String]
});

module.exports = mongoose.model('ChatRoom', ChatRoomsSchema);