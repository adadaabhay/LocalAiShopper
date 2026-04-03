import { GoogleGenerativeAI } from '@google/generative-ai';

function parseApiKeys() {
  const pooledKeys = (process.env.GEMINI_API_KEYS || '')
    .split(/[,\n]/)
    .map((key) => key.trim())
    .filter(Boolean);

  if (pooledKeys.length > 0) {
    return pooledKeys;
  }

  const singleKey = process.env.GEMINI_API_KEY?.trim();
  return singleKey ? [singleKey] : [];
}

function createScheduler(entries, maxConcurrentAgents, maxPerKey) {
  const queue = [];
  let activeTotal = 0;

  function chooseEntry() {
    return entries
      .filter((entry) => entry.active < maxPerKey)
      .sort((left, right) => left.active - right.active)[0];
  }

  function drainQueue() {
    while (queue.length > 0 && activeTotal < maxConcurrentAgents) {
      const entry = chooseEntry();
      if (!entry) {
        return;
      }

      const nextJob = queue.shift();
      activeTotal += 1;
      entry.active += 1;

      nextJob.resolve({
        entry,
        release() {
          activeTotal -= 1;
          entry.active -= 1;
          drainQueue();
        },
      });
    }
  }

  return {
    acquire() {
      return new Promise((resolve) => {
        queue.push({ resolve });
        drainQueue();
      });
    },
  };
}

function createGeminiPool() {
  const apiKeys = parseApiKeys();
  if (apiKeys.length === 0) {
    throw new Error('GEMINI_API_KEY or GEMINI_API_KEYS is missing.');
  }

  const maxConcurrentAgents = Math.max(
    1,
    Number(process.env.GEMINI_MAX_AGENTS || 5),
  );
  const maxPerKey = Math.max(
    1,
    Number(
      process.env.GEMINI_MAX_PER_KEY ||
        Math.ceil(maxConcurrentAgents / apiKeys.length),
    ),
  );
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  const entries = apiKeys.map((apiKey, index) => {
    const client = new GoogleGenerativeAI(apiKey);
    return {
      id: index + 1,
      active: 0,
      model: client.getGenerativeModel({ model: modelName }),
    };
  });

  const scheduler = createScheduler(entries, maxConcurrentAgents, maxPerKey);

  return {
    keyCount: entries.length,
    maxConcurrentAgents,
    async generate(prompt, { maxOutputTokens, temperature } = {}) {
      const lease = await scheduler.acquire();
      try {
        const generationConfig = {
          maxOutputTokens: Number.isFinite(maxOutputTokens) ? maxOutputTokens : undefined,
          temperature: Number.isFinite(temperature) ? temperature : undefined,
        };
        // Only include generation config fields that are defined
        const cleanedConfig = Object.fromEntries(
          Object.entries(generationConfig).filter(([, v]) => v !== undefined),
        );

        const response = await lease.entry.model.generateContent(
          { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: cleanedConfig },
        );
        return response.response.text();
      } finally {
        lease.release();
      }
    },
  };
}

let sharedGeminiPool;

function getGeminiPool() {
  if (!sharedGeminiPool) {
    sharedGeminiPool = createGeminiPool();
  }
  return sharedGeminiPool;
}

export function getGeminiPoolStats() {
  const pool = getGeminiPool();
  return {
    keyCount: pool.keyCount,
    maxConcurrentAgents: pool.maxConcurrentAgents,
  };
}

export function createGeminiProvider() {
  const pool = getGeminiPool();
  const maxOutputTokens = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 520);
  const temperature = Number.parseFloat(process.env.GEMINI_TEMPERATURE || '0.2');

  return {
    name: 'gemini',
    async generate(prompt) {
      return pool.generate(prompt, { maxOutputTokens, temperature });
    },
  };
}

// Standardized provider interface for dynamic loader in `providers/index.js`.
export function createProvider() {
  return createGeminiProvider();
}
