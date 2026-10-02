const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
require("dotenv").config({path: __dirname + "/../.env"});

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wonderlust";

main()
.then(async() =>{
    console.log("connected to db");
    await initDB();
}).catch((err)=> {console.log(err)});

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () =>{
  await Listing.deleteMany({});
  
  const user = await User.findOne({});
  const ownerId = user ? user._id : "6a537ad251e62c6309c919bb";

  for (let obj of initData.data) {
    let response = await geocodingClient.forwardGeocode({
        query: obj.location + ", " + obj.country,
        limit: 1,
    }).send();
    
    obj.owner = ownerId;
    obj.geometry = response.body.features[0].geometry;
  }

  await Listing.insertMany(initData.data);
  console.log("data was initialized");
  process.exit(0);
};

