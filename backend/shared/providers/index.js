/**
 * Showcase provider loader.
 * Supports adding new AI providers by creating:
 *   backend/shared/providers/<providerName>.js
 * exporting `createProvider()`.
 *
 * Example:
 *   AI_PROVIDER=gemini => providers/gemini.js
 */
export async function getAiProvider() {
  const providerName = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  try {
    const mod = await import(`./${providerName}.js`);
    const factory = mod.createProvider;
    if (typeof factory !== 'function') {
      throw new Error(`Provider module for '${providerName}' does not export createProvider().`);
    }
    return factory();
  } catch {
    throw new Error(`Unsupported AI_PROVIDER for this build: ${providerName}`);
  }
}
