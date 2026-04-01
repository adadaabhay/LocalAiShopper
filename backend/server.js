import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import { scrapeProduct } from './src/services/scraper.js';

const app = express();
app.use(cors());

const port = process.env.PORT || 5000;

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables for all 8 dashboards
db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    avatar TEXT,
    plan TEXT,
    api_key TEXT,
    member_since TEXT
  );

  CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    true_value REAL,
    deception_index INTEGER,
    market_match INTEGER,
    image_url TEXT,
    savings REAL
  );

  CREATE TABLE explore_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    name TEXT,
    trend_score INTEGER
  );

  CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT,
    status TEXT,
    date TEXT,
    total REAL
  );

  CREATE TABLE alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    severity TEXT,
    message TEXT,
    date TEXT
  );

  CREATE TABLE trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT,
    direction TEXT,
    volume TEXT
  );

  CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    content TEXT,
    time TEXT,
    unread INTEGER
  );

  CREATE TABLE activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    target TEXT,
    time TEXT
  );

  CREATE TABLE market_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competitor TEXT,
    price REAL,
    rating REAL,
    shipping_time TEXT,
    link TEXT
  );

  CREATE TABLE price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    price REAL
  );

  -- Insert fake user (Profile)
  INSERT INTO users (name, email, avatar, plan, api_key, member_since)
  VALUES ('John Doe', 'john.doe@example.com', 'JD', 'Pro', 'sk-live-1234abcd5678efgh', 'Jan 2024');

  -- Insert real product (Home/Analyze)
  INSERT INTO products (name, price, true_value, deception_index, market_match, image_url, savings)
  VALUES ('Sony WH-1000XM5 Wireless Noise Canceling Headphones', 398.00, 250.00, 7, 12, 'https://example.com/sony.jpg', 148.00);

  -- Insert Explore data
  INSERT INTO explore_items (category, name, trend_score) VALUES ('Electronics', 'Apple iPad Pro M4', 98);
  INSERT INTO explore_items (category, name, trend_score) VALUES ('Home', 'Dyson V15 Detect', 92);
  INSERT INTO explore_items (category, name, trend_score) VALUES ('Accessories', 'Anker 737 Power Bank', 85);

  -- Insert Orders data
  INSERT INTO orders (order_id, status, date, total) VALUES ('ORD-9912AB', 'Delivered', '2024-10-12', 45.99);
  INSERT INTO orders (order_id, status, date, total) VALUES ('ORD-8821CD', 'In Transit', '2024-10-15', 129.50);

  -- Insert Alerts data
  INSERT INTO alerts (type, severity, message, date) VALUES ('Price Drop', 'Low', 'Sony WH-1000XM5 dropped by $20 on Amazon.', '2h ago');
  INSERT INTO alerts (type, severity, message, date) VALUES ('Fake Urgency', 'High', 'Countdown timer detected on generic smartwatch store.', '5h ago');

  -- Insert Trends data
  INSERT INTO trends (keyword, direction, volume) VALUES ('Noise Cancelling Headphones', 'Up', 'Very High');
  INSERT INTO trends (keyword, direction, volume) VALUES ('Mechanical Keyboards', 'Stable', 'High');
  INSERT INTO trends (keyword, direction, volume) VALUES ('Fidget Spinners', 'Down', 'Low');

  -- Insert Messages data
  INSERT INTO messages (sender, content, time, unread) VALUES ('AI Agent', 'I found 3 cheaper alternatives for your recent search.', '10:30 AM', 1);
  INSERT INTO messages (sender, content, time, unread) VALUES ('Support', 'Your Pro plan has been renewed successfully.', 'Yesterday', 0);

  -- Insert Activity data
  INSERT INTO activities (action, target, time) VALUES ('Analyzed URL', 'amazon.com/dp/B09XS7JWHH', '10 mins ago');
  INSERT INTO activities (action, target, time) VALUES ('Logged In', 'New Device (Windows PC)', '5 hours ago');

  -- Insert Market Analysis data
  INSERT INTO market_analysis (competitor, price, rating, shipping_time, link) VALUES ('Official Store', 399.99, 4.8, '2-4 Days', 'sony.com');
  INSERT INTO market_analysis (competitor, price, rating, shipping_time, link) VALUES ('Verified Reseller', 348.00, 4.9, 'Free Expedited', 'bhphoto.com');
  INSERT INTO market_analysis (competitor, price, rating, shipping_time, link) VALUES ('Discount Electronics', 320.00, 3.1, '7-14 Days', 'discountelectronics.net (Warning)');

  -- Insert Price History data (last 6 months)
  INSERT INTO price_history (date, price) VALUES ('May', 398.00);
  INSERT INTO price_history (date, price) VALUES ('Jun', 348.00);
  INSERT INTO price_history (date, price) VALUES ('Jul', 398.00);
  INSERT INTO price_history (date, price) VALUES ('Aug', 328.00);
  INSERT INTO price_history (date, price) VALUES ('Sep', 398.00);
  INSERT INTO price_history (date, price) VALUES ('Oct', 398.00);
`);

// Endpoints
app.get('/api/product', (req, res) => {
  const product = db.prepare('SELECT * FROM products LIMIT 1').get();
  res.json(product);
});

app.get('/api/user', (req, res) => {
  const user = db.prepare('SELECT * FROM users LIMIT 1').get();
  res.json(user);
});

app.get('/api/explore', (req, res) => {
  const explore = db.prepare('SELECT * FROM explore_items').all();
  res.json(explore);
});

app.get('/api/orders', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders').all();
  res.json(orders);
});

app.get('/api/alerts', (req, res) => {
  const alerts = db.prepare('SELECT * FROM alerts').all();
  res.json(alerts);
});

app.get('/api/trends', (req, res) => {
  const trends = db.prepare('SELECT * FROM trends').all();
  res.json(trends);
});

app.get('/api/messages', (req, res) => {
  const messages = db.prepare('SELECT * FROM messages').all();
  res.json(messages);
});

app.get('/api/activity', (req, res) => {
  const activities = db.prepare('SELECT * FROM activities').all();
  res.json(activities);
});

app.get('/api/market-analysis', (req, res) => {
  const data = db.prepare('SELECT * FROM market_analysis').all();
  res.json(data);
});

app.get('/api/scrape', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    const data = await scrapeProduct(url);
    res.json(data);
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Failed to scrape product', details: error.message });
  }
});

app.get('/api/price-history', (req, res) => {
  const data = db.prepare('SELECT * FROM price_history ORDER BY id ASC').all();
  res.json(data);
});

app.listen(port, () => {
  console.log(`Backend server listening at port ${port}`);
});
