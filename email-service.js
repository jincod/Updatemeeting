var Mailgun = require('mailgun').Mailgun;

function EmailService() {
	this.sendConfirmingEmail = function(email, id) {
		if(!process.env.MAILGUN_API_KEY) return;

		var mg = new Mailgun(process.env.MAILGUN_API_KEY);

		mg.sendRaw('Update Meeting <updatemeeting@gmail.com>', email, 
			'From: Update Meeting <updatemeeting@gmail.com>' + 
			'\nTo: ' + email + '\nContent-Type: text/html; charset=utf-8' + 
			'\nSubject: Проверочное сообщение UpdateMeeting' + 
			'\n\nДобро пожаловать! Пожалуйста, подтвердите свой адрес: <a href="http://updatemeeting.apphb.com/confirm/' + id + '">Подтвердить</a>', 
			function(err) {
				if(err) console.log('Oh noes: ' + err);
				else console.log('Success');
			});
	};

	this.sendAnnonceEmail = function(subject, emailtext, emails) {
		if(!process.env.MAILGUN_API_KEY) return;

		var mg = new Mailgun(process.env.MAILGUN_API_KEY);

		for(var i in emails) {
			var email = emails[i];
			mg.sendRaw('Update Meeting <updatemeeting@gmail.com>', email, 
				'From: Update Meeting <updatemeeting@gmail.com>' + 
				'\nTo: ' + email + 
				'\nContent-Type: text/html; charset=utf-8' + 
				'\nSubject: ' + subject + '\n\n' + emailtext, 
				function(err) {
					if(err) console.log('Oh noes: ' + err);
					else console.log('Success');
				});
		}
	};
}

exports.EmailService = EmailService;