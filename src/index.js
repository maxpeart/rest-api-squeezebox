require('dotenv').config();

var express = require('express');
var cors = require('cors');
var https = require('https');
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');

let PlayerAPI = require('./api/PlayerServices');
let SlimHelper = require('./slim-server-wrapper/SlimHelper');

const production = process.env.NODE_ENV === 'production';

let app = express();
app.use(cors());
app.use(bodyParser.json()); // for parsing application/json

const server = production ? 
        https.createServer({
                key: fs.readFileSync(process.env.KEY), 
                cert: fs.readFileSync(process.env.CERT), 
                ca: fs.readFileSync(process.env.CHAIN)}
            ,app).listen(process.env.PORT) :
        http.createServer(app).listen(process.env.PORT);

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

SlimHelper.setUrl(process.env.LMS);

PlayerAPI.setEndPoints(app);

module.exports = {app,server};