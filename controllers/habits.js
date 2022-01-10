const Habit = require('../models/habit');
const HabitLog = require('../models/habitLog');

const { 
	autoTrackHabit,
	enableDisableTracking,
	updateLastAutotracked,
	updateStreak,
	updateStatus,
	getHistory,
	getNextDate
} = require('../utils/habitUtils');

const frequencies = ['daily', 'weekly', 'monthly']; 

const renderDashboard = async (req, res, next) => {
	try {
		const habits = await Habit.find({ creator: req.user.id })
			.sort({ last_completed: 'asc' });

		let { last_autotracked } = req.user;
		let diff = 0;
		let currentDate = new Date();

		if (last_autotracked) {
			diff = currentDate - last_autotracked;
		}

		if ( diff === 0 || diff > (24 * 60 * 60 * 1000) ) {
			for (let habit of habits) {
				await autoTrackHabit(habit);
				await enableDisableTracking(habit);
			}
			await updateLastAutotracked(req.user.id, currentDate);
		}

		return res.render('dashboard', { habits });
	} catch (err) {
		// req.flash('error', err.message);
		console.dir(err);
		next(err);
	}
};

const showHabit = async (req, res) => {
	try {
		const habitId = req.params.habitId;
		const habit = await Habit.findById(habitId);

		let { last_autotracked } = req.user;
		let diff = 0;
		let currentDate = new Date();

		if (last_autotracked) {
			diff = currentDate - last_autotracked;
		}

		if ( diff === 0 || diff > (24 * 60 * 60 * 1000) ) {
			await autoTrackHabit(habit);
			await enableDisableTracking(habit);
		}

		const history = await getHistory(habit);
		res.render('habits/show', { habit, history });
	} catch (err) {
		req.flash('error', err.message);
		res.redirect('/dashboard');
	}
};

const renderNewHabitForm = (req, res) => {
	res.render('habits/new', { frequencies });
};

const createHabit = async (req, res) => {
	try {
		const habit = new Habit(req.body.habit);
		habit.creator = req.user.id;
		habit.due = new Date();
		habit.next_due = getNextDate(habit.due, habit.interval);
		const habitLog = new HabitLog({
			habit: habit.id,
			date: habit.due,
			status: 'pending'
		});
		habit.last_log = habitLog.id;
		const savedHabit = await habit.save();
		const savedLog = await habitLog.save();
		await updateStreak(habit);
		await enableDisableTracking(habit);
		req.flash('success', 'New habit created');
		res.redirect(`/habits/${habit.id}`); 
	} catch (err) {
		req.flash('error', err.message);
		res.redirect('/habits/new');
	}
};

const renderEditHabitForm = async (req, res) => {
	try {
		const habitId = req.params.habitId;
		const habit = await Habit.findById(habitId);
		res.render('habits/edit', { habit, frequencies });
	} catch (err) {
		req.flash('error', err.message);
		res.redirect('/habits/habitId');
	}
};

const updateHabit = async (req, res) => {
	try {
		const habitId = req.params.habitId;
		const habit = req.body.habit;
		const updatedHabit = await Habit.findByIdAndUpdate(
			habitId, 
			habit, 
			{ new: true, useFindAndModify: false, runValidators: true }
		);
		updatedHabit.next_due = getNextDate(updatedHabit.due, updatedHabit.interval);
		await updatedHabit.save();
		req.flash('success', 'Habit updated successfully');
		res.redirect(`/habits/${updatedHabit.id}`);
	} catch (err) {
		req.flash('error', err.message);
		res.redirect(`/habits/${habit.id}/edit`);
	}
};

const deleteHabit = async (req, res) => {
	try { 
		const habitId = req.params.habitId;
		const deletedHabit = await Habit.findByIdAndDelete(habitId);
		req.flash('success', 'Habit deleted successfully');
		res.redirect('/dashboard');
	} catch (err) {
		req.flash('error', err.message);
		res.redirect(`/habits/${habitId}`);
	}
}

const trackHabit = async (req, res) => {
	// res.send(`Tracking habit: ${req.params.habitId}`);
	try {
		// Fetch habit details
		const habitId = req.params.habitId;
		const habit = await Habit.findById(habitId);
		// Update habit_log for due_date as completed
		let updatedLog = await HabitLog.findByIdAndUpdate(
			habit.last_log,
			{ status: 'complete' }, 
			{ new: true, useFindAndModify: false, runValidators: true }
		)
		// Update last_completed, set next due date, and update next_due, creating a new habit_log entry, and updating the last_log for the habit
		habit.last_completed = habit.due;
		habit.due = habit.next_due;
		habit.next_due = getNextDate(habit.due, habit.interval);
		
		let newLog = new HabitLog({
			habit: habit.id,
			date: habit.due,
			status: 'pending'
		});

		habit.last_log = newLog.id;

		await habit.save();
		await newLog.save();
		await updateStreak(habit);
		await updateStatus(habit);
		await enableDisableTracking(habit);
		let referingUrl = req.get('Referer');
		req.flash('success', 'Habit completed successfully');
		res.redirect(referingUrl);
	} catch (err) {
		req.flash('error', err.message);
		res.redirect(`/habits/${habit.id}`);
	}
};

module.exports = {
	renderDashboard,
	showHabit,
	renderNewHabitForm,
	createHabit,
	renderEditHabitForm,
	updateHabit,
	deleteHabit,
	trackHabit
};