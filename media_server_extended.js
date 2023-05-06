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

/* this is an updated beta version that uses a LOT more channels as follows
 *
 *   1 - intensity
 *   2 - image selection
 *   3 - vibrance 
 *   4 - contrast 
 *   5 - hue
 *   6 - saturation
 *   7 - sepia filter
 *   8 - vignette size
 *   9 - vignette level
 *  10 - blur (standard)
 *  11 - lens blur effect
 *  12 - keystone adjustment (Top Left Horizontal Offset)
 *  13 - keystone adjustment (Top Right Horizontal Offset)
 *  14 - keystone adjustment (Bottom Left Horizontal Offset)
 *  15 - keystone adjustment (Bottom Right Horizontal Offset)
 *  16 - keystone adjustment (Top Left Vertical Offset)
 *  17 - keystone adjustment (Top Right Vertical Offset)
 *  18 - keystone adjustment (Bottom Left Vertical Offset)
 *  19 - keystone adjustment (Bottom Right Vertical Offset)
 *  20 - control channel
 */

// current state
currDmx = [];
curr = {};

curr.keystone = [0,0, 1920,0, 0,1080, 1920,1080];

changes = {};

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
    res.sendFile(__dirname + '/canvas.html')
});

app.get('/glfx.js', function (req, res) {
    res.sendFile(__dirname + '/lib/glfx.js');
});
app.use('/images', express.static("images"));

io.on('connection', function (socket) {
    updateClient(0, curr);
});

const srv = artnet.listen(config.port, config.start, 20, function (data, peer) {
    // if this is too short, discard it
    if (data.length < 3) return;

    changes = {};

    // Intensity 
    if (data[0] != currDmx[0]) {
        curr.alpha = (data[0]*0.0039).toFixed(3);
        if (curr.alpha < 0) curr.alpha = 0;
        if (curr.alpha >= 1) curr.alpha = 1;
        changes.alpha = curr.alpha;

        // we emit this here just in case (avoid latency in fades)
        io.sockets.emit("update_0", {"alpha": curr.alpha});
    }

    // Slide
    if (data[1] != currDmx[1]) {
        var img = parseDmxImageValue(data[1]);
        if (img != curr.img) {
            curr.img = img;
            changes.img = curr.img;
        }
    }

    // Vibrance
    if (data[2] != currDmx[2]) {
        val = parseDmxValueBiDi(data[2]);
        if (val != curr.vib) {
            curr.vib = val;
            changes.vib = val;
        }
    }

    // Contrast
    if (data[3] != currDmx[3]) {
        val = parseDmxValueBiDi(data[3]);
        if (val != curr.con) {
            curr.con = val;
            changes.con = val;
        }
    }

    // Hue
    if (data[4] != currDmx[4]) {
        val = parseDmxValueBiDi(data[4]);
        if (val != curr.hue) {
            curr.hue = val;
            changes.hue = val;
        }
    }

    // Saturation
    if (data[5] != currDmx[5]) {
        val = parseDmxValueBiDi(data[5]);
        if (val != curr.sat) {
            curr.sat = val;
            changes.sat = val;
        }
    }

    // Sepia Filter
    if (data[6] != currDmx[6]) {
        val = parseDmxValueIncr(data[6],1);
        if (val != curr.sepia) {
            curr.sepia = val;
            changes.sepia = val;
        }
    }

    // Blur
    if (data[9] != currDmx[9]) {
        val = parseDmxValueIncr(data[9],300);
        if (val != curr.blur) {
            curr.blur = val;
            changes.blur = val;
        }
    } 

    // Lens Blur
    if (data[10] != currDmx[10]) {
        val = parseDmxValueIncr(data[10],300);
        if (val != curr.lensblur) {
            curr.lensblur = val;
            changes.lensblur = val;
        }
    } 

    // Keystoning
    if (data[11] != currDmx[11]) {
        // top left keystone H (0-960)
        val = parseDmxValueIncr(data[11],960);
        if (val != curr.keystone[0]) curr.keystone[0] = Math.round(val);
    } 
    if (data[12] != currDmx[12]) {
        // top right keystone H(0-960) <
        val = 1920-parseDmxValueIncr(data[12],960);
        if (val != curr.keystone[2]) curr.keystone[2] = Math.round(val);
    } 
    if (data[13] != currDmx[13]) {
        // bottom left keystone H (0-960)
        val = parseDmxValueIncr(data[13],960);
        if (val != curr.keystone[4]) curr.keystone[4] = Math.round(val);
    } 
    if (data[14] != currDmx[14]) {
        // bottom right keystone H (0-960)
        val = 1920-parseDmxValueIncr(data[14],960);
        if (val != curr.keystone[6]) curr.keystone[6] = Math.round(val);
    } 
    if (data[15] != currDmx[15]) {
        // top left keystone V (0-540)
        val = parseDmxValueIncr(data[15],540);
        if (val != curr.keystone[1]) curr.keystone[1] = Math.round(val);
    } 
    if (data[16] != currDmx[16]) {
        // top right keystone V (0-540) 
        val = parseDmxValueIncr(data[16],540);
        if (val != curr.keystone[3]) curr.keystone[3] = Math.round(val);
    } 
    if (data[17] != currDmx[17]) {
        // bottom left keystone V (0-540)
        val = 1080-parseDmxValueIncr(data[17],540);
        if (val != curr.keystone[5]) curr.keystone[5] = Math.round(val);
    }
    if (data[18] != currDmx[18]) {
        // bottom right keystone V (0-540)
        val = 1080-parseDmxValueIncr(data[18],540);
        if (val != curr.keystone[7]) curr.keystone[7] = Math.round(val);
    } 

    // if we have any keystone changes, grab them here
    if (curr.keystone_string != JSON.stringify(curr.keystone)) {
        curr.keystone_string = JSON.stringify(curr.keystone);
        changes.keystone = curr.keystone;
    }

    // Control Channel
    if (data[19] > 126 && data[19] << 129) {
        if (curr.cmd != 9) {
            curr.cmd = 9;
            io.sockets.emit("update_0", {"cmd": "reload"});
        }
    } else {
        curr.cmd = 0;
    }

    currDmx = data;

    if (Object.keys(changes).length > 0) {
        updateClient(0, changes);
    }
});

function updateClient(id, changes) {
    io.sockets.emit("update_"+id, changes);
}

function parseDmxValueIncr(val, limit) {
    // converts a received DMX to between 0 and LIMIT 
    var res = 0;
    if (limit == 1) {
        var incr = 0.0039;
    } else {
        var incr = limit/255;
    }
    res = parseFloat((val*incr).toFixed(3));
    if (res < 0) return 0;
    if (res >= limit) return parseFloat(limit);
    return res;
}

function parseDmxValueBiDi(val, limit) {
    // converts a received DMX to between -1 and 1 IF it's above 5;
    if (val < 5 || val == 127) return 0;
    if (val > 253) return 1;
    if (val < 127) {
        res = ((1-val*0.00787)*-1).toFixed(3);
    } else {
        res = (val*0.00787-1).toFixed(3);
    }

    if (res < -1) return -1;
    if (res > 1) return 1;
    return parseFloat(res);
}

function parseDmxImageValue(v) {
    // This is done for readability, not efficiency, and to make
    // it easy to change the supported number of images. 
    if (v >= 245) return 25;
    if (v >= 235) return 24;
    if (v >= 225) return 23;
    if (v >= 215) return 22;
    if (v >= 205) return 21;
    if (v >= 195) return 20;
    if (v >= 185) return 19;
    if (v >= 175) return 18;
    if (v >= 165) return 17;
    if (v >= 155) return 16;
    if (v >= 145) return 15;
    if (v >= 135) return 14;
    if (v >= 125) return 13;
    if (v >= 115) return 12;
    if (v >= 105) return 11;
    if (v >= 95)  return 10;
    if (v >= 85)  return 9;
    if (v >= 75)  return 8;
    if (v >= 65)  return 7;
    if (v >= 55)  return 6;
    if (v >= 45)  return 5;
    if (v >= 35)  return 4;
    if (v >= 25)  return 3;
    if (v >= 15)  return 2;
    if (v >= 5)   return 1;
    return 0;
}