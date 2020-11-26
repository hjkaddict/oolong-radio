/*

Todo:
    - deploy nodapp to server (digital ocean)
    - retreiving metadata in first connection


*/

const express = require('express')
const path = require('path')
const ejs = require('ejs')

const app = express()
const publicDirectoryPath = path.join(__dirname, '../public')
app.set('view engine', 'ejs')
app.use(express.static('public'));

const { Parser } = require('icecast-parser');

var server = require('http').Server(app);
var io = require('socket.io')(server);

const radioStation = new Parser({
    autoUpdate: true,
    metadataInterval: 5,
    notifyOnChangeOnly: false,
    url: 'https://stream.oolongradio.com/oolong-radio'
});


io.on('connection', function (socket) {
    radioStation.on('metadata', function (data) {
        // process.stdout.write(`${data.get('StreamTitle')}\n`);
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

server.listen(process.env.PORT || 3001, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});