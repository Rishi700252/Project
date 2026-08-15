const Itinerary = require("../models/itinerary");
const Listing = require("../models/listing");
const generateItinerary = require("../utils/generateItinerary");

module.exports.renderNewTripForm = async (req, res) => {
    let listingId = req.query.listingId;
    let listing = null;
    if (listingId) {
        listing = await Listing.findById(listingId);
    }
    res.render("trips/new.ejs", { listing });
};

module.exports.generateItinerary = async (req, res) => {
    let { destination, startDate, endDate, groupSize, budgetTier, interests } = req.body;
    
    let start = new Date(startDate);
    let end = new Date(endDate);
    let tripLength = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Cap at 14 days
    if (tripLength > 14) {
        tripLength = 14;
    }
    
    // Call Gemini
    const itineraryData = await generateItinerary(destination, tripLength, groupSize, budgetTier, interests);
    
    let totalEstimatedCost = 0;
    
    // Process days and find suggested listings
    for (let day of itineraryData.days) {
        let dayCost = 0;
        for (let activity of day.activities) {
            dayCost += (activity.estimatedCost || 0);
        }
        totalEstimatedCost += dayCost;
        
        // Find suggested listing
        const budgetRanges = {
            "budget": { $lte: 3000 },
            "mid-range": { $gt: 3000, $lte: 8000 },
            "luxury": { $gt: 8000 }
        };
        
        const priceFilter = budgetRanges[budgetTier] || {};
        
        const matchingListing = await Listing.findOne({
            $or: [
                { location: { $regex: destination, $options: 'i' } },
                { country: { $regex: destination, $options: 'i' } }
            ],
            price: priceFilter
        });
        
        if (matchingListing) {
            day.suggestedListing = matchingListing._id;
        }
    }
    
    const newItinerary = new Itinerary({
        user: req.user._id,
        destination,
        startDate: start,
        endDate: end,
        groupSize,
        budgetTier,
        interests,
        days: itineraryData.days,
        totalEstimatedCost
    });
    
    const savedItinerary = await newItinerary.save();
    req.flash("success", "Your AI Trip Itinerary has been successfully generated!");
    res.redirect(`/trips/${savedItinerary._id}`);
};

module.exports.showTrip = async (req, res) => {
    const { id } = req.params;
    const itinerary = await Itinerary.findById(id).populate("days.suggestedListing");
    if (!itinerary) {
        req.flash("error", "The trip you requested does not exist.");
        return res.redirect("/trips");
    }
    res.render("trips/show.ejs", { itinerary });
};

module.exports.indexTrips = async (req, res) => {
    const itineraries = await Itinerary.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.render("trips/index.ejs", { itineraries });
};
