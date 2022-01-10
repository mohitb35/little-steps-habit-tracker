const Joi = require('joi');

// const emailRegex = /^([a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)$/;
// const nameRegex = /^[0-9a-zA-Z][0-9-a-zA-Z ]*$/;
// Apparently, it is a bad idea to validate the name, as there are too many possibilities. Just keeping a simple length check.

const userSchema = Joi.object({
	name: Joi.string().max(250).required().label('Name'),
	email: Joi.string().email().max(320).required().label('Email'),
	password: Joi.string().min(8).pattern(/\d/).pattern(/[a-zA-Z]/).required().label('Password')
});

const habitSchema = Joi.object({
	title: Joi.string().min(1).max(200).required().label('Title'),
	frequency: Joi.string().valid('daily', 'weekly', 'monthly').required().label('Frequency'),
	purpose: Joi.string().allow("").max(1000).label('Purpose')
})

module.exports = {
	userSchema,
	habitSchema
}