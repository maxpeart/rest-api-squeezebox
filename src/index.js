var express = require('express');
var cors = require('cors');
var http = require('http');
var bodyParser = require('body-parser');

require('dotenv').config()

var PlayerAPI = require('./api/PlayerServices');

var app = express();

app.use(cors());
app.use(bodyParser.json()); // for parsing application/json


if (!process.env.LMS) {
    console.error("ERROR : logitechmediaserver URL not set");
    return;
}

if (!process.env.PORT) {
    console.error("ERROR : port not set");
    return;
}
if (!process.env.TOKEN) {
    console.error("ERROR : no token found");
    return;
}

let SlimHelper = require('./slim-server-wrapper/SlimHelper');
SlimHelper.setUrl(process.env.LMS);

PlayerAPI.setEndPoints(app);

http.createServer(app).listen(process.env.PORT);
