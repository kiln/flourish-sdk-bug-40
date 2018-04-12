"use strict";

/*
Stripped-down test case for kiln/flourish-sdk#40.
*/

const fs = require("fs"),
      https = require("https"),
      path = require("path"),

      tmp = require("tmp");

function makeRequest() {
	return new Promise(function(resolve, reject) {
		https.get("https://www.google.com", resolve);
	});
}

function createEmptyFile() {
	return new Promise(function(resolve, reject) {
		tmp.file(function(error, zip_filename, zip_fd) {
			if (error) return reject(error);

			console.log("Creating %s (%d)", zip_filename, zip_fd);
			let output = fs.createWriteStream(null, { fd: zip_fd });
			output.on("close", function() {
				resolve();
			});
			output.close();
		});
	});
}

createEmptyFile().then(makeRequest);
