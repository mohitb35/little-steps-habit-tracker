const express = require('express');
const router = express.Router();

router.route('/')
	.get( (req, res) => {
		res.redirect('dashboard');
	})
	.post( (req, res) => {
		res.send('Creating a habit');
	});

router.get('/new', isLoggedIn, (req, res) => {
	res.render('habits/new');
})

router.route('/:habitId')
	.get( (req, res) => {
		res.send(`Viewing a habit: ${req.params.habitId}`);
	})
	.put(  (req, res) => {
		res.send(`Updating a habit: ${req.params.habitId}`);
	})
	.delete( (req, res) => {
		res.send(`Deleting a habit: ${req.params.habitId}`);
	});

router.get('/:habitId/edit', (req, res) => {
	res.send(`Edit habit form comes here: ${req.params.habitId}`);
})

router.put('/:habitId/track', (req, res) => {
	res.send(`Tracking habit: ${req.params.habitId}`);
})

module.exports = router;