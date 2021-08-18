function isLoggedIn(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.redirect('/login');
	}
	next();
}

function isNotLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/dashboard');
	}
	next();
}

module.exports = {
	isLoggedIn,
	isNotLoggedIn
}

