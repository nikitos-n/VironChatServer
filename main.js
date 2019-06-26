const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const server = require('http').createServer(app);
const jwt = require('jsonwebtoken');

const io = require('socket.io').listen(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.use(cors());

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/VironChat', {
    useNewUrlParser: true
});

const User = require('./src/models/UsersMongo'); //Коллекция пользователей
const ChatRoom = require('./src/models/ChatRoomsMongo'); //Коллекция Чат-Комнат

app.post('/', function (req, res) { //На Post запрос через axios декодируем токен и отправляем его на клиент
    const decodedToken = jwt.decode(req.body.tokenID);
    console.log(decodedToken);

    User.find({
            email: decodedToken['email']
        }) //Проверяем заходил ли ранее пользователь
        .then(result => {
            if (Object.keys(result).length == 0) {
                console.log(result);
                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    name: decodedToken.name.split(' ')[0],
                    surname: decodedToken.name.split(' ')[1],
                    picture: decodedToken.picture,
                    email: decodedToken['email']
                });

                user.save()
                    .then(result => {
                        console.log(result)
                    })
                    .catch(err => {
                        console.log(err)
                    });
            }
        })
        .catch(err => {
            console.log(err)
        });

    res.status(200).send(decodedToken);
});


app.get(`/getUSERS/:userEmail`, function (req, res) { //Принимаем запрос, извлекаем пользователей и отправляем обратно
    console.log(req.params.userEmail);
    User.find({
            email: {
                $ne: req.params.userEmail
            }
        })
        .then(result => {
            console.log(result);
            res.status(200).send(result);
        })
})

app.post('/createROOM', function (req, res) { //Принимаем завпрос, и создаем Чат-Комнату, если не была создана ранее
    console.log(req.body.membersEmail);

    User.find({
            email: {
                $in: req.body.membersEmail
            }
        }, {
            _id: true
        })
        .then(result => {
            const membersArr = [];
            for (let i in result) {
                membersArr.push(result[i]._id);
            }

            ChatRoom.find({
                    members: membersArr
                })
                .then(result => {
                    if (Object.keys(result).length == 0) { //Проверяемс сушествуют ли уже такие комнаты
                        const chatroom = new ChatRoom({
                            _id: new mongoose.Types.ObjectId(),
                            members: membersArr
                        });

                        chatroom.save()
                            .then(result => {
                                console.log(`Создали Чат-Комнату ${result}`);
                                res.status(200).send(result);
                            })
                            .catch(err => {
                                console.log(err)
                            });
                    } else {
                        console.log('Такая Чат-Комната уже существует!');
                        res.status(200).send(result);
                    }
                })

        })
})

app.get(`/getROOMS/:myEmail`, function (req, res) { //Принимаем запрос, извлекаем комнаты и отправляем обратно
    // console.log(req.params.myEmail);
    User.find({
            email: req.params.myEmail
        }, {
            _id: true
        })
        .then(result => {
            const exceptionValue = result[0]._id;
            console.log(exceptionValue);
            ChatRoom.find({
                    members: exceptionValue
                }, {
                    members: true
                }) //Ищем остальных членов комнаты
                .then(result => { //Все пользователи, с которыми текущий создал Чат
                    // console.log(result)
                    const dataToSend = [];
                    for (let i in result) {
                        // console.log(result[i].members);
                        for (let j in result[i].members) {
                            if (result[i].members[j] != exceptionValue) {
                                console.log(result[i].members[j]);
                                dataToSend.push(result[i].members[j]);
                            }
                        }
                    }

                    console.log(dataToSend);
                    User.find({
                            _id: {
                                $in: dataToSend
                            }
                        })
                        .then(result => {
                            console.log(result);
                            res.status(200).send(result);
                        })
                })
        })
})


io.sockets.on('connection', (socket) => {
    socket.on('addUserEmail', (data) => {
        console.log(`Успешное соединение с ${data}`)
    });
    socket.on('disconnect', () => {
        console.log('Успешное отсоединение!');
    });
});

server.listen(3001, () => {
    console.log('listening on port 3001');
});