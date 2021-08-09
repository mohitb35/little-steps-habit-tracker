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
		async (req, res) => {
			res.redirect('/dashboard');
		}
	);

router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/dashboard');
})

module.exports = router;