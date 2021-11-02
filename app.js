/*

Todo:
    - client username / password 다르게 
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

// const { Parser } = require('icecast-parser');

var server = require('http').Server(app);
// var io = require('socket.io')(server);

//set radiostation option 
// const radioStation = new Parser({
//   autoUpdate: true,
//   metadataInterval: 5,
//   notifyOnChangeOnly: false,
//   userAgent: "from old server",
//   // url: 'https://cloud.oolongradio.com:8443/oolong-rotation'
//   url: "http://159.65.119.117:8000/oolong-rotation",
// });


//socket.io
// io.on('connection', function (socket) {
//     radioStation.on('metadata', function (data) {
//         console.log(data)
//         socket.emit('metadata', { message: data.get('StreamTitle') });
//     })
// });

app.get('/', async (req, res) => {
    try {
        res.render('index')
    }
    catch (e) {
        console.log(e);
    }
})



//get filenames when click archive


app.get("/archive", async (req, res) => {
  try {
    const archiveFileList = new Array();

    const directoriesInCurrent = await client.getDirectoryContents(
      "/oolongradio/archive/current",
      { deep: true }
    );

    let obj = new Object();
    obj.date = directoriesInCurrent[0].basename;
    obj.music = new Array();

    directoriesInCurrent.forEach((v) => {
      if (v.type === "file" && v.mime === "audio/mpeg") {
        obj.music.push(v.basename.replace(/\.[^/.]+$/, ""));
      }
    });

    archiveFileList.push(obj);

    //past
    const directoriesInArchive = await client.getDirectoryContents(
      "/oolongradio/archive/past"
    );

    for (let i in directoriesInArchive.reverse()) {
      let obj = new Object();
      obj.date = directoriesInArchive[i].basename;
      obj.music = new Array();

      let filesInDirectory = await client.getDirectoryContents(
        "/oolongradio/archive/past/" + obj.date
      );

      filesInDirectory.forEach((v) => {
        if (v.type === "file" && v.mime === "audio/mpeg") {
          obj.music.push(v.basename.replace(/\.[^/.]+$/, ""));
        }
      });

      archiveFileList.push(obj);
    }
    res.status(200).json(archiveFileList);
  } catch (e) {
    console.log(e);
  }
});

server.listen(process.env.PORT || 3001, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});