const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({extended:true}) );
app.use(express.static('public'));
app.use( cors() );

app.post('/', function(req, res){
    // console.log(req.body);
    // console.log(req.body.tokenID);
    const decodedToken = jwt.decode(req.body.tokenID);
    res.status(200).send(decodedToken);
});

app.listen(3001, () => {
    console.log('listening on port 3001');
});