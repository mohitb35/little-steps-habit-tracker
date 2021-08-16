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
		try {
			let { name, email, password } = req.body.user;
			const user = new User({ name, email });
			const savedUser = await User.register(user, password);
			req.login(savedUser, function(err) {
				if (err) throw err;
				return res.redirect('/dashboard');
			});
		} catch (err) {
			req.flash('error', err.message);
			res.redirect('/register');
		}
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
			failureFlash: true,
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
		if (!req.isAuthenticated()) {
			return res.redirect('/login');
		}
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
					req.flash('error', 'The current password entered is incorrect');
					break;
				case 'UserNotFoundError':
					req.flash('error', 'User not found');
					break;
				case 'InvalidSessionError':
					req.flash('error', 'Your session is invalid. Please log in again');
					break;
				default:
					req.flash('error', 'Something went wrong');
					break;
			}
			return res.redirect('/change-password');
		}
	})
module.exports = router;