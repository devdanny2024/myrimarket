const fs = require("fs");
const path = require("path");

const ORDERS_PATH = path.join(__dirname, "..", "data", "orders.json");

function readOrders() {
  try {
    return JSON.parse(fs.readFileSync(ORDERS_PATH, "utf8"));
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  fs.mkdirSync(path.dirname(ORDERS_PATH), { recursive: true });
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2), "utf8");
}

function createOrder(order) {
  const orders = readOrders();
  const next = { ...order, createdAt: new Date().toISOString() };
  orders.push(next);
  writeOrders(orders);
  return next;
}

function updateOrder(id, patch) {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx < 0) return null;
  orders[idx] = { ...orders[idx], ...patch, id };
  writeOrders(orders);
  return orders[idx];
}

function findOrder(id) {
  return readOrders().find((o) => o.id === id) ?? null;
}

module.exports = { readOrders, createOrder, updateOrder, findOrder };
