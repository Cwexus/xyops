#!/usr/bin/env node

// OpsRocket Server - Main entry point
// Copyright (c) 2021 - 2025 Joseph Huckaby

// Check if Node.js version is old
if (process.version.match(/^v?(\d+)/) && (parseInt(RegExp.$1) < 16) && !process.env['OPSROCKET_OLD']) {
	console.error("\nERROR: You are using an incompatible version of Node.js (" + process.version + ").  Please upgrade to v16 or later.  Instructions: https://nodejs.org/en/download/package-manager\n\nTo ignore this error and run unsafely, set an OPSROCKET_OLD environment variable.  Do this at your own risk.\n");
	process.exit(1);
}

var PixlServer = require("pixl-server");
var Echo = require('./echo.js');

// chdir to the proper server root dir
process.chdir( require('path').dirname( __dirname ) );

var server = new PixlServer({
	
	__name: 'OpsRocket',
	__version: require('../package.json').version,
	
	// configFile: "conf/config.json",
	"multiConfig": [
		{
			"file": "conf/config.json"
		},
		{
			"file": "internal/unbase.json",
			"key": "Unbase"
		},
		{
			"file": "internal/ui.json",
			"key": "ui"
		},
		{
			"file": "internal/intl.json",
			"key": "intl"
		}
	],
	
	components: [
		require('pixl-server-storage'),
		require('pixl-server-unbase'),
		require('pixl-server-web'),
		require('pixl-server-api'),
		require('pixl-server-user'),
		require('pixl-server-debug'),
		require('./engine.js')
	]
	
});

server.on('init', function() {
	// setup fancy echo / repl system, if enabled
	Echo.setup(server);
});

server.startup( function() {
	// server startup complete
	process.title = server.__name + ' Server';
} );
