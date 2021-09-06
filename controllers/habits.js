const Habit = require('../models/habit');
const HabitLog = require('../models/habitLog');

const frequencies = ['daily']; 

const renderDashboard = async (req, res) => {
	try {
		const habits = await Habit.find({ creator: req.user.id });
		for (let habit of habits) {
			habit = await autoTrackHabit(habit);
		}
		return res.render('dashboard', { habits });
	} catch (err) {
		req.flash('error', err.message);
		res.redirect ('/dashboard'); 
		//To be replaced by an error page as this would lead to an infinite loop
	}
};

const showHabit = async (req, res) => {
	try {
		const habitId = req.params.habitId;
		const habit = await Habit.findById(habitId);
		await autoTrackHabit(habit);
		await enableDisableTracking(habit);
		res.render('habits/show', { habit });
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

	return habit;
}

async function enableDisableTracking(habit) {
	let currentDate = new Date();
	console.log(habit);
	console.log(currentDate);
	if (habit.due > currentDate && habit.due.getDate()!== currentDate.getDate()) {
		habit.is_tracking_enabled = false;
	} else {
		habit.is_tracking_enabled = true;
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
		res.redirect(`/habits/${habit.id}`);
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