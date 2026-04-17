/**
 * Ollama local AI provider.
 *
 * Talks to the Ollama REST API (default: http://localhost:11434).
 * Model is configured via OLLAMA_MODEL env var (default: qwen2.5).
 *
 * Ollama must be running locally: https://ollama.com
 * Pull the model first:  ollama pull qwen2.5
 */

const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5';
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 60000);
const OLLAMA_TEMPERATURE = Number.parseFloat(process.env.OLLAMA_TEMPERATURE || '0.1');

export async function createOllamaProvider() {
  let activeModel = OLLAMA_MODEL;

  // Quick ping to check Ollama is reachable
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: controller.signal })
      .finally(() => clearTimeout(timeout));
    if (!response.ok) {
      throw new Error(`Ollama health check failed: HTTP ${response.status}`);
    }
    const data = await response.json();
    const models = (data.models || []).map((m) => m.name);
    const available = models.some((m) => m.startsWith(OLLAMA_MODEL.split(':')[0]));
    if (!available && models.length > 0) {
      console.warn(
        `[ollama] Model "${OLLAMA_MODEL}" not found in local Ollama. ` +
        `Using available model instead: ${models[0]}`
      );
      activeModel = models[0];
    } else if (!available) {
      console.warn(
        `[ollama] Model "${OLLAMA_MODEL}" not found in local Ollama. ` +
        `No other models available. Run: ollama pull ${OLLAMA_MODEL}`
      );
    } else {
      console.log(`[ollama] Connected. Using model: ${activeModel}`);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Ollama is not running. Start it with: ollama serve');
    }
    throw new Error(`Cannot reach Ollama at ${OLLAMA_BASE_URL}: ${err.message}`);
  }

  return {
    name: `ollama/${activeModel}`,

    async generate(prompt) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

      try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            model: activeModel,
            prompt,
            stream: false,
            options: {
              temperature: OLLAMA_TEMPERATURE,
              num_predict: 1024,
            },
            // Ask for JSON format when supported
            format: 'json',
          }),
        }).finally(() => clearTimeout(timeout));

        if (!response.ok) {
          const body = await response.text().catch(() => '');
          throw new Error(`Ollama generate failed: HTTP ${response.status} — ${body.slice(0, 200)}`);
        }

        const data = await response.json();
        return data.response ?? '';
      } catch (err) {
        if (err.name === 'AbortError') {
          throw new Error(`Ollama request timed out after ${OLLAMA_TIMEOUT_MS}ms`);
        }
        throw err;
      }
    },
  };
}

// Standardized provider interface
export async function createProvider() {
  return createOllamaProvider();
}
