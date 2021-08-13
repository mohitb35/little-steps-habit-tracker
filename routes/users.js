const express = require('express');
const router = express.Router();
const passport = require('passport');

const User = require('../models/user');

router.route('/register')
	.get((req, res) => {
		if (req.isAuthenticated()) {
			return res.redirect('/dashboard');
		}
		res.render('users/register');
	})
	.post( async (req, res) => {
		let { name, email, password } = req.body.user;
		const user = new User({ name, email });
		const savedUser = await User.register(user, password);
		req.login(savedUser, function(err) {
			if (err) { return next(err); }
			return res.redirect('/dashboard');
		  });
	});

router.route('/login')
	.get((req, res) => {
		if (req.isAuthenticated()) {
			return res.redirect('/dashboard');
		}
		res.render('users/login');
	})
	.post( 
		passport.authenticate('local', {
			// failureFlash: true,
			failureRedirect: '/login'
		}), 
		(req, res) => {
			res.redirect('/dashboard');
		}
	);

router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/dashboard');
})

router.route('/change-password')
	.get((req, res) => {
		res.render('users/changePassword');
	})
	.put( async (req, res) => {
		try {
			let currentPassword = req.body['current-password'];
			let newPassword = req.body['password'];

			if (!req.user) {
				let err = new Error('User not logged in');
				err.name = 'InvalidSessionError';
				throw err;
			};

			let user = await User.findById(req.user.id);
			if (user) {
				await user.changePassword(currentPassword, newPassword);
				return res.redirect('/dashboard');
			} else {
				let err = new Error('User not found');
				err.name = 'UserNotFoundError';
				throw err;
			}
		} catch (err) {
			switch (err.name) {
				case 'IncorrectPasswordError':
					console.log("The current password entered is incorrect");
					break;
				case 'UserNotFoundError':
					console.log("User not found");
					break;
				case 'InvalidSessionError':
					console.log("Your session is invalid. Please log in again");
					break;
				default:
					console.log("Something went wrong");
					break;
			}
			return res.redirect('/dashboard');
		}
	})
module.exports = router;