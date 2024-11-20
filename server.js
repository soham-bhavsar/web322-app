const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const storeService = require('./store-service.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Handlebars setup
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for active route
app.use((req, res, next) => {
    let route = req.path.substring(1);
    app.locals.activeRoute = '/' + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, '') : route.replace(/\/(.*)/, ''));
    next();
});

// Routes
app.get('/', (req, res) => res.redirect('/shop'));
app.get('/about', (req, res) => res.render('about'));
app.get('/additem', (req, res) => res.render('additem'));

app.get('/items', async (req, res) => {
    try {
        const items = await storeService.getAllItems();
        res.render('items', { items });
    } catch {
        res.render('items', { message: 'No results found.' });
    }
});

app.get('/categories', async (req, res) => {
    try {
        const categories = await storeService.getCategories();
        res.render('categories', { categories });
    } catch {
        res.render('categories', { message: 'No results found.' });
    }
});

app.get('/shop', async (req, res) => {
    try {
        const publishedItems = await storeService.getPublishedItems();
        res.render('shop', { items: publishedItems });
    } catch {
        res.render('shop', { message: 'No items available.' });
    }
});

// Catch-all 404 route
app.use((req, res) => {
    res.status(404).render('404');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});