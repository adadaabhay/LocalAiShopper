import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import { scrapeProduct, searchDuckDuckGo, scrapeJSONLD } from './src/services/scraper.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

// ============================================================
// JINA READER: Convert any URL to clean, LLM-friendly markdown
// ============================================================
async function jinaRead(url) {
  if (!url) return 'URL not provided.';
  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
        'Accept': 'text/markdown',
        'X-Return-Format': 'markdown'
      },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) return `Jina read failed (HTTP ${response.status})`;
    const text = await response.text();
    return text.slice(0, 20000); // Cap at 20k chars to stay within Gemini token limits
  } catch (error) {
    console.error(`Jina Reader Error for ${url}:`, error.message);
    return `Failed to read page: ${error.message}`;
  }
}

// ============================================================
// DUCKDUCKGO FINDER: Find product URLs across multiple stores
// ============================================================
async function findProductURLs(productName) {
  const sources = [
    { name: 'Amazon', query: `site:amazon.in ${productName}` },
    { name: 'Flipkart', query: `site:flipkart.com ${productName}` },
    { name: 'Croma', query: `site:croma.com ${productName}` },
    { name: 'Reliance Digital', query: `site:reliancedigital.in ${productName}` },
    { name: 'Official Brand', query: `official site specifications price ${productName}` },
  ];

  const results = {};
  for (const source of sources) {
    try {
      const url = await searchDuckDuckGo(source.query);
      results[source.name] = url;
      console.log(`[Finder] ${source.name}: ${url || 'Not found'}`);
    } catch (e) {
      results[source.name] = null;
    }
  }
  return results;
}

// ============================================================
// MAIN AGENTIC PIPELINE: Compare Product
// ============================================================
app.post('/api/v1/compare-product', async (req, res) => {
  const { product_name, user_persona } = req.body;
  if (!product_name) return res.status(400).json({ error: 'product_name is required' });

  console.log(`\n🔍 [Agent] Starting analysis for: "${product_name}" | Persona: ${user_persona}`);

  try {
    // ── STEP 1: THE FINDER (DuckDuckGo) ──────────────────────
    console.log('[Step 1] Finding product URLs across 5 stores...');
    const urls = await findProductURLs(product_name);

    // ── STEP 2: THE CLEANER (Jina Reader) ────────────────────
    console.log('[Step 2] Cleaning pages via Jina Reader...');
    const readPromises = Object.entries(urls).map(async ([store, url]) => {
      if (!url) return { store, url: null, content: `${store} URL not found via search.` };
      const content = await jinaRead(url);
      console.log(`  ✓ ${store}: ${content.length} chars extracted`);
      return { store, url, content };
    });
    const scrapedData = await Promise.all(readPromises);

    // Build context for Gemini
    const search_context = scrapedData.map(d =>
      `=== ${d.store} ===\nURL: ${d.url || 'Not Found'}\n${d.content}\n`
    ).join('\n---\n');

    // ── STEP 3: THE BRAIN (Gemini AI) ────────────────────────
    console.log('[Step 3] Sending to Gemini Brain for analysis...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are the "ShopSense Brain" — the world's most advanced price comparison AI.

PRODUCT: "${product_name}"
USER PERSONA: "${user_persona}"

Below is LIVE DATA scraped from real e-commerce stores. Each section contains cleaned markdown from the actual product page:

${search_context}

══════════════════════════════════════════
YOUR CRITICAL MISSION:
══════════════════════════════════════════

1. **IDENTIFY**: Find the exact product_title and inferred_variant (e.g., "128GB Base, Midnight Black").

2. **PRICING**: For BOTH Amazon and Flipkart:
   - Extract the EXACT sticker_price (MRP or listed price, raw integer in ₹).
   - Scan the page data for the ABSOLUTE BEST instant discount or bank offer visible on the page (e.g., "Flat ₹3000 off with HDFC Bank Credit Card," "10% instant discount with SBI").
   - Calculate landed_cost = sticker_price - best_discount_found.
   - In discount_applied, write EXACTLY what you found (e.g., "-₹4000 via HDFC Bank Offer detected on page").
   - If no discount found, write "No offer detected".

3. **FINE PRINT**: Check for anti-consumer warnings:
   - "Replacement Only" instead of refund
   - "No Returns" on the listing
   - Any misleading claims
   - Return null if the listing is clean.

4. **PERSONA SCORE**: Rate 0.0-10.0 how well this product fits the user persona. Write a sharp 2-sentence persona_verdict.

5. **WINNER**: Strictly based on final landed_cost + return policy, declare "Amazon", "Flipkart", or "Tie".

6. **SPECS**: Give an objective spec_rating (0.0-10.0) and a 1-sentence spec_summary covering the key hardware facts.

7. **COMPETITORS**: Suggest exactly 2 real alternative products currently sold in India with estimated_price (integer ₹) and a 1-sentence why_better.

8. **TRUST CHECK**: Cross-reference specs from Official Brand data against Amazon/Flipkart. If sellers are exaggerating specs, log warnings. If specs match, return empty array.

OUTPUT FORMAT: Return ONLY valid JSON (no markdown, no backticks, no explanation):
{
    "product_title": "string",
    "inferred_variant": "string",
    "amazon_data": {
        "sticker_price": integer,
        "landed_cost": integer,
        "discount_applied": "string",
        "fine_print_warning": "string or null"
    },
    "flipkart_data": {
        "sticker_price": integer,
        "landed_cost": integer,
        "discount_applied": "string",
        "fine_print_warning": "string or null"
    },
    "persona_score": float,
    "persona_verdict": "string",
    "winner": "string",
    "spec_rating": float,
    "spec_summary": "string",
    "competitors": [
        { "name": "string", "estimated_price": integer, "why_better": "string" },
        { "name": "string", "estimated_price": integer, "why_better": "string" }
    ],
    "trust_warnings": ["string"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const resultData = JSON.parse(jsonStr);

    console.log(`✅ [Agent] Winner: ${resultData.winner} | Amazon: ₹${resultData.amazon_data.landed_cost} | Flipkart: ₹${resultData.flipkart_data.landed_cost}`);

    // ── STEP 4: AUTOMATION (Update DB) ───────────────────────
    try {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        db.prepare('INSERT INTO activities (action, target, time) VALUES (?, ?, ?)')
          .run('AI Analysis', resultData.product_title || product_name, `Today, ${timestamp}`);

        const landedCost = resultData.winner === 'Flipkart' ? resultData.flipkart_data.landed_cost : resultData.amazon_data.landed_cost;
        const stickerPrice = resultData.winner === 'Flipkart' ? resultData.flipkart_data.sticker_price : resultData.amazon_data.sticker_price;

        db.prepare('INSERT INTO products (name, price, true_value, deception_index, market_match, image_url, savings) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(resultData.product_title, stickerPrice, landedCost, Math.floor(Math.random() * 10), Math.floor(Math.random() * 20), '', stickerPrice - landedCost);

        const existingTrend = db.prepare('SELECT id FROM trends WHERE keyword = ?').get(product_name);
        if (existingTrend) {
            db.prepare('UPDATE trends SET volume = "Very High", direction = "Up" WHERE id = ?').run(existingTrend.id);
        } else {
            db.prepare('INSERT INTO trends (keyword, direction, volume) VALUES (?, "Up", "High")').run(product_name);
        }
    } catch (dbError) {
        console.error('Automation DB Error:', dbError);
    }

    res.json(resultData);

  } catch (error) {
    console.error('Comparison Agent Error:', error);
    res.status(500).json({ error: 'AI Agent analysis failed', details: error.message });
  }
});

app.get('/api/price-history', (req, res) => {
  const data = db.prepare('SELECT * FROM price_history ORDER BY id ASC').all();
  res.json(data);
});

app.listen(port, () => {
  console.log(`Backend server listening at port ${port}`);
});
