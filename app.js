var express = require('express'),
	//nodemailer = require("nodemailer"),
    mongoose = require('mongoose');

var app = express();
app.set('views', __dirname + '/views');
//app.set('view engine', 'jade')
app.engine('html', require('ejs').renderFile);
app.use(express.bodyParser());
app.use(express.logger('dev'));
app.use(express.static(__dirname + '/public'));

var auth = express.basicAuth('admin', process.env.PASS || 'admin');

// Databse
var connectionString = process.env.MONGOHQ_URL || 'mongodb://localhost/updatemeeting';
mongoose.connect(connectionString);
var Schema = mongoose.Schema;  

var User = new Schema({  
    email: { type: String, required: true, unique: true },
    created: { type: Date, default: Date.now }
});

var UserModel = mongoose.model('User', User);


app.get('/', function (request, respond) {	
	respond.render("index.html");
});

app.get('/users', auth, function (request, respond){	
	return UserModel.find(function (err, users) {
	    if (!err) {
	    	return respond.send(users);
	    } else {
	  		return console.log(err);
	    }
    });
});

app.post('/subscribe', function (request, respond){
	var email = request.param('email');
	var user = UserModel.find({ email : email }, function (err, user){
		if(!user.length) {
			var newUser = new UserModel({ email: email });
			newUser.save(function (err) {
				if (!err) {
					return console.log("created");
				} else {
					return console.log(err);
				}
			});
		}
	});	
	respond.redirect('/');
});

app.get('/unsubscribe/:id', function (request, respond){
	var id = request.param('id');
	var user = UserModel.remove({ _id : id }, function (err, user){
		if (!err) {
			return console.log("deleted " + id);
		} else {
			return console.log(err);
		}
	});
	respond.redirect('/');
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
	console.log("Listening on port: " + port);
});