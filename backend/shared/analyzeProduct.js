import { buildPrompt } from './prompt.js';
import { getAiProvider } from './providers/index.js';

function parseJsonResponse(text) {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first < 0 || last < 0 || last <= first) {
    throw new Error('No JSON object in response.');
  }
  return JSON.parse(cleaned.slice(first, last + 1));
}

function createFallback(productName, persona, provider) {
  return {
    productTitle: productName,
    provider,
    summary: `${productName} was analyzed in ${provider} mode for a ${persona.toLowerCase()} profile.`,
    recommendation: 'Review manually',
    bestFor: ['Users who want a quick first-pass comparison'],
    cautionPoints: ['Model response could not be parsed into structured JSON.'],
    comparedStores: [
      { store: 'Amazon', priceLabel: 'Not fetched', notes: 'Add live scraping later if needed.' },
      { store: 'Flipkart', priceLabel: 'Not fetched', notes: 'Current cleanup focuses on provider structure.' },
    ],
  };
}

export async function analyzeProduct({ productName, persona }) {
  const provider = await getAiProvider();
  const prompt = buildPrompt({ productName, persona });
  const rawText = await provider.generate(prompt);

  try {
    const parsed = parseJsonResponse(rawText);
    return {
      ...parsed,
      provider: provider.name,
    };
  } catch {
    return createFallback(productName, persona, provider.name);
  }
}

export async function analyzeProducts({ productNames, persona }) {
  return Promise.all(
    productNames.map((productName) =>
      analyzeProduct({
        productName,
        persona,
      }),
    ),
  );
}
