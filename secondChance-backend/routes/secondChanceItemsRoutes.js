const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });


// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        //Step 2: task 1 - Connect to MongoDB
        const db = await connectToDatabase();
        //Step 2: use the collection() method to retrieve the secondChanceItems collection
        const collection = db.collection("secondChanceItems");
        //Step 2: task 3 -Fetch all secondChanceItems
        const secondChanceItems = await collection.find({}).toArray();
        //Step 2: task 4 - Return secondChanceItems
        res.json(secondChanceItems);
    } catch (e) {
        logger.error('oops something went wrong', e)
        next(e);
    }
});

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        //Step 4: task 1 - Connect to MongoDB
        const db = await connectToDatabase();
        //Step 4: task 2 - Access the MongoDB collection
        const collection = db.collection("secondChanceItems");
        //Step 4: task 3 - Find a specific secondChanceItem by ID
        const id = req.params.id;
        const secondChanceItem = await collection.findOne({ id: id });
        //Step 4: task 4 -  Return the secondChanceItem as a JSON object. Return an error message if the item is not found.
        if (!secondChanceItem) {
            return res.status(404).send("secondChanceItem not found");
          }
          
        res.json(secondChanceItem);

    } catch (e) {
        next(e);
    }
});

// Add a new item
//router.post('/', {Step 3: Task 7 Upload the image to the images directory}, async(req, res,next) => {
    router.post('/', upload.single('file'), async(req, res,next) => {
        try {
            //Step 3: task 1 - Retrieve the database connection from db.js and store the connection to db constant
            const db = await connectToDatabase();  
            //Step 3: task 2 - Use the collection() method to retrieve the secondChanceItems collection
            const collection = db.collection("secondChanceItems");
            //Step 3: task 3 - Create a new secondChanceItem from the request body
            let secondChanceItem = req.body;
            //Step 3: task 4 - Get the last id, increment it by 1, and set it to the new secondChanceItem
            const lastItemQuery = await collection.find().sort({'id': -1}).limit(1);
            await lastItemQuery.forEach(item => {
               secondChanceItem.id = (parseInt(item.id) + 1).toString();
            });
            //Step 3: task 5 - Set the current date to the new item
            const date_added = Math.floor(new Date().getTime() / 1000);
            secondChanceItem.date_added = date_added
            //Step 3: Task 6: Add the secondChanceItem to the database
            secondChanceItem = await collection.insertOne(secondChanceItem);
            res.status(201).json(secondChanceItem);
        } catch (e) {
            next(e);
        }
    });

// Update and existing item
router.put('/:id', async(req, res,next) => {
    try {
        
        //Step 5: task 1 - Retrieve the dtabase connection from db.js and store the connection to a db constant
        const db = await connectToDatabase();
        //Step 5: Use the collection() method to retrieve the secondChanceItems collection
        const collection = db.collection("secondChanceItems");
        //Step 5: Check if the secondChanceItem exists and send an appropriate message if it doesn't exist
        const id = req.params.id;
        const secondChanceItem = await collection.findOne({ id });
        if (!secondChanceItem) {
            logger.error('secondChanceItem not found');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }
        //Step 5: task 4 - Update the item's attributes
        secondChanceItem.category = req.body.category;
        secondChanceItem.condition = req.body.condition;
        secondChanceItem.age_days = req.body.age_days;
        secondChanceItem.description = req.body.description;
        secondChanceItem.age_years = Number((secondChanceItem.age_days/365).toFixed(1));
        secondChanceItem.updatedAt = new Date();

        const updatepreloveItem = await collection.findOneAndUpdate(
            { id },
            { $set: secondChanceItem },
            { returnDocument: 'after' }
        );

        //Step 5: task 5 - Send confirmation
        if(updatepreloveItem) {
            res.json({"uploaded":"success"});
        } else {
            res.json({"uploaded":"failed"});
        }
    } catch (e) {
        next(e);
    }
});

// Delete an existing item
router.delete('/:id', async(req, res,next) => {
    try {
        
        //Step 6: task 1 - Retrieve the database connection from db.js and store the connection to the db constant
        const db = await connectToDatabase();
        //Step 6: task 2 - Use the collection() method to retrieve the secondChanceItem collection
        const collection = db.collection("secondChanceItems");
        //Step 6: task 3 - Find a specific secondChanceItem by ID using the collection.fineOne() method and send an appropriate message if it doesn't exist
        const id = req.params.id;
        const secondChanceItem = await collection.findOne({ id });
        if (!secondChanceItem) {
        logger.error('secondChanceItem not found');
        return res.status(404).json({ error: "secondChanceItem not found" });
        }
        //Step 6: task 4 - Delete the object and send an appropriate message
        await collection.deleteOne({ id });
        const deleteItem = await collection.deleteOne({ id });
        res.json({"deleted":"success"});
        
    } catch (e) {
        next(e);
    }
});

module.exports = router;
