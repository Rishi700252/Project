const Joi = require('joi');

module.exports.listingSchema=Joi.object({
    listing:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        price:Joi.number().required().min(0),
        image:Joi.string().allow("",null),
        category: Joi.string().valid("Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic", "Domes", "Boats").allow("", null)
    }).required(),
});
module.exports.reviewSchema=Joi.object({
  review: Joi.object({
    rating:Joi.number().required().min(1).max(5),
    comment:Joi.string().required(),
  }).required() 
});

module.exports.tripSchema = Joi.object({
    destination: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required().min(Joi.ref('startDate')),
    groupSize: Joi.number().required().min(1),
    budgetTier: Joi.string().valid("budget", "mid-range", "luxury").required(),
    interests: Joi.array().items(Joi.string().valid("adventure", "food", "culture", "relaxation", "nature", "nightlife")).min(1).required()
});