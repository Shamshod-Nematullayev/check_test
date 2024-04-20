const { connectMongo } = require("./config/db");

require("dotenv").config({ path: "./config/.env" });

connectMongo();
require("./scenes");
require("./middleware");
require("./actions");
