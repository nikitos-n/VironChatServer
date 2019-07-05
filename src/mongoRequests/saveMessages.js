const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/VironChat', {
    useNewUrlParser: true
});

const Messages = require('../schemas/MessagesMongo'); //Коллекция пользователей
const User = require('../schemas/UsersMongo');
const ChatRoom = require('../schemas/ChatRoomsMongo'); //Коллекция Чат-Комнат


module.exports = {
    saveMessages(messageData, socketStoreConnections, io) {
        const membersEmail = messageData.slice(1, messageData.length - 1); //Члены чата
        // console.log(membersEmail);
        const key = messageData[messageData.length - 1]; //Человек, отправивиший сообщение
        const recipient = membersEmail.filter(value => value!=key);//Получатель сообщения
        const textMessage = messageData[0]; //Текст сообщения
        const messageText = [key, textMessage, ...recipient]; //Автор, текста сообщения, получатель
        // console.log(messageText);
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
                    }, {
                        _id: 1 //Извлекаем только id
                    })
                    .then(result => {
                        // console.log(result[0].id);
                        const primaryKey = result[0]._id;
                        const message = new Messages({
                            _id: new mongoose.Types.ObjectId(),
                            chatRoomId: primaryKey,
                            messages: messageText
                        });
                        message.save()
                            .then(result => {
                                console.log(`Created a message ${result.messages}`);
                                const goodSockets = socketStoreConnections.filter(value => membersEmail.includes(value.id));
                                // console.log(socketStoreConnections);
                                // console.log(goodSockets[0].client);

                                for (let i in goodSockets) {//Отсылаем назад тем, кто онлайн
                                    console.log(i);
                                    goodSockets[i].client.emit('sendMessageBack', result.messages);
                                }

                            })
                            .catch(err => {
                                console.log(err);
                            });
                    })
            })
    }
}