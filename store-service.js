const fs = require('fs').promises;  // Use the Promise-based version of fs

let items = [];
let categories = [];

// Initialize the data by reading the items and categories JSON files
async function initialize() {
  try {
    const itemsData = await fs.readFile('./data/items.json', 'utf8');
    items = JSON.parse(itemsData);

    const categoriesData = await fs.readFile('./data/categories.json', 'utf8');
    categories = JSON.parse(categoriesData);

    return Promise.resolve();
  } catch (err) {
    return Promise.reject("Unable to read file");
  }
}

// Get all items
function getAllItems() {
  return new Promise((resolve, reject) => {
    if (items.length === 0) {
      reject("No results returned");
    } else {
      resolve(items);
    }
  });
}

// Get published items
function getPublishedItems() {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter(item => item.published);
    if (publishedItems.length === 0) {
      reject("No results returned");
    } else {
      resolve(publishedItems);
    }
  });
}

// Get all categories
function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
      reject("No results returned");
    } else {
      resolve(categories);
    }
  });
}

module.exports = { initialize, getAllItems, getPublishedItems, getCategories };
