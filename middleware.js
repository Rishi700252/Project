 const Listing =require("./models/listing");
  const Review =require("./models/review");
 const Itinerary = require("./models/itinerary");
 const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema, tripSchema} =require("./schema.js");
 
module.exports.isLoggedIn =(req,res,next) =>{
     if(!req.isAuthenticated()){
        req.session.redirectUrl = req.method === 'GET' ? req.originalUrl : (req.headers.referer || "/listings");

    req.flash("error","You must be logged in!");
   return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl =(req,res,next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl =req.session.redirectUrl;

    }
    next();
};

module.exports.isOwner =async(req,res,next) =>{
     let {id} =req.params;
   let listing= await Listing.findById(id);
   if(!listing.owner._id.equals(res.locals.currUser._id)){
    req.flash("error","You are not the owner of this listing");
  return  res.redirect(`/listings/${id}`);
   }

   next();
};

module.exports. validateListing =(req,res,next) =>{
     let {error}= listingSchema.validate(req.body);
   
    if(error){
        let errMsg=error.details.map((el) =>el.message).join(",");
        throw new ExpressError(404,errMsg);
    }else{
        next();
    }

};
module.exports.validateReview =(req,res,next) =>{
     let {error}= reviewSchema.validate(req.body);
   
    if(error){
        let errMsg=error.details.map((el) =>el.message).join(",");
        throw new ExpressError(404,errMsg);
    }else{
        next();
    }

};
module.exports.isreviewauthor =async(req,res,next) =>{
     let {id ,reviewId} =req.params;
   let review= await Review.findById(reviewId);
   if(!review.author.equals(res.locals.currUser._id)){
    req.flash("error","You are not the author of this review");
  return  res.redirect(`/listings/${id}`);
   }

   next();
};

module.exports.isTripOwner = async(req,res,next) => {
    let {id} = req.params;
    let itinerary = await Itinerary.findById(id);
    if(!itinerary.user.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this trip");
        return res.redirect(`/trips`);
    }
    next();
};

module.exports.validateTrip = (req,res,next) => {
    let {error} = tripSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) =>el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};