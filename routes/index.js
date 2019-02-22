var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// =====================
// ROOT ROUTE (LANDING PAGE)
// =====================

router.get("/", function(req, res) {
	res.render("landing");	
});

// =====================
// AUTH ROUTES
// =====================

// Show register form
router.get("/register", function(req, res) {
	res.render("register", {page: 'register'});
});
// Handle sign up logic
router.post("/register", function(req, res) {
	var newUser = new User({username: req.body.username});
	if(req.body.adminCode === 'iamadminletmein') {
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user) {
		if(err) {
			req.flash("error", err.message);
			return res.render("register", {error: err.message});
		}
		passport.authenticate("local")(req, res, function() {
			req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
			res.redirect("/campgrounds");
		});
	});
});

// Show login form
router.get("/login", function(req, res) {
	res.render("login", {page: 'login'});
});
// Handle login
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login",
		failureFlash: true,
		successFlash: "Welcome to YelpCamp!"
	}), function(req, res) {
});

// Logout
router.get("/logout", function(req, res) {
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/campgrounds");
});

module.exports = router;