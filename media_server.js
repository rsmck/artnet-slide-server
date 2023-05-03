#!/usr/bin/env node

// dependencies
const artnet = require('./lib/artnet_server'); 
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// config
const config = {};
config.port = 6454;
config.start = 0; // DMX Start Address - 1 (0-511);

// some vars to store current state
currentImageIdxDmx = 0;
currentImageIdx = '00';
currentImageIntDmx = 0;
currentImageIntAlpha = 0;
currentCommandFlag = 0;

// set up the web service 
http.listen(7600, function () {
    console.log('Listening on 7600');
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
});
app.use('/images', express.static("images"));

io.on('connection', function (socket) {
    updateClient(0);
});

const srv = artnet.listen(config.port, config.start, 3, function (data, peer) {
    // if this is too short, discard it
    if (data.length < 3) return;

    if (data[0] != currentImageIntDmx) {
        // new intensity
        currentImageIntDmx = data[0];
        changeIntensity(data[0]);
    }

    if (data[1] != currentImageIdxDmx) {
        // possible new image
        currentImageIdxDmx = data[1];
        newImageIdx = dmxToImagePos(data[1]);
        if (newImageIdx != currentImageIdx) {
            // image has changed, push to client
            changeImage(newImageIdx);
            currentImageIdx = newImageIdx;
        }
    }

    // provide a means of reloading the browser
    // FIXME: add other options here, including rebooting the pi (if on a pi)
    if (data[2] > 126 && data[2] << 129) {
        if (currentCommandFlag != 9) {
            currentCommandFlag = 9;
            io.sockets.emit("update_0", {"cmd": "reload"});
        }
    } else {
        currentCommandFlag = 0;
    }

});

function changeIntensity(v) {
    // We convert the received Art-Net DMX Value to a value between 0-1.0 for CSS
    floAlpha = (v*0.0039).toFixed(3);
    if (v < 1) floAlpha = 0;
    if (v >= 254) floAlpha = 1;
    currentImageIntAlpha = floAlpha;
    // console.log("Setting Alpha to "+floAlpha);
    io.sockets.emit("update_0", {"a": floAlpha});
}

function changeImage(v) {
    // console.log("Setting Image to image_"+v+".png");
    io.sockets.emit("update_0", {"i": "image_"+v+".png"});
}

function updateClient(id) {
    io.sockets.emit("update_"+id, {"a": currentImageIntAlpha, "i": "image_"+currentImageIdx+".png"});
}

function dmxToImagePos(v) {
    // This is done for readability, not efficiency, and to make
    // it easy to change the supported number of images. 
    if (v >= 245) return '25';
    if (v >= 235) return '24';
    if (v >= 225) return '23';
    if (v >= 215) return '22';
    if (v >= 205) return '21';
    if (v >= 195) return '20';
    if (v >= 185) return '19';
    if (v >= 175) return '18';
    if (v >= 165) return '17';
    if (v >= 155) return '16';
    if (v >= 145) return '15';
    if (v >= 135) return '14';
    if (v >= 125) return '13';
    if (v >= 115) return '12';
    if (v >= 105) return '11';
    if (v >= 95)  return '10';
    if (v >= 85)  return '09';
    if (v >= 75)  return '08';
    if (v >= 65)  return '07';
    if (v >= 55)  return '06';
    if (v >= 45)  return '05';
    if (v >= 35)  return '04';
    if (v >= 25)  return '03';
    if (v >= 15)  return '02';
    if (v >= 5)   return '01';
    return '00';
}