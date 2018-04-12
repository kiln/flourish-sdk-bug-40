"use strict";

/*
Stripped-down test case for kiln/flourish-sdk#40.
*/

const fs = require("fs"),
      path = require("path"),

      archiver = require("archiver"),
      mod_request = require("request"),
      tmp = require("tmp");

function problem(...lines) {
	for (let line of lines) console.error("😱  " + line);
}

function die(...lines) {
	problem(...lines);
	process.exit(1);
}

const api_tokens_file = path.join(process.env.HOME || process.env.USERPROFILE, ".flourish_sdk");

function getApiToken(server_opts) {
	return new Promise(function(resolve, reject) {
		fs.readFile(api_tokens_file, "utf8", function(error, body) {
			if (error) return reject(error);
			resolve(JSON.parse(body)[server_opts.host]);
		});
	});
}

const AUTHENTICATED_REQUEST_METHODS = new Set([
	"template/publish", "template/delete", "template/list",
	"user/whoami"
]);

function request(server_opts, method, data) {
	let read_api_token_if_necessary;
	if (AUTHENTICATED_REQUEST_METHODS.has(method)) {
		read_api_token_if_necessary = getApiToken(server_opts)
			.catch((error) => {
				problem(`Failed to read ${api_tokens_file}`, error.message);
			})
			.then((api_token) => {
				if (!api_token) {
					die("You are not logged in. Try ‘flourish login’ or ‘flourish register’ first.");
				}
				return api_token;
			});
	}
	else {
		read_api_token_if_necessary = Promise.resolve();
	}

	return read_api_token_if_necessary
		.then((api_token) => new Promise(function(resolve, reject) {
			let protocol = "https";
			if (server_opts.host.match(/^(localhost|127\.0\.0\.1|.*\.local)(:\d+)?$/)) {
				protocol = "http";
			}
			let url = protocol + "://" + server_opts.host + "/api/v1/" + method;
			let request_params = {
				method: "POST",
				uri: url,
			};

			Object.assign(data, { api_token, sdk_version: "2" });
			if (server_opts.user) {
				request_params.auth = {
					user: server_opts.user,
					pass: server_opts.password,
					sendImmediately: true,
				};
			}

			request_params.headers = { "Content-Type": "application/json" };
			request_params.body = JSON.stringify(data);

			mod_request(request_params, function(error, res) {
				if (error) die(error);
				if (res.statusCode == 200) {
					let r;
					try { r = JSON.parse(res.body); }
					catch (error) {
						die("Failed to parse response from server", error, res.body);
					}
					return resolve(r);
				}

				// We got an error response. See if we can parse it to extract an error message
				try {
					let r = JSON.parse(res.body);
					if ("error" in r) die("Error from server", r.error);
				}
				catch (e) { }
				die("Server error", res.body);
			});
		}));
}

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
		.then(() => request({ host: "app.flourish.studio" }, "user/whoami", {}));
}

publish();
