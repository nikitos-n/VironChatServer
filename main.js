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
mongoose.connect('mongodb://localhost:27017/VironChat', {useNewUrlParser: true});

const User = require('./src/models/MongoConnect');

app.post('/', function (req, res) { //На Post запрос через axios декодируем токен и отправляем его на клиент
    const decodedToken = jwt.decode(req.body.tokenID);
    console.log(decodedToken);

    User.find({ email: decodedToken['email'] })
        .then(result => {
            if(Object.keys(result).length==0){
                console.log(result);
                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    name: decodedToken.name.split(' ')[0],
                    surname: decodedToken.name.split(' ')[1],
                    picture: decodedToken.picture,
                    email: decodedToken['email']
                });
            
                user.save()
                    .then(result => {console.log(result)})
                    .catch(err => {console.log(err)});
            }
        })
        .catch(err => {console.log(err)});

    res.status(200).send(decodedToken);
});


app.post('/getUSERS', function(req, res) {//Принимаем запрос, извлекаем пользователей и отправляем обратно
    console.log(req.body);
    User.find({email: {$ne: req.body.myEmail}})
        .then(result => {
            console.log(result);
            res.status(200).send(result);
        })
})


server.listen(3001, () => {
    console.log('listening on port 3001');
});

io.sockets.on('connection', (socket) => {
    socket.on('addUserEmail', (data) => {console.log(`Успешное соединение с ${data}`)});
    socket.on('disconnect', () => {
        console.log('Успешное отсоединение!');
    });
});