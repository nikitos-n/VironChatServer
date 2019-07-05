const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/VironChat', {
    useNewUrlParser: true
});

const User = require('../schemas/UsersMongo'); //Коллекция пользователей

module.exports = {
    insertUser(person, res) {
        User.find({email: person['email']}, {_id:0, uidPassword: 0}) //Проверяем заходил ли ранее пользователь
            .then(result => {
                
                if (Object.keys(result).length == 0) {//Если ранее не посещали
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        name: nameParser(person.name)[0],
                        surname: nameParser(person.name)[1],
                        picture: person.picture,
                        uidPassword: person['aud'],
                        email: person['email'],
                        authorizationType: person['authorizationType']
                    }); 

                    user.save()
                        .then(result => {
                            console.log(result)
                        })
                        .catch(err => {
                            console.log(err)
                        });
                    const {name, surname, picture, email} = person;
                    const personToSend = {name, surname, picture, email};
                    res.status(200).send(personToSend);
                }

                else if(person.authorizationType === 'systemLogIn') {
                    const warn = 'User with such email has already registrated!';
                    console.log(warn);
                    res.status(200).send(warn);
                }

                else {
                    User.updateOne({email: person['email']}, {$set: {//Если посещали ранее, то обновимся
                        name: person.name.split(' ')[0],
                        surname: person.name.split(' ')[1],
                        picture: person.picture,
                    }})
                    const {name, surname, picture, email} = person;
                    const personToSend = {name, surname, picture, email};
                    res.status(200).send(personToSend);
                }

            })
            .catch(err => {
                console.log(err)
            })
    },

}

nameParser = name => {
    const nameArr = name.split(" ");
    const newNameArr = nameArr.filter(value => value.length>0);
    return newNameArr;
}