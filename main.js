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

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/VironChat', {
    useNewUrlParser: true
});

//Запросы
const insertUser = require('./src/mongoRequests/insertUser').insertUser;
const checkUser = require('./src/mongoRequests/checkUser').checkUser;
const getUsers = require('./src/mongoRequests/getUsers').getUsers;
const createRoom = require('./src/mongoRequests/createRoom').createRoom;
const getRooms = require('./src/mongoRequests/getRooms').getRooms;
const saveMessages = require('./src/mongoRequests/saveMessages').saveMessages;

//Регистрация пользователя
app.post('/RegistrationUser', function(req, res) {
    console.log(req.body);
    const {name, surname, email, picture, hashedPassword} = req.body;
    const Person = {
        name: name + ' ' + surname,
        email: email, 
        aud: hashedPassword,
        picture: picture,
        authorizationType: 'systemLogIn'
    }
    insertUser(Person, res); 
})


//Авторизация через Google
app.post('/GoogleLogIN', function (req, res) {
    console.log(req.body.tokenID);
    const decodedToken = jwt.decode(req.body.tokenID);
    const authorizationType = 'GoogleLogIn';
    decodedToken.authorizationType=authorizationType;//Сформировали обьект для базы
    insertUser(decodedToken, res);//Запорос на добавление(обновление)
 
});


//Авторизация через Facebook
app.post('/FacebookLogIn', function(req, res) {
    const token = req.body.tokenID;
    const picture = token.picture.data.url;
    const {name, email, userID} = token;
    const Person = {name, email, picture};//Сформировали обьект для базы
    Person.aud=userID
    const authorizationType = 'FacebookLogIn';
    Person.authorizationType=authorizationType;
    insertUser(Person, res);//Запорос на добавление(обновление)

    console.log(Person);
})


//Аутентификация пользователя
app.post('/CheckingUser', function(req, res) {
    console.log(req.body);
    const incomingUser = req.body;
    checkUser(incomingUser, res);
})


app.get(`/getUSERS/:userEmail`, function (req, res) { //Принимаем запрос, извлекаем пользователей и отправляем обратно
    const userEmail = req.params.userEmail;
    getUsers(userEmail, res);
})

app.post('/createROOM', function (req, res) { //Принимаем завпрос, и создаем Чат-Комнату, если не была создана ранее
    console.log(req.body.membersEmail);
    const membersEmail = req.body.membersEmail;
    createRoom(membersEmail, res);
})

app.get(`/getROOMS/:myEmail`, function (req, res) { //Принимаем запрос, извлекаем комнаты и отправляем обратно
    // console.log(req.params.myEmail);
    const myEmail = req.params.myEmail;
    getRooms(myEmail, res);
})

const socketStoreConnections = [];

io.sockets.on('connection', (socket) => {

    socket.on('id', (data) => {
        socketStoreConnections.push({
            client: socket,
            id: data
        });
        // console.log(socketStoreConnections);
    })

    socket.on('addUserEmail', (data) => {
        console.log(`Successful connection with ${data}`)
    });

    io.sockets.on('disconnect', () => {
        console.log('Connection broken!');
    });

    socket.on('messageText', (data) => {//Обработка пересланного сообщения
        // console.log(data);
        saveMessages(data, socketStoreConnections, io);
    })
    
});

server.listen(3001, () => {
    console.log('listening on port 3001');
});