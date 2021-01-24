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
        username: 'hjkaddict',
        password: 'eXKTt-qaseQ-DSxzk-AYZnZ-bWGyj'
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

app.get('/archive', async (req, res) => {
    try {
        const rotationFileList = new Array();

        const directoriesInCurrent = await client.getDirectoryContents("/oolongradio/current");
        for (let i in directoriesInCurrent) {
            let obj = new Object()
            obj.date = directoriesInCurrent[i].basename
            obj.music = new Array()

            let filesInDirectory = await client.getDirectoryContents("/oolongradio/current/" + obj.date)
            let filterMp3 = await filesInDirectory.filter(function (file) {
                return file.mime == "audio/mpeg"
            })

            for (let j in filterMp3) {
                // .replace(/\.[^/.]+$/, ""); is for trimming '.mp3' in string
                obj.music.push(filterMp3[j].basename.replace(/\.[^/.]+$/, ""))
            }
            rotationFileList.push(obj)
        }

        const directoriesInArchive = await client.getDirectoryContents("/oolongradio/archive");

        for (let i in directoriesInArchive.reverse()) {
            let obj = new Object()
            obj.date = directoriesInArchive[i].basename
            obj.music = new Array()

            let filesInDirectory = await client.getDirectoryContents("/oolongradio/archive/" + obj.date)
            let filterMp3 = await filesInDirectory.filter(function (file) {
                return file.mime == "audio/mpeg"
            })

            for (let j in filterMp3) {
                // .replace(/\.[^/.]+$/, ""); is for trimming '.mp3' in string
                obj.music.push(filterMp3[j].basename.replace(/\.[^/.]+$/, ""))
            }
            rotationFileList.push(obj)
        }

        res.status(200).json(rotationFileList)

    } catch (e) {
        console.log(e)
    }
})

server.listen(process.env.PORT || 3001, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});