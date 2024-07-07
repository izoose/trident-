const { MongoClient } = require("mongodb");
const config = require('../data/config')

const uri = config.dbURL;
const mongoClient = new MongoClient(uri);

module.exports = {mongoClient}