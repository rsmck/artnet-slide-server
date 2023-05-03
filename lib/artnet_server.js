/*
 * Quick and dirty alternative to artnet_server.js 
 * 
 * This is as simple as I can possibly make an Art-Net Class
 * I've found lots of others that all have various bugs, I'm
 * sure this one will as well however it works fine with the
 * output from ETC Eos which is all it will ever be used with
 * in my case.
 *
 * - github.com/rsmck | @rsmck
 */

var dgram = require('dgram');

exports.listen = function(port, start, limit, cb) {
	this.port = port;

	// Set up the socket
	var sock = dgram.createSocket("udp4", function (msg, peer) {
		const endpos = start+limit;

		// ignore messages that aren't long enough
		if (msg.length < 18) { return; }

		// read the Art-Net packet and return an array of values
		universe = msg.readUInt8(14);
		subnet = msg.readUInt8(15);
		opCode = msg.readUInt8(9);
		version = msg.readUInt16BE(10);
		slots = msg.slice(18);
		artSlot = [];
		var y = 0;
		for (let i = 0; i < 512; i++) {
			if (i < start) continue;
			if (i >= endpos) break;
			artSlot[y] = slots[i];
			y++;
		}
		cb(artSlot, peer.address);
	});
	sock.bind(port, '0.0.0.0');
};