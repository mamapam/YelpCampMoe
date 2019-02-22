// Initialize environment variables
require('dotenv').config();
// Initialize all the packages
var express     = require("express"),
    app         = express(), 
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds");

// Requiring routes
var commentRoutes    = require("./routes/comments"),
	  campgroundRoutes = require("./routes/campgrounds"),
	  indexRoutes      = require("./routes/index");

// Connect the db
//mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true });
mongoose.connect("mongodb+srv://dbmamapam:db2admin@cluster0-abkdn.mongodb.net/yelp_camp?retryWrites=true", { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// Use moment for comment and campground timing
app.locals.moment = require("moment");


// Seed the database
// seedDB();

// Passport Configuration
app.use(require("express-session")({
	secret: "Once again, Rusty wins cutest dog!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to pass in user to all routes
app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

// Tells app to use 3 route files required
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

// Listen on server
app.listen(3000, function() {
	console.log("The YelpCamp server has started....");
});