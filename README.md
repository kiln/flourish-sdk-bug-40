This is a test case for the bug underlying kiln/flourish-sdk#40

If you check out this repo and run `npm start` then, at least on Mac OS 10.13.3, you should see a message like `Killed: 9`, and running `echo $?` will print `137`, indicating that the process was killed with a SIGKILL.

More details at raszi/node-tmp#168.
