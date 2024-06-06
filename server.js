// Import the express module
const express = require('express');
const path = require('path');

// Create an instance of express
const app = express();

// Use the static middleware to serve static files from the "public" directory
app.use(express.static('public'));

// Define the port the server should listen on
const PORT = process.env.PORT || 8080;

// Define a route for "/"
app.get('/', (req, res) => {
  res.redirect('/about');
});

// Define a route for "/about"
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Express http server listening on port ${PORT}`);
});
