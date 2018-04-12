"use strict";

var fs = require("fs"),

    archiver = require("archiver"),
    tmp = require("tmp"),

    sdk = require("./sdk");

function zipUpTemplate() {
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

function publish(server_opts) {
	return zipUpTemplate()
		.then(() => sdk.request(server_opts, "user/whoami", {}));
}

module.exports = publish;
