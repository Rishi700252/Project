const mongoose =require("mongoose");
const initData =require("./data.js");
const Listing =require("../models/listing.js");
const MONGO_URL ="mongodb://127.0.0.1:27017/wonderlust";

main()
.then(async() =>{
    console.log("connected to db");
    await initDB();
}).catch((err)=> {console.log(err)}
);

async function main() {
  await mongoose.connect(MONGO_URL);

}
const initDB=async () =>{
  await Listing.deleteMany({});

 initData.data= initData.data.map((obj) =>({...obj,owner:"6a537ad251e62c6309c919bb"}));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

