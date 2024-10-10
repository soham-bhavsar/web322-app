/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.
No part of this assignment has been copied manually or electronically from any other source 
(including 3rd party web sites) or distributed to other students.

Name: Soham Bhavsar 
Student ID: 136231222
Date: 09/10/2024
Replit Web App URL: 
GitHub Repository URL:
********************************************************************************/


// Import required modules
const express = require('express');
const path = require('path');
const storeService = require('./store-service.js'); // Import the store-service module

// Initialize express app
const app = express();

// Use port 3000 if 8080 is busy
const PORT = process.env.PORT || 3000;

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Redirect the root route ("/") to "/about"
app.get('/', (req, res) => res.redirect('/about'));

// Serve the about.html page
app.get('/about', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'views', 'about.html'));
});

// Get all items route
app.get('/items', async (req, res) => {
  try {
    const items = await storeService.getAllItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// Get published items route
app.get('/shop', async (req, res) => {
  try {
    const publishedItems = await storeService.getPublishedItems();
    res.json(publishedItems);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// Get all categories route
app.get('/categories', async (req, res) => {
  try {
    const categories = await storeService.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// Catch-all 404 route for undefined paths
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// Initialize the store and start the server
const startServer = async () => {
  try {
    await storeService.initialize();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to initialize the store: ${error}`);
  }
};

startServer();
