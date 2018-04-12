"use strict";

/*
Stripped-down test case for kiln/flourish-sdk#40.
*/

const fs = require("fs"),
      path = require("path"),

      archiver = require("archiver"),
      request = require("request"),
      tmp = require("tmp");

function getApiToken() {
	const api_tokens_file = path.join(process.env.HOME || process.env.USERPROFILE, ".flourish_sdk");
	return new Promise(function(resolve, reject) {
		fs.readFile(api_tokens_file, "utf8", function(error, body) {
			if (error) return reject(error);
			resolve(JSON.parse(body)["app.flourish.studio"]);
		});
	});
}

function whoami() {
	return getApiToken()
		.then(api_token => new Promise(function(resolve, reject) {
			request({
				method: "POST",
				uri: "https://app.flourish.studio/api/v1/whoami",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ api_token, sdk_version: "2" })
			}, function(error, response) {
				if (error) reject(error);
				else resolve(response);
			});
		}));
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

createEmptyZipFile().then(whoami);
