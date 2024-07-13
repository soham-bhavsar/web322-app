/*********************************************************************************

WEB322 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca 
Academic Policy. No part of this assignment has been copied manually 
or electronically from any other source (including 3rd party web sites) or 
distributed to other students. I acknowledge that violation of this policy
to any degree results in a ZERO for this assignment and possible failure of
the course.

Name: Zexing Cheng
Student ID: 162654214
Date: 2024-07-13
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
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars'); 

// Set the cloudinary configuration
cloudinary.config({
  cloud_name: 'dwnrmkq1a',
  api_key: '259797427444839',
  api_secret: 'fEc_j4EMpZaZ8pogGYhleBzWLEA',
  secure: true
});

// Create the instances of the required modules
const app = express();
const upload = multer(); // no { storage: storage } since we are not using disk storage
// Define the port the server should listen on
const PORT = process.env.PORT || 8080;

// Use the body parser middleware to parse the request body
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

// Define custom handlebars helper
const hbsHelpers = {
  navLink: function(url, options) 
  {
    const className = url === app.locals.activeRoute ? 'nav-link active' : 'nav-link';
    return `<li class="nav-item"><a class="${className}" href="${url}">${options.fn(this)}</a></li>`;
  },
  equal: function(lvalue, rvalue, options) {
    if (arguments.length < 3)
      throw new Error("Handlebars Helper 'equal' needs 2 parameters");
    return lvalue === rvalue ? options.fn(this) : options.inverse(this);
  },
  safeHTML: function(context) {
    return new Handlebars.SafeString(context);
  }
};

// Set up Handlebars middleware
app.engine('.hbs', exphbs.engine({
  extname: '.hbs',  // Set handlebars extension to .hbs
  helpers: hbsHelpers, // Register the helpers
}));
app.set('view engine', '.hbs'); // Set the view engine to use handlebars
app.set('views', path.join(__dirname, 'views')); // Set the views directory

// Use the static middleware to serve static files from the "public" directory
app.use(express.static('public'));

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

// GET ROUTES
// Route "/" must redirect the user to the "/about" route
app.get('/', (req, res) => {
  res.redirect('/shop');
});

// Define a route for "/about"
app.get('/about', (req, res) => {
  res.render('about');
});

// Define a route for "/shop", obtained from shop-route.txt from Github
app.get("/shop", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "item" objects
    let items = [];

    // if there's a "category" query, filter the returned items by category
    if (req.query.category) {
      // Obtain the published "item" by category
      items = await storeService.getPublishedItemsByCategory(req.query.category);
    } else {
      // Obtain the published "items"
      items = await storeService.getPublishedItems();
    }

    // sort the published items by itemDate
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest item from the front of the list (element 0)
    let item = items[0];

    // store the "items" and "item" data in the viewData object (to be passed to the view)
    viewData.items = items;
    viewData.item = item;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await storeService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});


// Define a route for shop/:id
app.get('/shop/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "item" objects
      let items = [];

      // if there's a "category" query, filter the returned items by category
      if(req.query.category){
          // Obtain the published "items" by category
          items = await storeService.getPublishedItemsByCategory(req.query.category);
      }else{
          // Obtain the published "items"
          items = await storeService.getPublishedItems();
      }

      // sort the published items by itemDate
      items.sort((a,b) => new Date(b.itemDate) - new Date(a.itemDate));

      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the item by "id"
      viewData.item = await storeService.getItemById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await storeService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", {data: viewData})
});


// Updated "/items" route to filter items by category or minDate
app.get('/items', (req, res) => {
  if (req.query.category) {
      storeService.getItemsByCategory(req.query.category).then((items) => {
          res.render('items', {items: items});
      }).catch((err) => {
          res.render('items', {message: "No results found for this category"});
      });
  } else if (req.query.minDate) {
      storeService.getItemsByMinDate(req.query.minDate).then((items) => {
          res.render('items', {items: items});
      }).catch((err) => {
          res.render('items', {message: "No results found from this date"});
      });
  } else {
      storeService.getAllItems().then((items) => {
          res.render('items', {items: items});
      }).catch((err) => {
          res.render('items', {message: "No results found"});
      });
  }
});


// Define a route for "/categories"
app.get('/categories', (req, res) => {
  storeService.getCategories()
  .then((categories) => {
      res.render('categories', { categories });
  })
  .catch((err) => {
      res.render('categories', { message: 'Error retrieving categories: ' + err.message });
  });
});


// Define a route for "/items/add"
app.get('/items/add', (req, res) => {
  res.render('addItem');
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

    // error handling for the upload
    async function upload(req) {
      try {
          let result = await streamUpload(req);
          console.log(result);
          return result;
      } catch (err) {
          throw new Error(`Error uploading image: ${err.message}`);
      }
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


// Route to get item by id
app.get('/item/value', (req, res) => {
  storeService.getItemById(req.params.id).then((item) => {
    res.json(item);
  }).catch((err) => {
    res.status(500).send(err);
  });
});


// Handle 404 errors
app.use((req, res) => {
  res.status(404).render('404');
});

