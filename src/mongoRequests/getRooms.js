const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/VironChat', {
    useNewUrlParser: true
});

const User = require('../schemas/UsersMongo'); //Коллекция пользователей
const ChatRoom = require('../schemas/ChatRoomsMongo'); //Коллекция Чат-Комнат


module.exports = {
    getRooms(myEmail, res) {
        User.find({
                email: myEmail //Ищем себя
            }, {
                email: 1, //Достаем только email
            })
            .then(result => {
                const exceptionValue = result[0].email; //Наше мыло
                // console.log(exceptionValue);
                ChatRoom.find({
                        members: exceptionValue
                    }, {
                        members: 1 //Ищем остальных членов комнаты
                    })
                    .then(result => { //Все пользователи, с которыми текущий создал Чат
                        // console.log(result);
                        var dataToSend = [];
                        for (let i in result) {
                            // console.log(result[i].members);
                            for (let j in result[i].members) { //Рассматриваем текущий чат
                                if (result[i].members[j] !== exceptionValue) {
                                    // console.log(result[i].members[j]);
                                    dataToSend.push(result[i].members[j]);
                                }
                            }
                        }
                        dataToSend=dataToSend.filter(value => value.length!==0);
                        // console.log(dataToSend);


                        User.find({
                                email: {
                                    $in: dataToSend
                                }
                            })
                            .then(result => {
                                console.log(result);
                                res.status(200).send(result);
                            })
                    })
            })
    }
}