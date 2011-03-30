
/**
 * Module dependencies.
 */

var express = require('express');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var app = module.exports = express.createServer();

//Crashing server or nice server?
//Nice server uses getObjectsNice, while crashing server uses getObjectsCrash
var niceServer = false;

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('view options', { layout: false });
  
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Mongoose stuff
var dbURL = "mongodb://localhost/bugtest";

var TestSchema = new Schema({
	prop: String
});

mongoose.model('Test', TestSchema);
var Test = mongoose.model('Test');

var insertObject = function(callback) {
	mongoose.connect(dbURL);

	var t = new Test();
	t.prop = "hello world at " + new Date().toDateString();
	
	t.save(function() {
		mongoose.connection.close();
		callback();
	});
}

var clearObjects = function(callback) {
	mongoose.connect(dbURL);
	Test.remove(function() {
		mongoose.connection.close();
		callback();
	});
}

/*
This is the method we are interested in. If mongoose.connection.close()
is uncommented, express will crash upon the second visitation of the page.
If it is commented out/removed, everything appears to work fine.
*/
var getObjectsCrash = function(callback) {
	mongoose.connect(dbURL);
	Test.find().execFind(function(err, tList) {
		debugger;
		mongoose.connection.close();
		callback(tList);
	});
}

var getObjectsNice = function(callback) {
	mongoose.connect(dbURL);
	Test.find().execFind(function(err, tList) {
		callback(tList);
	});
}

//Routes
app.get('/', function(req, res) {
	if (niceServer) {
		getObjectsNice(function(tList) {
			res.render('index', { tList: tList });
		});
	}
	else {
		getObjectsCrash(function(tList) {
			res.render('index', { tList: tList });
		});
	}
});

//argv[2] = the operation we want to perform
var operation = process.argv[2];

if (operation == 'insert') {
	insertObject(function() {
		console.log('object inserted. run express-561-test server to test');
		process.exit();
	});
}
else if (operation == 'clear') {
	clearObjects(function() {
		console.log('db cleared. run express-561-test insert to insert a new object.');
		process.exit();
	});
}
else if (operation == 'niceserver') {
	niceServer = true;
	app.listen(3000);
	console.log("Nice Express server listening on port %d", app.address().port);
}
else if (operation == 'crashserver') {
	niceServer = false;
	app.listen(3000);
	console.log('Crashable server listening on port 3000. If you visit the index page twice it should explode');
}
else {
	console.log('unknown operation. try insert, clear, or server.');
	process.exit(1);
}