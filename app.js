/*

Todo:
    - Metadata parsing: icecast-parser 말고 다른 방법으로?
    - http request API 날씨데이터 적용
*/

const express = require('express')
const path = require('path')
const ejs = require('ejs')

const unirest = require('unirest')

const app = express()
const publicDirectoryPath = path.join(__dirname, '../public')
app.set('view engine', 'ejs')
app.use(express.static('public'));

const { Parser } = require('icecast-parser');
var icy = require('icy');
var lame = require('node-lame');
var Speaker = require('speaker');


var server = require('http').Server(app);
var io = require('socket.io')(server);

//set radiostation option 
const radioStation = new Parser({
    autoUpdate: true,
    metadataInterval: 5,
    notifyOnChangeOnly: false,
    url: 'https://stream.oolongradio.com/oolong-radio'
});

//testhere
// icy.get('https://stream.oolongradio.com/oolong-radio', function (res) {
//     // log any "metadata" events that happen
//     res.on('metadata', function (metadata) {
//         var parsed = icy.parse(metadata);
//         console.error(parsed);
//     });
// });

//req for weather API
// var req = unirest("GET", "https://weatherbit-v1-mashape.p.rapidapi.com/current");

// req
//     .query({
//         "lon": "13.42",
//         "lat": "52.54"
//     }).headers({
//         "x-rapidapi-key": "1ff5a38105mshe44cd67aa91441ap16ec1fjsn37acebe33558",
//         "x-rapidapi-host": "weatherbit-v1-mashape.p.rapidapi.com",
//         "useQueryString": true
//     }).end(function (res) {
//         if (res.error) throw new Error(res.error);
//         console.log(res.body.data[0])
//         // console.log(res.body.data[0].temp);         //temperature
//         // console.log(res.body.data[0].weather.code)  //weather
//     });



//socket.io
io.on('connection', function (socket) {
    radioStation.on('metadata', function (data) {
        // socket.emit('metadata', { message: data.get('StreamTitle') });
    })

    setTimeout(function () {
        socket.emit('metadata', 'aaaa')
    }, 2000)
    
});

app.get('/', async (req, res) => {
    try {
        res.render('index')
    }
    catch (e) {
        console.log(e);
    }
})

server.listen(process.env.PORT || 3001, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});