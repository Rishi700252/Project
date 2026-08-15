const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const tripsController = require("../controllers/trips.js");
const { isLoggedIn, isTripOwner, validateTrip } = require("../middleware.js");
const rateLimit = require('express-rate-limit');

const tripLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 requests per windowMs
    message: "Too many trips generated from this IP, please try again after an hour"
});

router.route("/")
    .get(isLoggedIn, wrapAsync(tripsController.indexTrips))
    .post(isLoggedIn, tripLimiter, validateTrip, wrapAsync(tripsController.generateItinerary));

router.get("/new", isLoggedIn, wrapAsync(tripsController.renderNewTripForm));

router.route("/:id")
    .get(isLoggedIn, isTripOwner, wrapAsync(tripsController.showTrip));

module.exports = router;
