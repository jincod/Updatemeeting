var express = require('express'),
    mongoose = require('mongoose'),
    expressValidator = require('express-validator'),
    Mailgun = require('mailgun').Mailgun;

var app = express();
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.bodyParser());
app.use(expressValidator);
app.use(express.logger('dev'));
app.use(express.static(__dirname + '/public'));

var auth = express.basicAuth('admin', process.env.PASS || 'admin');

// Databse
var connectionString = process.env.MONGOHQ_URL || 'mongodb://localhost/updatemeeting';
mongoose.connect(connectionString);
var Schema = mongoose.Schema;  

var User = new Schema({  
    email: { type: String, required: true, unique: true },
    created: { type: Date, default: Date.now },
    confirmed: { type: Boolean, default: false }
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
	request.check('email', 'Please enter a valid email').len(6,64).isEmail();
	if(request.validationErrors()){
		respond.redirect(400, '/');
	}

	var email = request.param('email');
	UserModel.find({ email : email }, function (err, user){
		if(!user.length) {
			var newUser = new UserModel({ email: email });
			newUser.save(function (err) {
				if (!err) {
					sendConfirmingEmail(email, newUser._id);
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

app.get('/confirm/:id', function (request, respond){
	var id = request.param('id');
	
	UserModel.findById(id, function (err, user) {
	    if (!err) {
	    	if(user && !user.confirmed) {
				UserModel.update({_id : id}, { confirmed : true}, function (err){
					err && console.log(err);
				});
				respond.send('Спасибо! Email подтвержден. <a href="/">На главную</a>');
				return;
			}
	    	respond.redirect('/');
	    } else {
	  		return console.log(err);
	    }
    });	
});

var sendConfirmingEmail = function (email, id) {
	if(!process.env.MAILGUN_API_KEY)
		return;

	var mg = new Mailgun(process.env.MAILGUN_API_KEY);

	mg.sendRaw('Update Meeting <updatemeeting@gmail.com>', email,
        'From: Update Meeting <updatemeeting@gmail.com>' +
          '\nTo: ' + email +
          '\nContent-Type: text/html; charset=utf-8' +
          '\nSubject: Проверочное сообщение UpdateMeeting' +
          '\n\nДобро пожаловать! Пожалуйста, подтвердите свой адрес: <a href="http://updatemeeting.apphb.com/confirm/'+ id +'">Подтвердить</a>',
        function(err) {
		    if (err) console.log('Oh noes: ' + err);
		    else     console.log('Success');
	});
};

var port = process.env.PORT || 3000;
app.listen(port, function () {
	console.log("Listening on port: " + port);
});