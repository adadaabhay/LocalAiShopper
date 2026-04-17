import { chromium } from 'playwright';

let browserPromise = null;

export async function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
    }).catch(err => {
      console.warn("Failed to launch Playwright browser:", err);
      browserPromise = null;
      return null;
    });
  }
  return browserPromise;
}

export async function fetchWithBrowser(url, timeoutMs = 15000) {
  const browser = await getBrowser();
  if (!browser) return null;
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Block heavy assets to speed up load
    await page.route('**/*', (route) => {
      const type = route.request().resourceType();
      if (['image', 'media', 'font'].includes(type)) {
        route.abort().catch(() => {});
      } else {
        route.continue().catch(() => {});
      }
    });

    // Use networkidle to wait for all XHR/fetch calls to complete (SPAs need this)
    await page.goto(url, { waitUntil: 'networkidle', timeout: timeoutMs }).catch(async () => {
      // Fallback: if networkidle times out, try domcontentloaded
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {});
    });
    
    // Extra settle time for late-rendering React/Vue/Angular components
    await page.waitForTimeout(3000);
    
    // Try scrolling down to trigger lazy-loaded content
    await page.evaluate(() => window.scrollTo(0, 800)).catch(() => {});
    await page.waitForTimeout(1500);
    
    const html = await page.content();
    return html;
  } catch (err) {
    console.warn(`Browser fetch failed for ${url}:`, err.message);
    return null;
  } finally {
    await context.close();
  }
}
