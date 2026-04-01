import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import { searchDuckDuckGo } from './src/services/scraper.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, avatar TEXT, plan TEXT, api_key TEXT, member_since TEXT);
  CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, true_value REAL, deception_index INTEGER, market_match INTEGER, image_url TEXT, savings REAL);
  CREATE TABLE explore_items (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT, name TEXT, trend_score INTEGER);
  CREATE TABLE orders (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT, status TEXT, date TEXT, total REAL);
  CREATE TABLE alerts (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, severity TEXT, message TEXT, date TEXT);
  CREATE TABLE trends (id INTEGER PRIMARY KEY AUTOINCREMENT, keyword TEXT, direction TEXT, volume TEXT);
  CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender TEXT, content TEXT, time TEXT, unread INTEGER);
  CREATE TABLE activities (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, target TEXT, time TEXT);
  CREATE TABLE market_analysis (id INTEGER PRIMARY KEY AUTOINCREMENT, competitor TEXT, price REAL, rating REAL, shipping_time TEXT, link TEXT);
  CREATE TABLE price_history (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, price REAL);

  INSERT INTO users (name, email, avatar, plan, api_key, member_since) VALUES ('John Doe', 'john.doe@example.com', 'JD', 'Pro', 'sk-live-1234abcd5678efgh', 'Jan 2024');
  INSERT INTO products (name, price, true_value, deception_index, market_match, image_url, savings) VALUES ('Sony WH-1000XM5', 398.00, 250.00, 7, 12, '', 148.00);
`);

// API Endpoints
app.get('/api/product', (req, res) => res.json(db.prepare('SELECT * FROM products LIMIT 1').get()));
app.get('/api/user', (req, res) => res.json(db.prepare('SELECT * FROM users LIMIT 1').get()));
app.get('/api/explore', (req, res) => res.json(db.prepare('SELECT * FROM explore_items').all()));
app.get('/api/orders', (req, res) => res.json(db.prepare('SELECT * FROM orders').all()));
app.get('/api/alerts', (req, res) => res.json(db.prepare('SELECT * FROM alerts').all()));
app.get('/api/trends', (req, res) => res.json(db.prepare('SELECT * FROM trends').all()));
app.get('/api/messages', (req, res) => res.json(db.prepare('SELECT * FROM messages').all()));
app.get('/api/activity', (req, res) => res.json(db.prepare('SELECT * FROM activities').all()));
app.get('/api/market-analysis', (req, res) => res.json(db.prepare('SELECT * FROM market_analysis').all()));

// ==========================================
// 3-PROVIDER TURBO ARCHITECTURE
// ==========================================

const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function groqChat(prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], temperature: 0.1, max_tokens: 2000 }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function openRouterChat(prompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'google/gemini-2.0-flash-exp:free', messages: [{ role: 'user', content: prompt }], temperature: 0.1 }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
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
    { name: 'Official', q: `official site ${productName} specs price` },
  ];
  const results = {};
  const searches = await Promise.allSettled(sources.map(async s => ({ name: s.name, url: await searchDuckDuckGo(s.q) })));
  for (const r of searches) {
    if (r.status === 'fulfilled') {
      results[r.value.name] = r.value.url;
      console.log(`[Finder] ${r.value.name}: ${r.value.url || 'Not Found'}`);
    }
  }
  return results;
}

async function extractWithGroq(store, content, url) {
  if (!content || content.length < 50) return { store, url, error: 'No data' };
  const prompt = `Extract pricing from this ${store} page. Return ONLY valid JSON:\n${content.slice(0, 10000)}\n\nJSON Format: {"store":"${store}","product_name":"string","mrp":number_or_null,"sale_price":number_or_null,"bank_offers":["str"],"best_offer_value":number,"return_policy":"str","in_stock":true,"key_specs":"str"}`;
  try {
    const text = await groqChat(prompt);
    return { store, url, ...JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim()) };
  } catch (e) {
    try {
      console.log(`[Backup] ${store}: Groq failed, using OpenRouter...`);
      const text = await openRouterChat(prompt);
      return { store, url, ...JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim()) };
    } catch (e2) { return { store, url, error: e2.message }; }
  }
}

app.post('/api/v1/compare-product', async (req, res) => {
  const { product_name, user_persona } = req.body;
  if (!product_name) return res.status(400).json({ error: 'product_name is required' });
  const tStart = Date.now();
  console.log(`\n>>> STARTING TURBO PIPELINE: "${product_name}"`);

  try {
    console.log('[1] Finding URLs...');
    const urls = await findURLs(product_name);

    console.log('[2] Cleaning pages with Jina...');
    const storesFound = Object.keys(urls).filter(s => urls[s]);
    const pagesList = await Promise.allSettled(storesFound.map(async s => ({ store: s, content: await jinaRead(urls[s]) })));
    const pages = {};
    for (const r of pagesList) if (r.status === 'fulfilled' && r.value.content) pages[r.value.store] = r.value.content;

    console.log('[3] Running Extractors...');
    const [a, f, o, rt] = await Promise.allSettled([
      extractWithGroq('Amazon', pages['Amazon'], urls['Amazon']),
      extractWithGroq('Flipkart', pages['Flipkart'], urls['Flipkart']),
      extractWithGroq('Official', pages['Official'], urls['Official']),
      extractWithGroq('Retail', [pages['Croma'], pages['Reliance Digital']].filter(Boolean).join('\n---\n'), 'Multiple'),
    ]);
    const ext = { amazon: a.value || {}, flipkart: f.value || {}, official: o.value || {}, retail: rt.value || {} };

    console.log('[4] Synthesizing with Gemini...');
    const brainPrompt = `Product: "${product_name}", Persona: "${user_persona}"\nCompare: ${JSON.stringify(ext)}\nReturn JSON: {"product_title":"str","inferred_variant":"str","amazon_data":{"sticker_price":int,"landed_cost":int,"discount_applied":"str","fine_print_warning":"str"},"flipkart_data":{"sticker_price":int,"landed_cost":int,"discount_applied":"str","fine_print_warning":"str"},"persona_score":float,"persona_verdict":"str","winner":"str","spec_rating":float,"spec_summary":"str","competitors":[{"name":"str","estimated_price":int,"why_better":"str"}],"trust_warnings":["str"]}`;
    
    let result;
    try {
      const model = geminiAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const r = await model.generateContent(brainPrompt);
      result = JSON.parse(r.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (e) {
      console.log('[Backup] Gemini failed, using OpenRouter...');
      const text = await openRouterChat(brainPrompt);
      result = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    }

    if (!result || !result.amazon_data) throw new Error('Failed to generate valid comparison');

    // DB Automation
    try {
      const ts = new Date().toLocaleTimeString();
      db.prepare('INSERT INTO activities (action, target, time) VALUES (?, ?, ?)').run('AI Analysis', result.product_title || product_name, ts);
      const winnerData = result.winner === 'Flipkart' ? result.flipkart_data : result.amazon_data;
      db.prepare('INSERT INTO products (name, price, true_value, deception_index, market_match, image_url, savings) VALUES (?, ?, ?, ?, ?, ?, ?)').run(result.product_title, winnerData.sticker_price, winnerData.landed_cost, 5, 10, '', winnerData.sticker_price - winnerData.landed_cost);
    } catch (dbE) { console.error('DB Error:', dbE.message); }

    const elapsed = ((Date.now() - tStart) / 1000).toFixed(1);
    console.log(`>>> DONE in ${elapsed}s | Winner: ${result.winner}`);
    res.json(result);
  } catch (error) {
    console.error('Pipeline Error:', error.message);
    res.status(500).json({ error: 'Pipeline failed', details: error.message });
  }
});

app.get('/api/price-history', (req, res) => res.json(db.prepare('SELECT * FROM price_history ORDER BY id ASC').all()));

app.listen(port, () => console.log(`Backend server listening at port ${port}`));
