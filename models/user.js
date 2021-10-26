const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userOptions = {
	timestamps: true
}

const userSchema = new Schema(
	{
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
					// Source - https://regex101.com/r/857lzc/1
					let emailRegex = /^([a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)$/;

					return emailRegex.test(email);
				}, 
				message: 'Email format seems to be incorrect'
			}
		},
		last_autotracked: {
			type: Date
		}
		// Pending - lastLogin, isLoggedIn
	},
	userOptions
);

userSchema.plugin(passportLocalMongoose, {
	usernameField: 'email',
	errorMessages: {
		UserExistsError: 'A user with the given email already exists'
	}
});

module.exports = mongoose.model('User', userSchema);
