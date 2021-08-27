const express = require('express');
const router = express.Router();

const habitsController = require('../controllers/habits');
const { isLoggedIn, isCreator } = require('../middleware');

router.route('/')
	.get( (req, res) => {
		res.redirect('/dashboard');
	})
	.post( isLoggedIn, habitsController.createHabit );

router.get('/new', isLoggedIn, habitsController.renderNewHabitForm );

router.route('/:habitId')
	.get( isLoggedIn, isCreator, habitsController.showHabit )
	.put( isLoggedIn, isCreator, habitsController.updateHabit )
	.delete( isLoggedIn, isCreator, habitsController.deleteHabit );

router.get('/:habitId/edit', isLoggedIn, isCreator, habitsController.renderEditHabitForm );

// Pending
router.put('/:habitId/track', (req, res) => {
	res.send(`Tracking habit: ${req.params.habitId}`);
})

module.exports = router;