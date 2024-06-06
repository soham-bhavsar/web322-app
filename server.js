/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: ______________________ 
Student ID: ______________ 
Date: ________________
Cyclic Web App URL: _______________________________________________________
GitHub Repository URL: ______________________________________________________

********************************************************************************/ 


// Import the express module
const express = require('express');
const path = require('path');

// Require the store-service module
const storeService = require('./store-service');

// Create an instance of express
const app = express();

// Use the static middleware to serve static files from the "public" directory
app.use(express.static('public'));

// Define the port the server should listen on
const PORT = process.env.PORT || 8080;

// Initialize the store service
storeService.initialize()
  .then(() => {
    console.log('Data initialization successful');
  })
  .catch((err) => {
    console.error(`Data initialization failed: ${err}`);
  });

// Define a route for "/"
app.get('/', (req, res) => {
  res.redirect('/about');
});

// Define a route for "/about"
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Define a route for "/shop"
app.get('/shop', (req, res) => {
  storeService.getPublishedItems()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// Define a route for "/items"
app.get('/items', (req, res) => {
  storeService.getAllItems()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// Define a route for "/categories"
app.get('/categories', (req, res) => {
  storeService.getCategories()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Express http server listening on port ${PORT}`);
});
