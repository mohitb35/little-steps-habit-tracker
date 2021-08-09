const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;

const userRoutes = require('./routes/users');

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

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
})

app.get('/', (req, res) => {
	res.send('Home route');
});

app.get('/dashboard', (req, res) => {
	console.log(req);
	res.render('dashboard');
});

app.use('/', userRoutes);

let port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server started at http://localhost:${port} - ${new Date().toLocaleString()}`);
})

