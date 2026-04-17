/**
 * AI Provider index - selects provider based on AI_PROVIDER env var.
 *
 * Supported values:
 *   ollama    - local Ollama server
 *   lmstudio  - local LM Studio server (OpenAI-compatible API)
 */

export async function getAiProvider() {
  const provider = (process.env.AI_PROVIDER || 'ollama').toLowerCase().trim();

  if (provider === 'lmstudio') {
    const { createProvider } = await import('./lmstudio.js');
    return createProvider();
  }

  if (provider === 'ollama') {
    const { createProvider } = await import('./ollama.js');
    return createProvider();
  }

  throw new Error(`Unknown AI_PROVIDER: "${provider}". Use "lmstudio" or "ollama".`);
}
