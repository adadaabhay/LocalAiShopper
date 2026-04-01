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


// Individual agent keys are initialized in the AGENTS object below

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

// ══════════════════════════════════════════════════════════════
// DISTRIBUTED MICRO-AGENT ARCHITECTURE
// Each Gemini key handles ONE specific job — no rate limits!
// ══════════════════════════════════════════════════════════════

const AGENTS = {
  amazonExtractor:  new GoogleGenerativeAI(process.env.GEMINI_KEY_1),   // Key 1: Amazon price extraction
  flipkartExtractor: new GoogleGenerativeAI(process.env.GEMINI_KEY_2),  // Key 2: Flipkart price extraction
  officialExtractor: new GoogleGenerativeAI(process.env.GEMINI_KEY_3),  // Key 3: Official brand site specs
  retailExtractor:  new GoogleGenerativeAI(process.env.GEMINI_KEY_4),   // Key 4: Croma + Reliance + Vijay Sales
  brain:            new GoogleGenerativeAI(process.env.GEMINI_KEY_5),   // Key 5: Final comparison & verdict
  backup:           new GoogleGenerativeAI(process.env.GEMINI_KEY_6),   // Key 6: Fallback for any failures
};

// ── JINA READER ──────────────────────────────────────────────
async function jinaRead(url) {
  if (!url) return 'URL not provided.';
  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
        'Accept': 'text/markdown',
        'X-Return-Format': 'markdown'
      },
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) return `Jina read failed (HTTP ${response.status})`;
    const text = await response.text();
    return text.slice(0, 15000);
  } catch (error) {
    console.error(`  ✗ Jina Error for ${url}:`, error.message);
    return `Failed to read: ${error.message}`;
  }
}

// ── DUCKDUCKGO FINDER (7 Sources) ────────────────────────────
async function findProductURLs(productName) {
  const sources = [
    { name: 'Amazon', query: `site:amazon.in ${productName}` },
    { name: 'Flipkart', query: `site:flipkart.com ${productName}` },
    { name: 'Croma', query: `site:croma.com ${productName}` },
    { name: 'Reliance Digital', query: `site:reliancedigital.in ${productName}` },
    { name: 'Vijay Sales', query: `site:vijaysales.com ${productName}` },
    { name: 'Official Brand', query: `official site ${productName} specifications price buy` },
  ];

  const results = {};
  // Run all searches in parallel for speed
  const searchResults = await Promise.allSettled(
    sources.map(async (source) => {
      const url = await searchDuckDuckGo(source.query);
      return { name: source.name, url };
    })
  );

  for (const result of searchResults) {
    if (result.status === 'fulfilled') {
      results[result.value.name] = result.value.url;
      console.log(`  [Finder] ${result.value.name}: ${result.value.url || 'Not found'}`);
    }
  }
  return results;
}

// ── MICRO-AGENT: Extract pricing from a single store ─────────
async function extractPricing(agentInstance, storeName, pageContent, url) {
  if (!pageContent || pageContent.includes('not found') || pageContent.includes('Failed')) {
    return { store: storeName, url, price: null, offers: [], raw: `${storeName} data unavailable.` };
  }

  try {
    const model = agentInstance.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(`
You are a price extraction bot. Extract pricing data from this ${storeName} product page.

PAGE CONTENT:
${pageContent}

Return ONLY valid JSON (no markdown):
{
  "store": "${storeName}",
  "product_name": "exact product title found",
  "mrp": integer or null,
  "sale_price": integer or null,
  "bank_offers": ["list of bank/card offers found on the page"],
  "best_offer_value": integer (estimated ₹ savings from best offer) or 0,
  "return_policy": "string describing return/refund policy" or "Not found",
  "seller_name": "string" or "Unknown",
  "in_stock": true or false,
  "key_specs": "1-sentence hardware summary"
}`);

    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return { store: storeName, url, ...JSON.parse(text) };
  } catch (error) {
    console.error(`  ✗ [${storeName} Extractor] Error:`, error.message);
    return { store: storeName, url, price: null, error: error.message };
  }
}

// ══════════════════════════════════════════════════════════════
// MAIN AGENTIC PIPELINE
// ══════════════════════════════════════════════════════════════
app.post('/api/v1/compare-product', async (req, res) => {
  const { product_name, user_persona } = req.body;
  if (!product_name) return res.status(400).json({ error: 'product_name is required' });

  const startTime = Date.now();
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🔍 SHOPSENSE AGENT PIPELINE`);
  console.log(`   Product: "${product_name}" | Persona: ${user_persona}`);
  console.log(`${'═'.repeat(60)}`);

  try {
    // ── STEP 1: THE FINDER (DuckDuckGo — 6 sources) ─────────
    console.log('\n[Step 1] 🌐 Finding product across 6 stores...');
    const urls = await findProductURLs(product_name);

    // ── STEP 2: THE CLEANER (Jina Reader — parallel) ─────────
    console.log('\n[Step 2] 📄 Cleaning pages via Jina Reader...');
    const storeNames = Object.keys(urls);
    const jinaResults = await Promise.allSettled(
      storeNames.map(async (store) => {
        if (!urls[store]) return { store, content: `${store} URL not found.` };
        const content = await jinaRead(urls[store]);
        console.log(`  ✓ ${store}: ${content.length} chars`);
        return { store, content };
      })
    );

    const cleanedPages = {};
    for (const r of jinaResults) {
      if (r.status === 'fulfilled') cleanedPages[r.value.store] = r.value.content;
    }

    // ── STEP 3: MICRO-AGENTS (4 keys extract in parallel) ────
    console.log('\n[Step 3] 🤖 Deploying 4 extraction micro-agents in parallel...');
    const [amazonResult, flipkartResult, officialResult, retailResult] = await Promise.allSettled([
      // Key 1 → Amazon
      extractPricing(AGENTS.amazonExtractor, 'Amazon', cleanedPages['Amazon'], urls['Amazon']),
      // Key 2 → Flipkart
      extractPricing(AGENTS.flipkartExtractor, 'Flipkart', cleanedPages['Flipkart'], urls['Flipkart']),
      // Key 3 → Official Brand
      extractPricing(AGENTS.officialExtractor, 'Official Brand', cleanedPages['Official Brand'], urls['Official Brand']),
      // Key 4 → Croma + Reliance + Vijay Sales (combined)
      extractPricing(AGENTS.retailExtractor, 'Retail Stores',
        [cleanedPages['Croma'], cleanedPages['Reliance Digital'], cleanedPages['Vijay Sales']].filter(Boolean).join('\n---NEXT STORE---\n'),
        [urls['Croma'], urls['Reliance Digital'], urls['Vijay Sales']].filter(Boolean).join(', ')
      ),
    ]);

    const extractedData = {
      amazon: amazonResult.status === 'fulfilled' ? amazonResult.value : { store: 'Amazon', error: 'Extraction failed' },
      flipkart: flipkartResult.status === 'fulfilled' ? flipkartResult.value : { store: 'Flipkart', error: 'Extraction failed' },
      official: officialResult.status === 'fulfilled' ? officialResult.value : { store: 'Official', error: 'Extraction failed' },
      retail: retailResult.status === 'fulfilled' ? retailResult.value : { store: 'Retail', error: 'Extraction failed' },
    };

    console.log('  ✓ All 4 micro-agents completed.');

    // ── STEP 4: THE BRAIN (Key 5 — Final Analysis) ───────────
    console.log('\n[Step 4] 🧠 Sending to Brain for final verdict...');
    const brainModel = AGENTS.brain.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const brainPrompt = `
You are the "ShopSense Brain" — the world's most advanced price comparison AI.

PRODUCT: "${product_name}"
USER PERSONA: "${user_persona}"

Below is STRUCTURED DATA extracted by 4 specialized agents from REAL e-commerce stores:

=== AMAZON DATA ===
${JSON.stringify(extractedData.amazon, null, 2)}

=== FLIPKART DATA ===
${JSON.stringify(extractedData.flipkart, null, 2)}

=== OFFICIAL BRAND SITE DATA ===
${JSON.stringify(extractedData.official, null, 2)}

=== RETAIL STORES (Croma, Reliance Digital, Vijay Sales) ===
${JSON.stringify(extractedData.retail, null, 2)}

══════════════════════════════════════════
YOUR MISSION: Synthesize ALL extracted data into the final comparison.
══════════════════════════════════════════

RULES:
- Use REAL extracted prices. If an agent returned actual pricing, use it exactly.
- For amazon_data and flipkart_data sticker_price: use the MRP or sale_price from extracted data.
- For landed_cost: apply the best bank offer found by the extractors (sticker_price - best_offer_value).
- For discount_applied: cite the specific offer from the extractor's bank_offers list.
- Cross-reference Official Brand specs against Amazon/Flipkart claims for trust_warnings.
- Consider Croma/Reliance/Vijay Sales prices when determining the true market price landscape.

OUTPUT ONLY VALID JSON (no markdown, no backticks):
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

    let resultData;
    try {
      const result = await brainModel.generateContent(brainPrompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      resultData = JSON.parse(text);
    } catch (brainError) {
      // Fallback to backup key (Key 6)
      console.log('  ⚠️ Brain (Key 5) failed. Switching to Backup (Key 6)...');
      const backupModel = AGENTS.backup.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await backupModel.generateContent(brainPrompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      resultData = JSON.parse(text);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`✅ ANALYSIS COMPLETE in ${elapsed}s`);
    console.log(`   Winner: ${resultData.winner}`);
    console.log(`   Amazon: ₹${resultData.amazon_data.landed_cost} | Flipkart: ₹${resultData.flipkart_data.landed_cost}`);
    console.log(`${'═'.repeat(60)}\n`);

    // ── STEP 5: AUTOMATION (Update DB) ───────────────────────
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
    console.error('🚨 Pipeline Error:', error);
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
