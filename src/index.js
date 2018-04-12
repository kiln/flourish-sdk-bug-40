"use strict";

/*
Stripped-down test case for kiln/flourish-sdk#40.
*/

const fs = require("fs"),
      path = require("path"),

      archiver = require("archiver"),
      request = require("request"),
      tmp = require("tmp");

function make_api_request() {
	return new Promise(function(resolve, reject) {
		request({
			method: "POST",
			uri: "https://app.flourish.studio/api/v1/nosuchmethod",
			headers: { "Content-Type": "application/json" },
			body: ""
		},
		function(error, response) {
			resolve();
		});
	});
}

function createEmptyZipFile() {
	return new Promise(function(resolve, reject) {
		tmp.file(function(error, zip_filename, zip_fd) {
			if (error) return reject(error);

			let zip = archiver.create("zip", {});
			let output = fs.createWriteStream(null, { fd: zip_fd });
			output.on("close", function() {
				resolve(zip_filename);
			});

			zip.pipe(output);
			zip.finalize();
		});
	});
}

createEmptyZipFile().then(make_api_request);
