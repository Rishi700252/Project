const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itinerarySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    startDate: Date,
    endDate: Date,
    groupSize: Number,
    budgetTier: {
        type: String,
        enum: ["budget", "mid-range", "luxury"]
    },
    interests: [{
        type: String,
        enum: ["adventure", "food", "culture", "relaxation", "nature", "nightlife"]
    }],
    days: [
        {
            dayNumber: Number,
            theme: String,
            activities: [
                {
                    time: String,
                    title: String,
                    description: String,
                    estimatedCost: Number,
                    category: {
                        type: String,
                        enum: ["food", "activity", "travel", "accommodation"]
                    }
                }
            ],
            suggestedListing: { 
                type: Schema.Types.ObjectId, 
                ref: "Listing" 
            }
        }
    ],
    totalEstimatedCost: Number,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Itinerary = mongoose.model("Itinerary", itinerarySchema);
module.exports = Itinerary;
