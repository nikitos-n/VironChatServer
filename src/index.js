const bodyParser = require('body-parser');
const cors = require('cors');

import express from 'express';

const app = express();
const server = app.listen(3001, () => {
    console.log('listening on port 3001');
});

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({extended:true}) );
app.use(express.static('public'));
app.use( cors() );
app.post('/api/auth', function(req, res){
  res.status(200).send(data);
});