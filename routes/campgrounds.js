var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var NodeGeoCoder = require('node-geocoder');

var options = {
	provider: 'google',
	httpAdapter: 'https',
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null
}

var geocoder = NodeGeoCoder(options);

// =====================
// CAMPGROUND ROUTES
// =====================


// Campground Page
// INDEX ROUTE - show all campgrounds
router.get("/", function(req, res) {
	var noMatch;
	if(req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		// Get all campgrounds from query
		Campground.find({name: regex}, function(err, allCampgrounds) {
			if(err) {
				console.log(err);
			} else {
				
				if(allCampgrounds.length == 0) {
					noMatch = "No campgrounds match that query, please try again.";
				}
				res.render("campgrounds/index", {campgrounds:allCampgrounds, page: 'campgrounds', noMatch: noMatch});
			}
		});
	} else {
		// Get all campgrounds from DB
		Campground.find({}, function(err, allCampgrounds) {
			if(err) {
				console.log(err);
			} else {
				res.render("campgrounds/index", {campgrounds:allCampgrounds, page: 'campgrounds', noMatch: noMatch});
			}
		});
	}
});

// Post request to  add new campground
// CREATE ROUTE - make new campground
router.post("/", middleware.isLoggedIn, function(req, res) {
	// Get data from form and add to campgrounds array
	var name = req.body.name;
	var image = req.body.image;
	var cost = req.body.cost;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	geocoder.geocode(req.body.location, function(err, data) {
		if(err || !data.length) {
			req.flash("error", "Invalid Address");
			return res.redirect('back');
		}
		var lat = data[0].latitude;
		var lng = data[0].longitude;
		var location = data[0].formattedAddress;

		var newCampground = {name: name, image: image, cost: cost, description: desc, author: author, location: location, lat: lat, lng: lng};
		// Create a new campground and save to db
		Campground.create(newCampground, function(err, newlyCreated) {
			if(err) {
				console.log(err);
			} else {
				// Redirect back to campgrounds
				res.redirect("/campgrounds");
			}
		});
	});
});

// Campground Form page
// NEW ROUTE - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
	res.render("campgrounds/new");
});

// Specific Campground Page
// SHOW ROUTE - show one campground
// Need to make sure that campgrounds/new is declared first or will be treated as ID route
router.get("/:id", function(req, res) {
	// Find campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
		if(err || !foundCampground) {
			req.flash("error", "Campground not found");
			res.redirect("back");
		} else {
			// Render template with campground info
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// EDIT ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

// UPDATE ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
	// find and update the correct campground
	// redirect somewhere (show page)
	geocoder.geocode(req.body.location, function(err, data) {
		if(err || !data.length) {
			req.flash("error", "Invalid Address");
			return res.redirect('back');
		}
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;

		Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
			if(err) {
				res.redirect("/campgrounds");
			} else {
				res.redirect("/campgrounds/" + req.params.id);
			}
		});
	});
});

// DESTROY ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findByIdAndRemove(req.params.id, function(err) {
		if(err) {
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	});
});

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


module.exports = router;