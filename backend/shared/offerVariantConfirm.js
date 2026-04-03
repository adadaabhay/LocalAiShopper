const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function normalizeGb(value) {
  if (!value || typeof value !== 'string') return '';
  return value.replace(/\s+/g, '').toUpperCase();
}

function extractVariantFromText(text, category) {
  const cleaned = text.replace(/\s+/g, ' ');

  // RAM: 8GB RAM / 12 GB RAM / 16GB ram / 32GB DDR5 / 16GB LPDDR5
  const ramMatch =
    cleaned.match(/(\d{1,2}(?:\.\d+)?)\s*GB\s*(?:RAM|DDR\d?|LPDDR\d?)/i) ||
    cleaned.match(/RAM\s*(\d{1,2}(?:\.\d+)?)/i);

  // Storage: 256GB storage / 128GB ROM / 512 GB / 1TB / 512GB SSD / 1TB NVMe
  const tbMatch = cleaned.match(/(\d(?:\.\d+)?)\s*TB(?:\s*(?:SSD|NVMe|HDD|storage))?/i);
  const gbMatch =
    cleaned.match(/(\d{2,4})\s*(?:GB|G)\b(?!\s*(?:RAM|DDR|LPDDR))/i) ||
    cleaned.match(/(\d{2,4})\s*GB\s*(?:ROM|STORAGE|SSD|NVMe)/i);

  const ram = ramMatch ? `${ramMatch[1].split('.')[0]}GB` : null;
  let storage = null;
  if (tbMatch) {
    storage = `${tbMatch[1].split('.')[0]}TB`;
  } else if (gbMatch) {
    storage = `${gbMatch[1]}GB`;
  }

  // Processor (laptop-specific)
  let processor = null;
  if (category === 'laptop') {
    const procMatch = cleaned.match(
      /(?:Intel\s+Core\s+)?i[3579][-\s]?\d{4,5}\w*|Ryzen\s+[3579]\s+\d{4}\w*|M[1-4]\s*(?:Pro|Max|Ultra)?|Snapdragon\s+\w+/i,
    );
    processor = procMatch ? procMatch[0].trim() : null;
  }

  return { ram, storage, processor };
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      signal: controller.signal,
    });
    if (!res.ok) return '';
    return await res.text();
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

function variantMode({ desiredRam, desiredStorage, offerRam, offerStorage }) {
  const ramOk = desiredRam && offerRam && offerRam !== 'UNKNOWN' ? normalizeGb(offerRam) === normalizeGb(desiredRam) : false;
  const storageOk =
    desiredStorage && offerStorage && offerStorage !== 'UNKNOWN'
      ? normalizeGb(offerStorage) === normalizeGb(desiredStorage)
      : false;

  if (ramOk && storageOk) return 'strict';
  if (ramOk || storageOk) return 'partial';
  return 'unknown';
}

/**
 * Confirm variant details by visiting PDP pages of top offers.
 * @param {{ offers: Array, desiredRam: string, desiredStorage: string, category?: string }} params
 */
export async function confirmOfferVariants({ offers, desiredRam, desiredStorage, category = 'phone' }) {
  // Best-effort variant confirmation. Many PDP pages may block bots or load details via JS.
  const top = offers.slice(0, 4);

  const confirmed = await Promise.all(
    top.map(async (offer) => {
      if (!offer.url || typeof offer.url !== 'string') {
        return { ...offer, variantConfirmed: false, variantMode: 'unknown' };
      }

      const html = await fetchWithTimeout(offer.url, 6500);
      if (!html || html.length < 200) {
        return { ...offer, variantConfirmed: false, variantMode: 'unknown' };
      }

      const { ram, storage, processor } = extractVariantFromText(html, category);
      const mode = variantMode({
        desiredRam,
        desiredStorage,
        offerRam: ram ?? offer.ram,
        offerStorage: storage ?? offer.storage,
      });

      return {
        ...offer,
        variantConfirmed: true,
        confirmedRam: ram ?? offer.ram,
        confirmedStorage: storage ?? offer.storage,
        confirmedProcessor: processor ?? offer.processor ?? null,
        variantMode: mode,
      };
    }),
  );

  const rest = offers.slice(4);
  return [...confirmed, ...rest];
}
