if(process.env.NODE_ENV !== "production"){
	require('dotenv').config(); 
}

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const mongoSanitize = require('express-mongo-sanitize');
// const LocalStrategy = require('passport-local').Strategy;

const userRoutes = require('./routes/users');
const habitRoutes = require('./routes/habits');

const User = require('./models/user');

const habitsController = require('./controllers/habits');
const { isLoggedIn } = require('./utils/middleware');
const ExpressError = require('./utils/ExpressError');

const dbUrl = process.env.DB_URL;//database URL (mongo atlas cloud)

//specifies URL, port and database name (local)
/*const dbUrl = 'mongodb://localhost:27017/lsht_app';*/


mongoose.connect(
	dbUrl,
	{ 
		useNewUrlParser: true, 
		useUnifiedTopology: true, 
		useFindAndModify: false, 
		useCreateIndex: true 
	}
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

app.use(mongoSanitize());

const secret = process.env.SECRET || 'thishastobechangedlater';

const store = new MongoStore({
	mongoUrl: dbUrl,
	secret,
	touchAfter: 24 * 60 * 60,
	mongoOptions: { useUnifiedTopology: true }
});

store.on("error", function(error) {
	console.log("Session store error", error);
})

const sessionConfig = {
	store,
	name: 'lsht',
	secret,
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

app.get('/dashboard', isLoggedIn, habitsController.renderDashboard);
app.get('/error', (req, res) => {
	res.render('error');
});

app.use('/', userRoutes);
app.use('/habits', habitRoutes);

// Catch All Route
app.all('*', (req, res, next) => {
	res.render('404');
})

// Error handling middleware
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Something went wrong!';
 	// res.send("Something went wrong!!");
	res.status(statusCode).render('error', { err });
})

let port = process.env.PORT || 3000;
app.listen(port, () => {
	if (process.env.NODE_ENV !== "production") {
		console.log(`${new Date().toLocaleString()} - Server started at http://localhost:${port}`);
	} else {
		console.log(`${new Date().toLocaleString()} - Server started for https://little-steps.herokuapp.com at port ${port}`);
	}
	
})

