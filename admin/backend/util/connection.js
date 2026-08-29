//dns
const dns = require("node:dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

//mongoose
const mongoose = require("mongoose");

mongoose.connect(process?.env?.MONGODB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
module.exports = db;
