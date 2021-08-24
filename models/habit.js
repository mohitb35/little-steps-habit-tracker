const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
		next_due: {
			type: Date
		},
		creator: {
			type: Schema.Types.ObjectId,
			ref: 'User', 
			required: [true, 'No creator assigned']
		}
	},
	habitOptions
);

habitSchema.virtual('prettyStartDate').get(function() {
	let date = this.createdAt;
	let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return `${ months[date.getMonth()] } ${ date.getDate() }, ${ date.getFullYear() }`;
});

module.exports = mongoose.model('Habit', habitSchema);