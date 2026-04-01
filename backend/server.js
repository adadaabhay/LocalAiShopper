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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 3-PROVIDER TURBO ARCHITECTURE
// Groq  = Ultra-fast extraction (4 parallel agents)
// Gemini = Final Brain synthesis
// OpenRouter = Backup for any failures
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function groqChat(prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], temperature: 0.1, max_tokens: 2000 }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).choices[0].message.content;
}

async function openRouterChat(prompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'google/gemini-2.0-flash-exp:free', messages: [{ role: 'user', content: prompt }], temperature: 0.1 }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).choices[0].message.content;
}

async function jinaRead(url) {
  if (!url) return '';
  try {
    const r = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Authorization': `Bearer ${process.env.JINA_API_KEY}`, 'Accept': 'text/markdown', 'X-Return-Format': 'markdown' },
      signal: AbortSignal.timeout(20000)
    });
    if (!r.ok) return '';
    return (await r.text()).slice(0, 12000);
  } catch (e) { return ''; }
}

async function findURLs(productName) {
  const sources = [
    { name: 'Amazon', q: `site:amazon.in ${productName}` },
    { name: 'Flipkart', q: `site:flipkart.com ${productName}` },
    { name: 'Croma', q: `site:croma.com ${productName}` },
    { name: 'Reliance Digital', q: `site:reliancedigital.in ${productName}` },
    { name: 'Vijay Sales', q: `site:vijaysales.com ${productName}` },
    { name: 'Official', q: `official site ${productName} specs price` },
  ];
  const results = {};
  const all = await Promise.allSettled(sources.map(async s => ({ name: s.name, url: await searchDuckDuckGo(s.q) })));
  for (const r of all) {
    if (r.status === 'fulfilled') {
      results[r.value.name] = r.value.url;
      console.log(`  ${r.value.url ? 'âœ“' : 'âœ—'} ${r.value.name}: ${r.value.url || 'Not found'}`);
    }
  }
  return results;
}

async function extractWithGroq(store, content, url) {
  if (!content || content.length < 50) return { store, url, error: 'No data' };
  const prompt = `Extract pricing from this ${store} page. Return ONLY valid JSON:\n${content.slice(0, 10000)}\n\nJSON: {"store":"${store}","product_name":"string","mrp":int_or_null,"sale_price":int_or_null,"bank_offers":["offer1"],"best_offer_value":int_or_0,"return_policy":"string","in_stock":true,"key_specs":"1-sentence"}`;
  try {
    const text = await groqChat(prompt);
    const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    console.log(`  âš¡ ${store}: â‚¹${parsed.sale_price || parsed.mrp || '?'}`);
    return { store, url, ...parsed };
  } catch (e) {
    try {
      console.log(`  ðŸ”„ ${store}: Groq failed, trying OpenRouter...`);
      const text = await openRouterChat(prompt);
      return { store, url, ...JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim()) };
    } catch (e2) {
      return { store, url, error: e2.message };
    }
  }
}

app.post('/api/v1/compare-product', async (req, res) => {
  const { product_name, user_persona } = req.body;
  if (!product_name) return res.status(400).json({ error: 'product_name is required' });
  const t0 = Date.now();
  console.log(`\n${'â•'.repeat(50)}\nðŸ” TURBO PIPELINE: "${product_name}"\n${'â•'.repeat(50)}`);

  try {
    console.log('\n[1] ðŸŒ Finding URLs...');
    const urls = await findURLs(product_name);

    console.log('\n[2] ðŸ“„ Jina Reader (parallel)...');
    const stores = Object.keys(urls).filter(s => urls[s]);
    const jinaAll = await Promise.allSettled(stores.map(async s => ({ store: s, content: await jinaRead(urls[s]) })));
    const pages = {};
    for (const r of jinaAll) if (r.status === 'fulfilled' && r.value.content) { pages[r.value.store] = r.value.content; console.log(`  âœ“ ${r.value.store}: ${r.value.content.length} chars`); }

    console.log('\n[3] âš¡ Groq extractors (parallel)...');
    const retail = [pages['Croma'], pages['Reliance Digital'], pages['Vijay Sales']].filter(Boolean).join('\n---\n');
    const [a, f, o, rt] = await Promise.allSettled([
      extractWithGroq('Amazon', pages['Amazon'], urls['Amazon']),
      extractWithGroq('Flipkart', pages['Flipkart'], urls['Flipkart']),
      extractWithGroq('Official', pages['Official'], urls['Official']),
      extractWithGroq('Retail', retail, 'Multiple stores'),
    ]);
    const ext = { amazon: a.value || {}, flipkart: f.value || {}, official: o.value || {}, retail: rt.value || {} };
    console.log(`  âœ“ Extractors done in ${((Date.now()-t0)/1000).toFixed(1)}s`);

    console.log('\n[4] ðŸ§  Gemini Brain...');
    const brainPrompt = `Synthesize this e-commerce data. Product: "${product_name}", Persona: "${user_persona}"\n\nAMAZON: ${JSON.stringify(ext.amazon)}\nFLIPKART: ${JSON.stringify(ext.flipkart)}\nOFFICIAL: ${JSON.stringify(ext.official)}\nRETAIL: ${JSON.stringify(ext.retail)}\n\nRules: Use real prices. sticker_price=MRP/sale_price. landed_cost=sticker_price-best_offer_value. Cite bank offers. Cross-check specs.\n\nReturn ONLY JSON: {"product_title":"str","inferred_variant":"str","amazon_data":{"sticker_price":int,"landed_cost":int,"discount_applied":"str","fine_print_warning":"str or null"},"flipkart_data":{"sticker_price":int,"landed_cost":int,"discount_applied":"str","fine_print_warning":"str or null"},"persona_score":float,"persona_verdict":"str","winner":"str","spec_rating":float,"spec_summary":"str","competitors":[{"name":"str","estimated_price":int,"why_better":"str"},{"name":"str","estimated_price":int,"why_better":"str"}],"trust_warnings":["str"]}`;

    let result;
    try {
      const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const r = await model.generateContent(brainPrompt);
      result = JSON.parse(r.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (e) {
      console.log('  âš ï¸ Gemini failed, using OpenRouter...');
      const text = await openRouterChat(brainPrompt);
      result = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    }

    const elapsed = ((Date.now()-t0)/1000).toFixed(1);
    console.log(`\n${'â•'.repeat(50)}\nâœ… DONE in ${elapsed}s | Winner: ${result.winner}\n   Amazon â‚¹${result.amazon_data.landed_cost} | Flipkart â‚¹${result.flipkart_data.landed_cost}\n${'â•'.repeat(50)}\n`);

    try {
      const ts = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      db.prepare('INSERT INTO activities (action, target, time) VALUES (?, ?, ?)').run('AI Analysis', result.product_title || product_name, `Today, ${ts}`);
      const lc = result.winner === 'Flipkart' ? result.flipkart_data.landed_cost : result.amazon_data.landed_cost;
      const sp = result.winner === 'Flipkart' ? result.flipkart_data.sticker_price : result.amazon_data.sticker_price;
      db.prepare('INSERT INTO products (name, price, true_value, deception_index, market_match, image_url, savings) VALUES (?, ?, ?, ?, ?, ?, ?)').run(result.product_title, sp, lc, Math.floor(Math.random()*10), Math.floor(Math.random()*20), '', sp-lc);
      const t = db.prepare('SELECT id FROM trends WHERE keyword = ?').get(product_name);
      if (t) db.prepare('UPDATE trends SET volume = "Very High", direction = "Up" WHERE id = ?').run(t.id);
      else db.prepare('INSERT INTO trends (keyword, direction, volume) VALUES (?, "Up", "High")').run(product_name);
    } catch (e) { console.error('DB:', e); }

    res.json(result);
  } catch (error) {
    console.error('ðŸš¨ Error:', error);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
});

app.get('/api/price-history', (req, res) => {
  res.json(db.prepare('SELECT * FROM price_history ORDER BY id ASC').all());
});


app.listen(port, () => console.log(`Backend server listening at port ${port}`));
