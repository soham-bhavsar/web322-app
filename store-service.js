const fs = require('fs');
const path = require('path');

// Global arrays to hold the data
let items = [];
let categories = [];

// Function to read JSON file and parse it into an array of objects
const readJSONFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(`unable to read file: ${filePath}`);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};

// Initialize function to read and parse items.json and categories.json
const initialize = () => {
  return new Promise((resolve, reject) => {
    readJSONFile(path.join(__dirname, 'data', 'items.json'))
      .then((itemsData) => {
        items = itemsData;
        return readJSONFile(path.join(__dirname, 'data', 'categories.json'));
      })
      .then((categoriesData) => {
        categories = categoriesData;
        resolve('Initialization successful');
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// Function to get all items
const getAllItems = () => {
  return new Promise((resolve, reject) => {
    if (items.length > 0) {
      resolve(items);
    } else {
      reject('no results returned');
    }
  });
};

// Function to get published items
const getPublishedItems = () => {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter(item => item.published === true);
    if (publishedItems.length > 0) {
      resolve(publishedItems);
    } else {
      reject('no results returned');
    }
  });
};

// Function to get all categories
const getCategories = () => {
  return new Promise((resolve, reject) => {
    if (categories.length > 0) {
      resolve(categories);
    } else {
      reject('no results returned');
    }
  });
};

module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
  getCategories
};
