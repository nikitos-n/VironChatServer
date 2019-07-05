const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/VironChat', {
    useNewUrlParser: true
});

const User = require('../schemas/UsersMongo'); //Коллекция пользователей

module.exports = {
    checkUser(incomingUser, res){
        User.find({email: incomingUser['email'], uidPassword: incomingUser['hashedPassword']}, {_id:0, uidPassword: 0})
            .then(result => {
                if (Object.keys(result).length == 0) {
                    console.log('Authentication failed');
                    const notpassed = 'Authentication failed';
                    res.status(200).send(notpassed);
                }
                else{
                    console.log('Authentication passed');
                    const passed = 'Authentication passed';
                    res.status(200).send(result);
                }
            })
            .catch(err => {
                console.log(err)
            })
    }
}