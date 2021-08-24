const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;

const userRoutes = require('./routes/users');
const habitRoutes = require('./routes/habits');

const Habit = require('./models/habit');
const User = require('./models/user');

mongoose.connect(
	'mongodb://localhost:27017/lsht_app', //specifies URL, port and database name
	{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }
)
.then(() => {
	console.log("Connected to Little Steps DB");
})
.catch(error => {
	console.log("Error connecting to Little Steps DB");
	console.log(`${error.name} - ${error.message}`);
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const sessionConfig = {
	name: 'lsht',
	secret: 'thishastobechangedlater',
	resave: false,
	saveUninitialized: true,
	cookie: {
		expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
		maxAge: (1000 * 60 * 60 * 24 * 7),
		// secure: true,
		httpOnly: true
	}
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(methodOverride('_method'));

app.use((req, res, next) => {
	// console.log(new Date().toLocaleString());
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	res.locals.currentUser = req.user;
	// console.log(res.locals);
	next();
})

app.get('/', (req, res) => {
	if (req.isAuthenticated()) {
		return res.redirect('/dashboard');
	}
	res.redirect('/login');
});

app.get('/dashboard', async (req, res) => {
	if (req.user) {
		const habits = await Habit.find({ creator: req.user.id });
		console.log(habits);
		return res.render('dashboard', { habits });
	};
	res.redirect('/login');
});

app.use('/', userRoutes);
app.use('/habits', habitRoutes);

let port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server started at http://localhost:${port} - ${new Date().toLocaleString()}`);
})

