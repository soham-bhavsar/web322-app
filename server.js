/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Zexing Cheng
Student ID: 162654214
Date: 2024-06-06
Vercel Web App URL: https://web322-app-zexing-chengs-projects.vercel.app/
GitHub Repository URL: https://github.com/sc128307/web322-app

********************************************************************************/ 

// Import the required modules
const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

// sets the cloudinary configuration
cloudinary.config({
  cloud_name: 'dwnrmkq1a',
  api_key: '259797427444839 ',
  api_secret: 'fEc_j4EMpZaZ8pogGYhleBzWLEA',
  secure: true
});


// Create the instances of the required modules
const app = express();
const upload = multer(); // no { storage: storage } since we are not using disk storage



// Use the static middleware to serve static files from the "public" directory
app.use(express.static('public'));

// Define the port the server should listen on
const PORT = process.env.PORT || 8080;

// Initialize the store service
  storeService.initialize()
  .then(() => {
    console.log('Data initialization successful');
    // Start the server and listen on the specified port only if initialization is successful
    app.listen(PORT, () => {
      console.log(`Express http server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Data initialization failed: ${err}`);
  });


// Route "/" must redirect the user to the "/about" route
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
      res.status(500).json({ message: err });
    });
});

// Define a route for "/items"
app.get('/items', (req, res) => {
  storeService.getAllItems()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });
});

// Define a route for "/categories"
app.get('/categories', (req, res) => {
  storeService.getCategories()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Define a route for "/items/add"
app.get('/items/add', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
});

// Define a route for "/items/add"
app.post('/items/add', upload.single('featureImage'), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processItem(uploaded.url);
    });
  } else {
    processItem("");
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    storeService.addItem(req.body).then((newItem) => {
      res.redirect('/items');
    }).catch((err) => {
      res.status(500).send(err);
    });
  }
});

// Route to view items
app.get('/items', (req, res) => {
  if (req.query.category) {
    storeService.getItemsByCategory(req.query.category).then((items) => {
      res.json(items);
    }).catch((err) => {
      res.status(500).send(err);
    });
  } else if (req.query.minDate) {
    storeService.getItemsByMinDate(req.query.minDate).then((items) => {
      res.json(items);
    }).catch((err) => {
      res.status(500).send(err);
    });
  } else {
    storeService.getAllItems().then((items) => {
      res.json(items);
    }).catch((err) => {
      res.status(500).send(err);
    });
  }
});

// Route to get item by id
app.get('/item/:id', (req, res) => {
  storeService.getItemById(req.params.id).then((item) => {
    res.json(item);
  }).catch((err) => {
    res.status(500).send(err);
  });
});

