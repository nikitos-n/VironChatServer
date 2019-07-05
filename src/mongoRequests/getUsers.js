const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/VironChat', {
    useNewUrlParser: true
});

const User = require('../schemas/UsersMongo'); //Коллекция пользователей

module.exports = {
    getUsers(userEmail, res){
        User.find({email: {$ne: userEmail}}, {_id:0, uidPassword: 0})
        .then(result => {
        console.log(result);
        res.status(200).send(result);
        })
    }
}