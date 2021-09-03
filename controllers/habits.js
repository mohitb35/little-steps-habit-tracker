const Habit = require('../models/habit');
const HabitLog = require('../models/habitLog');

const frequencies = ['daily']; 

const renderDashboard = async (req, res) => {
	try {
		const habits = await Habit.find({ creator: req.user.id });
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
		res.render('habits/show', { habit });
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
function getNextDate(date, increment) {
	let nextDate = new Date(date);
	nextDate.setDate(date.getDate() + increment);
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
			habitId, habit, { new: true, useFindAndModify: false, runValidators: true }
		);
		console.log(updatedHabit)
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


module.exports = {
	renderDashboard,
	showHabit,
	renderNewHabitForm,
	createHabit,
	renderEditHabitForm,
	updateHabit,
	deleteHabit
};