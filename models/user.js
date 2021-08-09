const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
	name: {
		type: String,
		required: [true, 'User name required'],
	},
	email: {
		type: String,
		required: [true, 'User email required'],
		unique: true, //not for validation purposes, only sets up an index
		validate: {
			validator: function(email) {
				let emailRegex = /^([a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)$/;

   				return emailRegex.test(email);
			}, 
			message: 'Email format seems to be incorrect'
		}
	}
})

userSchema.plugin(passportLocalMongoose, {
	usernameField: 'email'
});

module.exports = mongoose.model('User', userSchema);
