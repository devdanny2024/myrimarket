const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const CATEGORIES_PATH = path.join(DATA_DIR, "categories.json");
const PRODUCTS_PATH = path.join(DATA_DIR, "products.json");

function readJson(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function getCategories() {
  return readJson(CATEGORIES_PATH, []);
}

function getProducts() {
  return readJson(PRODUCTS_PATH, []);
}

function saveProducts(products) {
  writeJson(PRODUCTS_PATH, products);
}

function saveCategories(categories) {
  writeJson(CATEGORIES_PATH, categories);
}

module.exports = {
  getCategories,
  getProducts,
  saveProducts,
  saveCategories,
};
