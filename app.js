/*

Todo:
    - Metadata parsing: icecast-parser 말고 다른 방법으로?
    - http request API 날씨데이터 적용
    - Rotation Archive List 불러오기
*/

const express = require('express')
const path = require('path')
const ejs = require('ejs')

require('dotenv').config()

const { createClient } = require("webdav");
const client = createClient(
    "https://cloud.oolongradio.com/remote.php/dav/files/hjkaddict/",
    {
        username: process.env.NEXTCLOUD_USERNAME,
        password: process.env.NEXTCLOUD_PASSWORD
    }
);

const unirest = require('unirest')

const app = express()
const publicDirectoryPath = path.join(__dirname, '../public')
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

const { Parser } = require('icecast-parser');
const { dir } = require('console');
const { resolveSoa } = require('dns');

var server = require('http').Server(app);
var io = require('socket.io')(server);

//set radiostation option 
const radioStation = new Parser({
    autoUpdate: true,
    metadataInterval: 2,
    notifyOnChangeOnly: false,
    url: 'https://cloud.oolongradio.com:8443/oolong-rotation'
});

//req for weather API
// var req = unirest("GET", "https://weatherbit-v1-mashape.p.rapidapi.com/current");

// req
//     .query({
//         "lon": "13.42",
//         "lat": "52.54"
//     }).headers({
//         "x-rapidapi-key": "1ff5a38105mshe44cd67aa91441ap16ec1fjsn37acebe33558",
//         "x-rapidapi-host": "weatherbit-v1-mashape.p.rapidapi.``com",
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
        socket.emit('metadata', { message: data.get('StreamTitle') });
    })
});

app.get('/', async (req, res) => {
    try {
        res.render('index')
    }
    catch (e) {
        console.log(e);
    }
})



//get filenames when click rotation

app.get('/test', async (req, res) => {
    try {
        const directoriesInArchive = await client.getDirectoryContents("/oolongradio/archive");
        const archive = new Array();

        for (var i in directoriesInArchive.reverse()) {
            let obj = new Object()
            obj.date = directoriesInArchive[i].basename
            obj.music = new Array()

            let filesInDirectory = await client.getDirectoryContents("/oolongradio/archive/" + obj.date)
            let filterMp3 = await filesInDirectory.filter(function(file) {
                return file.mime == "audio/mpeg"
            })

            for (var j in filterMp3) {
                // .replace(/\.[^/.]+$/, ""); is for trimming '.mp3' in string
                obj.music.push(filterMp3[j].basename.replace(/\.[^/.]+$/, ""))
            }
            archive.push(obj)
        }

        res.status(200).json(archive)

    } catch (e) {
        console.log(e)
    }
})

server.listen(process.env.PORT || 3001, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});