const Habit = require('../models/habit');
const { userSchema, habitSchema } = require('./schemas');
const ExpressError = require('./ExpressError');

function isLoggedIn(req, res, next) {
	if (!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
		req.flash('error', 'Please log in first');
		return res.redirect('/login');
	}
	next();
}

function isNotLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/dashboard');
	}
	next();
}

async function isCreator(req, res, next) {
	const { habitId } = req.params;
	const foundHabit = await Habit.findById(habitId);
	if (!foundHabit) {
		req.flash('error', 'Habit not found');
		return res.redirect('/dashboard');
	}
	if (!foundHabit.creator.equals(req.user.id)) {
		req.flash('error', 'You are not authorized to do that');
		return res.redirect('/dashboard');
	}
	next();
}

const validateUserInfo = async (req, res, next) => {
	const { error } = userSchema.validate(req.body.user);

	if (error) {
		console.log(error);
		const msg = error.details.map((el => el.message)).join(',');
		// throw new ExpressError(400, msg);
		next(new ExpressError(400, msg));
	}

	next();
}

const validateHabitInfo = async (req, res, next) => {
	const { error } = habitSchema.validate(req.body.habit);

	if (error) {
		console.log(error);
		const msg = error.details.map((el => el.message)).join(',');
		next(new ExpressError(400, msg));
	}

	next();
}

module.exports = {
	validateUserInfo,
	validateHabitInfo,
	isLoggedIn,
	isNotLoggedIn,
	isCreator
};