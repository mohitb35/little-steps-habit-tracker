const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const habitLogSchema = new Schema({
	habit: {
		type: Schema.Types.ObjectId,
		ref: 'Habit', 
		required: [true, 'No habit assigned for habit log entry']
	},
	date: {
		type: Date,
		required: [true, 'Missing date for habit log entry']
	},
	status: {
		type: String,
		enum: ['complete', 'missed', 'pending'],
		required: [true, 'Missing status for habit log entry']
	}
});

module.exports = mongoose.model('HabitLog', habitLogSchema);