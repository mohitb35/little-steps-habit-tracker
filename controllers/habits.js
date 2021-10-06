const Habit = require('../models/habit');
const User = require('../models/user');
const HabitLog = require('../models/habitLog');

const frequencies = ['daily']; 

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

async function autoTrackHabit (habit) {
	// check if habit due date has passed
	let currentDate = new Date();
	let cutoffDate = new Date(currentDate);
	
	cutoffDate.setDate(currentDate.getDate() - 2);
	// let dueDate = habit.due;
	console.log("Cutoff:", cutoffDate);

	// While the due date is before cutoff date
	while (cutoffDate > habit.due) {
		console.log('updating missed due dates');
		// 1. update habit log entry for due date -> update status to missed
		let updatedLog = await HabitLog.findByIdAndUpdate( 
			habit.last_log,
			{ status: 'missed' }, 
			{ new: true, useFindAndModify: false, runValidators: true }
		);
		
		console.log("Updated log:", updatedLog);

		// 2. update due to next due and interval next_due
		habit.due = habit.next_due;
		habit.next_due = getNextDate(habit.due, 1);

		// 3. Add a new entry in habit log with the new due date
		let newLog = new HabitLog({
			habit: habit.id,
			date: habit.due,
			status: 'pending'
		});

		habit.last_log = newLog.id;
		console.log("new log:", newLog);
		console.log("Updated habit:", habit);

		// 4. Save changes to DB
		await habit.save();
		await newLog.save();
	}

	await updateStreak(habit);
	await updateStatus(habit);
	return habit;
}

async function enableDisableTracking(habit) {
	let currentDate = new Date();
	if (habit.due > currentDate && habit.due.getDate()!== currentDate.getDate()) {
		habit.is_tracking_enabled = false;
	} else {
		habit.is_tracking_enabled = true;
	}
	await habit.save();
	return habit;
}

async function updateLastAutotracked(userId, currentDate) {
	await User.findByIdAndUpdate(
		userId,
		{ last_autotracked: currentDate },
		{ new: true, useFindAndModify: false, runValidators: true }
	);
}

async function updateStreak (habit) {
	// Get habit logs with status 'missed/complete' ordered in reverse order of date
	const habitLogs = await HabitLog.find({ 
		habit: habit.id, 
		status: { $in: ["missed", "complete"] } 
	}).sort({ date: 'desc' });
	
	let streak = 0;
	for (let log of habitLogs) {
		if (log.status === 'complete') {
			streak++;
		} else {
			break;
		}
	}

	habit.streak = streak;
	await habit.save();
	return habit;
}

async function getHistory (habit) {
	const history = await HabitLog.find({
		habit: habit.id, 
		status: { $in: ["missed", "complete"] } 
	})
	.limit(30)
	.sort({ date: 'desc' });

	return history;
}

async function updateStatus (habit) {
	const last7days = await HabitLog.find({
		habit: habit.id, 
		status: { $in: ["missed", "complete"] } 
	})
	.limit(7)
	.sort({ date: 'desc' });

	let missedCount = 0;

	for (let log of last7days) {
		if (log.status === "missed") missedCount++;
	};

	if (missedCount === 0 ) {
		habit.status = "On track";
	} else if (missedCount <= 2 ) {
		habit.status = "Could be better";
	} else {
		habit.status = "Off the rails";
	}

	await habit.save();
	return habit;
}

const renderNewHabitForm = (req, res) => {
	res.render('habits/new', { frequencies });
};

const createHabit = async (req, res) => {
	try {
		const habit = new Habit(req.body.habit);
		habit.creator = req.user.id;
		habit.due = new Date();
		habit.next_due = getNextDate(habit.due, 1);
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

// move to utils
function getNextDate(date, interval) {
	let nextDate = new Date(date);
	nextDate.setDate(date.getDate() + interval);
	return nextDate;
}

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
		habit.next_due = getNextDate(habit.due, 1);
		
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