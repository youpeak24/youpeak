//mongoose
const mongoose = require("mongoose");

mongoose.connect(process?.env?.MONGODB_CONNECTION_STRING, {});

const db = mongoose.connection;
module.exports = db;
