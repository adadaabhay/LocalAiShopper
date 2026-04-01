import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';

chromium.use(stealth());

export async function scrapeProduct(url) {
    let browser;
    try {
        browser = await chromium.launch({ headless: false });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 }
        });
        const page = await context.newPage();

        // Setup request interception to abort unnecessary resources
        await page.route('**/*', (route) => {
            const requestType = route.request().resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(requestType)) {
                route.abort();
            } else {
                route.continue();
            }
        });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const html = await page.content();
        const $ = cheerio.load(html);

        let data = {
            title: null,
            price: null,
            rating: null,
            image: null,
            platform: 'Unknown',
            url: url,
            success: false
        };
        const finalUrl = page.url();

        if (finalUrl.includes('amazon.in') || finalUrl.includes('amazon.com') || url.includes('amzn.in') || url.includes('amzn.to')) {
            data.platform = 'Amazon';
            data.title = $('#productTitle').text().trim() || $('#title').text().trim();

            // Try multiple price selectors commonly used on Amazon
            let priceText = $('.a-price-whole').first().text() ||
                $('#corePriceDisplay_desktop_feature_div .a-price-whole').first().text() ||
                $('#priceblock_ourprice').text() ||
                $('#priceblock_dealprice').text() ||
                $('.a-color-price').first().text();

            data.price = priceText ? priceText.replace(/[^\d]/g, '').trim() : null;

            data.rating = $('#acrPopover').attr('title')?.split(' ')[0] || $('.a-icon-star span').first().text().split(' ')[0] || null;
            data.image = $('#landingImage').attr('src') || $('#imgBlkFront').attr('src') || null;

            if (data.title && data.price) data.success = true;
        } else if (finalUrl.includes('flipkart.com') || url.includes('flipkart.com')) {
            data.platform = 'Flipkart';

            // Flipkart is notoriously difficult with dynamic classes. Extract via text content fallbacks.
            data.title = $('h1').text().trim() || $('span:contains("GB")').first().text().trim();

            // Look for any string that looks like a ruppe price ₹XX,XXX
            const priceMatch = html.match(/₹[\d,]+/);
            if (priceMatch) {
                data.price = priceMatch[0].replace(/[^\d]/g, '');
            }

            data.rating = $('div:contains("★")').last().text().replace(/[^\d.]/g, '') || null;
            data.image = $('img').filter((i, el) => $(el).attr('src')?.includes('rukminim')).first().attr('src') || null;

            if (data.title && data.price) data.success = true;
        }

        // Ultimate generic fallback if specific site logic fails
        if (!data.title) {
            data.title = $('title').text().split('|')[0].trim();
        }
        if (!data.price) {
            // Find the first occurrence of a currency symbol followed by numbers
            const genericPriceMatch = html.match(/(?:₹|\$)\s*[\d,]+(?:\.\d{2})?/);
            if (genericPriceMatch) {
                data.price = genericPriceMatch[0].replace(/[^\d]/g, '');
            }
        }

        if (data.title && data.price) data.success = true;

        return data;
    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return { success: false, error: error.message, url };
    } finally {
        if (browser) await browser.close();
    }
}

export async function searchDuckDuckGo(query) {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
    ];
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({ userAgent: userAgents[Math.floor(Math.random() * userAgents.length)] });
        const page = await context.newPage();
        
        // Use the lite version of DDG for better stability on serverless
        await page.goto(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
        
        const href = await page.evaluate(() => {
            const resultLinks = document.querySelectorAll('.result__a');
            return resultLinks.length > 0 ? resultLinks[0].href : null;
        });
        
        return href;
    } catch (error) {
        console.error('DuckDuckGo search error:', error);
        return null;
    } finally {
        if (browser) await browser.close();
    }
}

export async function scrapeJSONLD(url) {
    if (!url) return "URL not provided.";
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        
        let data;
        try {
            data = await page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
                return scripts.map(s => s.innerText).join('\n');
            });
        } catch (e) {
            data = await page.evaluate(() => document.body.innerText.slice(0, 15000));
        }
        return data || "No data found.";
    } catch (error) {
        console.error(`Scrape JSONLD Error for ${url}:`, error);
        return `Scrape Failed: ${error.message}`;
    } finally {
        if (browser) await browser.close();
    }
}
