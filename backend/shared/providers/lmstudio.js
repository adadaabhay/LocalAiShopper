/**
 * LM Studio local AI provider.
 *
 * Uses LM Studio's OpenAI-compatible REST API.
 * Default endpoint: http://127.0.0.1:1234/v1
 */

const LMSTUDIO_BASE_URL = (process.env.LMSTUDIO_BASE_URL || 'http://127.0.0.1:1234/v1').replace(/\/$/, '');
const LMSTUDIO_MODEL = process.env.LMSTUDIO_MODEL || 'local-model';
const LMSTUDIO_API_KEY = process.env.LMSTUDIO_API_KEY || '';
const LMSTUDIO_TIMEOUT_MS = Number(process.env.LMSTUDIO_TIMEOUT_MS || 60000);
const LMSTUDIO_TEMPERATURE = Number.parseFloat(process.env.LMSTUDIO_TEMPERATURE || '0.1');

function toErrorMessage(err) {
  if (err instanceof Error) return err.message;
  return String(err || 'Unknown error');
}

async function listModels() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (LMSTUDIO_API_KEY) {
      headers['Authorization'] = `Bearer ${LMSTUDIO_API_KEY}`;
    }

    const response = await fetch(`${LMSTUDIO_BASE_URL}/models`, {
      signal: controller.signal,
      headers,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      throw new Error(`LM Studio health check failed: HTTP ${response.status}`);
    }

    const data = await response.json();
    const models = Array.isArray(data?.data) ? data.data : [];
    return models.map((m) => String(m.id || '').trim()).filter(Boolean);
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('LM Studio is not reachable. Start its local server in the Developer tab.');
    }
    throw new Error(`Cannot reach LM Studio at ${LMSTUDIO_BASE_URL}: ${toErrorMessage(err)}`);
  }
}

export async function createLmStudioProvider() {
  const models = await listModels();
  const hasRequestedModel = models.some((id) => id === LMSTUDIO_MODEL);
  let activeModel = LMSTUDIO_MODEL;

  if (!hasRequestedModel && models.length > 0) {
    console.warn(`[lmstudio] Model "${LMSTUDIO_MODEL}" not found. Using available model: ${models[0]}`);
    activeModel = models[0];
  } else if (!hasRequestedModel) {
    console.warn(`[lmstudio] Model "${LMSTUDIO_MODEL}" not found and no other models available. Using configured model name anyway.`);
  } else {
    console.log(`[lmstudio] Connected. Using model: ${activeModel}`);
  }

  return {
    name: `lmstudio/${activeModel}`,

    async generate(prompt) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), LMSTUDIO_TIMEOUT_MS);

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (LMSTUDIO_API_KEY) {
          headers['Authorization'] = `Bearer ${LMSTUDIO_API_KEY}`;
        }

        const response = await fetch(`${LMSTUDIO_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            model: activeModel,
            temperature: LMSTUDIO_TEMPERATURE,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          }),
        }).finally(() => clearTimeout(timeout));

        if (!response.ok) {
          const body = await response.text().catch(() => '');
          throw new Error(`LM Studio generate failed: HTTP ${response.status} - ${body.slice(0, 200)}`);
        }

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (typeof text !== 'string' || text.trim().length === 0) {
          throw new Error('LM Studio returned an empty completion.');
        }

        return text;
      } catch (err) {
        if (err?.name === 'AbortError') {
          throw new Error(`LM Studio request timed out after ${LMSTUDIO_TIMEOUT_MS}ms`);
        }
        throw err;
      }
    },
  };
}

export async function createProvider() {
  return createLmStudioProvider();
}
