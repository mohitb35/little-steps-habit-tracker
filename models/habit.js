const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HabitLog = require('./habitLog');

const habitOptions = {
	timestamps: true
}

const habitSchema = new Schema (
	{
		title: {
			type: String,
			required: [true, 'Habit title required']
		},
		frequency: {
			type: String,
			required: [true, 'Habit frequency required'],
			enum: ['daily']
		},
		purpose: {
			type: String
		},
		streak: {
			type: Number
		},
		status: {
			type: String
		},
		last_completed: {
			type: Date
		},
		due: {
			type: Date
		},
		last_log: {
			type: Schema.Types.ObjectId,
			ref: 'HabitLog',
			required: [true, 'No habit log entry']
		}, 
		next_due: {
			type: Date
		},
		creator: {
			type: Schema.Types.ObjectId,
			ref: 'User', 
			required: [true, 'No creator assigned']
		},
		is_tracking_enabled: {
			type: Boolean
		}
	},
	habitOptions
);

habitSchema.virtual('prettyStartDate').get(function() {
	let date = this.createdAt;
	let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return `${ months[date.getMonth()] } ${ date.getDate() }, ${ date.getFullYear() }`;
});

habitSchema.virtual('lastCompletedText').get(function() {
	let currentDate = new Date();
	let dayCount;
	if (this.last_completed) {
		dayCount = Math.floor( Math.abs(
			(currentDate.getTime() - this.last_completed.getTime())/(24 * 60 * 60 * 1000)
		));
	} else {
		dayCount = -1;
	}
	switch (dayCount) {
		case -1: 
			return 'Not completed yet';
			break;
		case 0: 
			return 'today';
			break;
		case 1:
			return 'yesterday';
			break;
		default:
			if (dayCount < 7) {
				return `${dayCount} days ago`;
			} else if (dayCount < 30) {
				let weekCount = Math.floor(dayCount/7);
				return `${weekCount} week${weekCount > 1 ? 's': ''} ago`;
			} else if (dayCount < 365) {
				let monthCount = Math.floor(dayCount/30);
				return `${monthCount} month${monthCount > 1 ? 's': ''} ago`;
			} else {
				let yearCount = Math.floor(dayCount/365);
				return `${yearCount} year${yearCount > 1 ? 's': ''} ago`;
			}
	};
});

habitSchema.post('findOneAndDelete', async (deletedHabit) => {
	console.log("Post");
	console.log(deletedHabit);
	if (deletedHabit) {
		await HabitLog.deleteMany({
			habit: deletedHabit
		})
	};
})

module.exports = mongoose.model('Habit', habitSchema);