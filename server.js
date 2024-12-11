/*********************************************************************************

WEB322 – Assignment 04
I declare that this assignment is my own work in accordance with Seneca 
Academic Policy. No part of this assignment has been copied manually 
or electronically from any other source (including 3rd party web sites) or 
distributed to other students. I acknowledge that violation of this policy
to any degree results in a ZERO for this assignment and possible failure of
the course.

Name: Soham
Student ID: 136231222
Date: 2024-06-12
Vercel Web App URL: 
GitHub Repository URL:https://github.com/soham-bhavsar/web322-app.git

********************************************************************************/ 

const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const clientSessions = require('client-sessions');
const authData = require('./auth-service');
const storeService = require('./store-service');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: 'dcsytx0qt',
  api_key: '797881923238455',
  api_secret: 'zqdrKWe6gSgQz7XyrF_9a07mhcw',
  secure: true,
});

// Handlebars Setup
app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  helpers: {
    navLink: function (url, options) {
      return `<li class="nav-item${url === options.data.root.activeRoute ? ' active' : ''}">
                <a class="nav-link" href="${url}">${options.fn(this)}</a>
              </li>`;
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3) throw new Error("Handlebars Helper equal needs 2 parameters");
      return lvalue !== rvalue ? options.inverse(this) : options.fn(this);
    },
    safeHTML: function (context) {
      const Handlebars = require('handlebars');
      return new Handlebars.SafeString(context);
    }
  },
}));

app.set('view engine', '.hbs');

// Client Sessions
app.use(clientSessions({
  cookieName: "session",
  secret: "assignment6_secret_key",
  duration: 2 * 60 * 60 * 1000,
  activeDuration: 1000 * 60 * 30,
}));

// Middleware to Add Session to Locals
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Helper Middleware for Authentication
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

// Routes
app.get('/', ensureLogin, (req, res) => {
  res.redirect('/shop');
});

app.get('/categories', ensureLogin, async (req, res) => {
  let viewData = {};
  try {
    const categories = await storeService.getCategories();
    if (categories.length > 0) {
      viewData.categories = categories;
    } else {
      viewData.message = "no results";
    }
  } catch (err) {
    viewData.message = "no results";
  }
  res.render('categories', { data: viewData });
});

app.get('/categories/add', ensureLogin, (req, res) => {
  res.render('addCategory');
});

app.post('/categories/add', ensureLogin, (req, res) => {
  storeService.addCategory(req.body)
    .then(() => res.redirect('/categories'))
    .catch(() => res.status(500).send("Unable to Add Category"));
});

app.get('/categories/delete/:id', ensureLogin, (req, res) => {
  storeService.deleteCategoryById(req.params.id)
    .then(() => res.redirect('/categories'))
    .catch(() => res.status(500).send("Unable to Remove Category / Category not found"));
});

app.get('/items', ensureLogin, async (req, res) => {
  let viewData = {};
  try {
    const items = await storeService.getAllItems();
    if (items.length > 0) {
      viewData.items = items;
    } else {
      viewData.message = "no results";
    }
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    const categories = await storeService.getCategories();
    if (categories.length > 0) {
      viewData.categories = categories;
    } else {
      viewData.categoriesMessage = "no categories available";
    }
  } catch (err) {
    viewData.categoriesMessage = "no categories available";
  }

  res.render('items', { data: viewData });
});

app.get('/items/add', ensureLogin, (req, res) => {
  storeService.getCategories()
    .then((categories) => res.render('addItem', { categories }))
    .catch(() => res.render('addItem', { categories: [] }));
});

app.post('/items/add', ensureLogin, multer().single('featureImage'), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      return result;
    }

    upload(req).then((uploaded) => {
      processItem(uploaded.url);
    }).catch(() => res.status(500).send('Failed to upload image'));
  } else {
    processItem('');
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    storeService.addItem(req.body)
      .then(() => res.redirect('/items'))
      .catch(() => res.status(500).send('Failed to add item'));
  }
});

app.get('/items/delete/:id', ensureLogin, (req, res) => {
  storeService.deletePostById(req.params.id)
    .then(() => res.redirect('/items'))
    .catch(() => res.status(500).send("Unable to Remove Item / Item not found"));
});

app.get('/shop', ensureLogin, async (req, res) => {
  let viewData = {};
  const category = req.query.category;
  const selectedItemId = req.query.id ? parseInt(req.query.id) : null;

  try {
    viewData.posts = category ? await storeService.getPublishedItemsByCategory(category) : await storeService.getPublishedItems();
  } catch (err) {
    viewData.posts = [];
    viewData.message = "No items available.";
  }

  try {
    viewData.categories = await storeService.getCategories();
  } catch (err) {
    viewData.categories = [];
    viewData.categoriesMessage = "No categories available.";
  }

  try {
    viewData.post = selectedItemId ? await storeService.getItemById(selectedItemId) : null;
  } catch (err) {
    viewData.post = null;
    viewData.message = "Item not found.";
  }

  res.render('shop', { data: viewData });
});

app.get('/about', (req, res) => {
  res.render('about');
  });

// Other Routes (Login, Register, Logout, User History, 404)
app.get('/login', (req, res) => res.render('login'));
app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
    .then((user) => {
      req.session.user = { userName: user.userName, email: user.email, loginHistory: user.loginHistory };
      res.redirect('/shop');
    })
    .catch((err) => res.render('login', { errorMessage: err, userName: req.body.userName }));
});

app.get('/register', (req, res) => res.render('register'));
app.post('/register', (req, res) => {
  authData.registerUser(req.body)
    .then(() => res.render('register', { successMessage: "User created" }))
    .catch((err) => res.render('register', { errorMessage: err, userName: req.body.userName }));
});

app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => res.render('userHistory', { user: req.session.user }));

app.use((req, res) => res.status(404).render('404'));

// Initialize Services and Start Server
storeService.initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(PORT, () => console.log(`Express HTTP server listening on port ${PORT}`));
  })
  .catch((err) => console.log("Unable to start server: " + err));
