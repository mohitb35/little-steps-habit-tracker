const express = require('express');
const router = express.Router();

const Habit = require('../models/habit');

const { isLoggedIn } = require('../middleware');

const frequencies = ['daily']; 

router.route('/')
	.get( (req, res) => {
		res.redirect('dashboard');
	})
	.post( isLoggedIn, async (req, res) => {
		try {
			const habit = new Habit(req.body.habit);
			habit.creator = req.user.id;
			await habit.save();
			req.flash('success', 'New habit created');
			res.redirect(`/habits/${habit.id}`); 
		} catch (err) {
			req.flash('error', err.message);
			res.redirect('/habits/new');
		}
	});

router.get('/new', isLoggedIn, (req, res) => {
	res.render('habits/new', { frequencies });
})

router.route('/:habitId')
	.get( async (req, res) => {
		try {
			const habitId = req.params.habitId;
			const habit = await Habit.findById(habitId);
			res.render('habits/show', { habit });
		} catch (err) {
			req.flash('error', err.message);
			res.redirect('/dashboard');
		}
	})
	.put( async (req, res) => {
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
	})
	.delete( (req, res) => {
		res.send(`Deleting a habit: ${req.params.habitId}`);
	});

router.get('/:habitId/edit', async (req, res) => {
	try {
		const habitId = req.params.habitId;
		const habit = await Habit.findById(habitId);
		res.render('habits/edit', { habit, frequencies });
	} catch (err) {
		req.flash('error', err.message);
		res.redirect('/habits/habitId');
	}
})

router.put('/:habitId/track', (req, res) => {
	res.send(`Tracking habit: ${req.params.habitId}`);
})

module.exports = router;