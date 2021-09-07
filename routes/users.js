const express = require('express');
const router = express.Router();
const passport = require('passport');

const usersController = require('../controllers/users');
const { isLoggedIn, isNotLoggedIn } = require('../middleware');

router.route('/register')
	.get( isNotLoggedIn, usersController.renderRegisterForm)
	.post( usersController.createUser );

router.route('/login')
	.get( isNotLoggedIn, usersController.renderLoginForm )
	.post( 
		passport.authenticate('local', {
			failureFlash: true,
			failureRedirect: '/login'
		}), 
		usersController.login
	);

router.post('/logout', usersController.logout);

router.route('/change-password')
	.get( isLoggedIn, usersController.renderChangePasswordForm )
	.put( isLoggedIn, usersController.changePassword );
	
module.exports = router;