// db.js
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

// MongoDB connection URL with authentication options
let url = `${process.env.MONGO_URL}`;

let dbInstance = null;
const dbName = `${process.env.MONGO_DB}`;

async function connectToDatabase() {
    if (dbInstance){
        return dbInstance
    };

    const client = new MongoClient(url);      

    // Task 1: Connect to MongoDB
    await client.connect()
    //console.log("Connected successfully to server")

    // Task 2: Connect to database secondChance and store in variable dbInstance
    //const 
    dbInstance=client.db(dbName)

    // Task 3: Return database instance
    return dbInstance
}

module.exports = connectToDatabase;
