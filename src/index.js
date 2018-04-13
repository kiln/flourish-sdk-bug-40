"use strict";

/*
Stripped-down test case for kiln/flourish-sdk#40.
*/

require("tmp").file(function(error, filename, fd) {
	require("fs").closeSync(fd);
	require("https").get("https://www.google.com");
});
