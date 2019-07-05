const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/VironChat', {
    useNewUrlParser: true
});

const User = require('../schemas/UsersMongo'); //Коллекция пользователей
const ChatRoom = require('../schemas/ChatRoomsMongo'); //Коллекция Чат-Комнат

module.exports = {
    createRoom(membersEmail, res) {
        User.find({
                email: {
                    $in: membersEmail //Находим пользователей, у котрых email совпадате с email членов чата
                }
            }, {
                email: true //Извлекаем только email пользователей
            })
            .then(result => {
                // console.log(result);
                const membersArr = [];
                result.map((value) => {
                    membersArr.push(value.email);
                })
                // console.log(membersArr);
                ChatRoom.find({
                        members: membersArr //Проверяем существет ли такая комната уже
                    })
                    .then(result => {
                        console.log(result);
                        if (result.length == 0) { //Проверяемс сушествуют ли уже такие комнаты
                            console.log(result.length);
                            const chatroom = new ChatRoom({
                                _id: new mongoose.Types.ObjectId(),
                                members: membersArr
                            });

                            chatroom.save()
                                .then(result => {
                                    console.log(`Created a chat room ${result}`);
                                    res.status(200).send(result);
                                })
                                .catch(err => {
                                    console.log(err)
                                });
                        } else {
                            console.log('This chat room has already been created!'); //Если комната сущестует
                            res.status(200).send(result);
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    });
            })
            .catch(err => {
                console.log(err)
            });
    }
}