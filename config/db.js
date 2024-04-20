const { default: mongoose } = require("mongoose");

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Mongo connection successfuly`);
  } catch (err) {
    console.log(`Error occured on connect to mongo`);
    throw new Error(err);
  }
}

module.exports = { connectMongo };
