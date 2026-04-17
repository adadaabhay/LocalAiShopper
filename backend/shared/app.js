import express from 'express';
import path from 'path';
import { analyzeProduct, analyzeProducts } from './analyzeProduct.js';
import { advisePhonePurchase } from './phoneAdvisor.js';
import { discoverVariants } from './variantDiscovery.js';
import { getAllSourceNames, SUPPORTED_CATEGORIES } from './sourceRegistry.js';

/**
 * @param {string} repoRoot Absolute path to repository root (where `dist/` is written).
 */
export function buildApp(repoRoot) {
  const app = express();
  const distDir = path.join(repoRoot, 'dist');

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    const provider = (process.env.AI_PROVIDER || 'ollama').toLowerCase();
    const ollamaInfo = {
      model: process.env.OLLAMA_MODEL || 'qwen2.5',
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    };
    res.json({
      ok: true,
      provider,
      ollama: ollamaInfo,
      supportedCategories: SUPPORTED_CATEGORIES,
      sources: getAllSourceNames(),
    });
  });

  app.get('/api/user', (_req, res) => {
    res.json({
      name: 'LocalAiShopper user',
      email: 'local@localaishopper.local',
      plan: 'Free',
      avatar: 'LA',
      member_since: new Date().getFullYear().toString(),
    });
  });

  // ── Phase 1 — Variant Discovery ──────────────────────────────────────
  app.post('/api/discover', async (req, res) => {
    const body = req.body ?? {};
    const brand = typeof body.brand === 'string' ? body.brand.trim() : '';
    const model = typeof body.model === 'string' ? body.model.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim().toLowerCase() : 'phone';

    if (!brand || !model) {
      return res.status(400).json({ error: 'brand and model are required.' });
    }

    const validCategories = SUPPORTED_CATEGORIES;
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: `category must be one of: ${validCategories.join(', ')}`,
      });
    }

    try {
      const result = await discoverVariants({ brand, model, category });
      return res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Discovery failed.';
      return res.status(500).json({ error: message });
    }
  });

  // ── Phase 2 — Full Product Advice ────────────────────────────────────
  app.post('/api/analyze', async (req, res) => {
    const { productName, persona } = req.body ?? {};
    if (!productName || typeof productName !== 'string') {
      return res.status(400).json({ error: 'productName is required.' });
    }

    try {
      const result = await analyzeProduct({
        productName,
        persona: typeof persona === 'string' ? persona : 'General shopper',
      });
      return res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/analyze/batch', async (req, res) => {
    const { productNames, persona } = req.body ?? {};
    if (!Array.isArray(productNames) || productNames.length === 0) {
      return res.status(400).json({ error: 'productNames must be a non-empty array.' });
    }

    if (productNames.length > 5) {
      return res.status(400).json({ error: 'A maximum of 5 concurrent agents is supported.' });
    }

    const cleanedNames = productNames
      .filter((value) => typeof value === 'string')
      .map((value) => value.trim())
      .filter(Boolean);

    if (cleanedNames.length === 0) {
      return res.status(400).json({ error: 'productNames must contain valid product names.' });
    }


    try {
      const results = await analyzeProducts({
        productNames: cleanedNames,
        persona: typeof persona === 'string' ? persona : 'General shopper',
      });
      return res.json({
        count: results.length,
        results,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ error: message });
    }
  });

  // Backward-compatible phone advice endpoint
  app.post('/api/phone/advice', async (req, res) => {
    const body = req.body ?? {};
    const brand = typeof body.brand === 'string' ? body.brand.trim() : '';
    const model = typeof body.model === 'string' ? body.model.trim() : '';
    const ram = typeof body.ram === 'string' ? body.ram.trim() : '';
    const storage = typeof body.storage === 'string' ? body.storage.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim().toLowerCase() : 'phone';
    const directUrl = typeof body.directUrl === 'string' ? body.directUrl.trim() : '';

    if (!brand || !model) {
      return res.status(400).json({
        error: 'brand and model are required.',
      });
    }

    try {
      const result = await advisePhonePurchase({
        brand,
        model,
        ram: ram || 'Unknown',
        storage: storage || 'Unknown',
        budget: 0,
        manualPrice: 0,
        category,
        directUrl,
      });
      return res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to build product advice.';
      return res.status(500).json({ error: message });
    }
  });

  // Alias: /api/product/advice → same handler as /api/phone/advice
  app.post('/api/product/advice', async (req, res) => {
    // Forward to the phone/advice handler
    req.url = '/api/phone/advice';
    app.handle(req, res);
  });

  app.use(express.static(distDir));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });

  return app;
}
