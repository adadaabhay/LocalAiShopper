import { createProvider as createGeminiProvider } from './gemini.js';

export async function getAiProvider() {
  return createGeminiProvider();
}
