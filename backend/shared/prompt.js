export function buildPrompt({ productName, persona }) {
  return `
You are LocalAiShopper AI.
Analyze the product "${productName}" for the buyer persona "${persona}".

Return strict JSON with this exact shape:
{
  "productTitle": "string",
  "summary": "string",
  "recommendation": "Buy now|Wait|Compare more",
  "bestFor": ["string"],
  "cautionPoints": ["string"],
  "comparedStores": [
    {
      "store": "string",
      "priceLabel": "string",
      "notes": "string"
    }
  ]
}

Do not wrap the JSON in prose.
Keep comparedStores to 2 or 3 entries.
`.trim();
}
