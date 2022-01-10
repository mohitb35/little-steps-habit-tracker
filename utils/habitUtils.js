const HabitLog = require('../models/habitLog');
const User = require('../models/user');

/**
 * Function to autotrack habits, if they have not been tracked for a few days. 
 * Sets 'missed' status for HabitLogs on the missed dates.
 * Updates the due date, next due date for habit, along with streak and status.
 * Creates a new HabitLog entry for the latest due date.
 * All updates are saved to DB.
 * @param {Object} habit - habit Object
 * @returns {Object} updated habit Object
 */
async function autoTrackHabit (habit) {
	// check if habit due date has passed
	let currentDate = new Date();
	let cutoffDate = new Date(currentDate);
	
	cutoffDate.setDate(currentDate.getDate() - 2);
	// console.log("Cutoff:", cutoffDate);

	// While the due date is before cutoff date
	while (cutoffDate > habit.due) {
		// console.log('updating missed due dates');
		// 1. update habit log entry for due date -> update status to missed
		let updatedLog = await HabitLog.findByIdAndUpdate( 
			habit.last_log,
			{ status: 'missed' }, 
			{ new: true, useFindAndModify: false, runValidators: true }
		);
		
		// console.log("Updated log:", updatedLog);

		// 2. update due to next due and interval next_due
		habit.due = habit.next_due;
		habit.next_due = getNextDate(habit.due, habit.interval);

		// 3. Add a new entry in habit log with the new due date
		let newLog = new HabitLog({
			habit: habit.id,
			date: habit.due,
			status: 'pending'
		});

		habit.last_log = newLog.id;
		// console.log("new log:", newLog);
		// console.log("Updated habit:", habit);

		// 4. Save changes to DB
		await habit.save();
		await newLog.save();
	}

	await updateStreak(habit);
	await updateStatus(habit);
	return habit;
}

/**
 * Function to enable or disable tracking for a habit
 * Disables tracking if habit has been tracked till current date
 * All updates are saved to DB.
 * @param {Object} habit habit Object
 * @returns {Object} updated habit Object
 */
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

/**
 * Updates the last autotracked date for a specific user and saves to DB
 * @param {string} userId - id of user
 * @param {Date} currentDate - current date
 */
async function updateLastAutotracked(userId, currentDate) {
	await User.findByIdAndUpdate(
		userId,
		{ last_autotracked: currentDate },
		{ new: true, useFindAndModify: false, runValidators: true }
	);
}

/**
 * Updates streak count for a given habit and saves to DB
 * @param {Object} habit - habit Object
 * @returns {Object} updated Habit Object 
 */
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

/**
 * Updates status for a given habit, based on last 7 days logs and saves to DB
 * @param {Object} habit - habit Object
 * @returns {Object} updated Habit Object 
 */
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

/**
 * Fetches habit logs for the last 30 days, or full logs (if less than 30 days are available)
 * @param {Object} habit - habit Object 
 * @returns {Object} HabitLogs for last 30 days
 */
async function getHistory (habit) {
	const history = await HabitLog.find({
		habit: habit.id, 
		status: { $in: ["missed", "complete"] } 
	})
	.limit(30)
	.sort({ date: 'desc' });

	return history;
}

/**
 * Increments date by provided interval
 * @param {Date} date 
 * @param {number} interval 
 * @returns {Date} next date
 */
function getNextDate(date, interval) {
	let nextDate = new Date(date);
	nextDate.setDate(date.getDate() + interval);
	return nextDate;
}

module.exports = {
	autoTrackHabit,
	enableDisableTracking,
	updateLastAutotracked,
	updateStreak,
	updateStatus,
	getHistory,
	getNextDate
};