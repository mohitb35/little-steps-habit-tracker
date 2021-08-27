const Habit = require('./models/habit');

function isLoggedIn(req, res, next) {
	if (!req.isAuthenticated()) {
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

module.exports = {
	isLoggedIn,
	isNotLoggedIn,
	isCreator
};

