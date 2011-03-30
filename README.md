Express issue 561 test
----------------------

Dependencies:
mongodb running on localhost with no security (i.e. a "trusted" environment)
express
mongoose
ejs
npm (not REALLY necessary, but makes things a lot easier)

To build (make sure NPM has write access, or adjust for sudo):
make

Use Instructions:
First, insert an object into mongodb:
express-561-test insert

Then, start the server:
express-561-test crashserver

Then, visit localhost:3000. You should see the object(s) printed. Refresh the page.
Express should crash with can't use mutable headers error.

To clear database, run:
express-561-test clear

To start a "nice" server that doesn't crash, run:
express-561-test niceserver

To check out the error, examine the getObjectsCrash and getObjectsNice functions.
getObjectCrash closes the mongoose connection before calling render.
getObjectNice does not close the connection.