// Optimized Lightweight search service
export async function searchDuckDuckGo(query) {
    try {
        const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            signal: AbortSignal.timeout(10000)
        });
        const html = await response.text();
        const match = html.match(/class="result__a"[^>]*href="([^"]+)"/);
        
        if (match && match[1]) {
            let rawUrl = match[1];
            // DDG wraps URLs in a redirect — extract the actual URL
            if (rawUrl.startsWith('//duckduckgo.com/l/?')) {
                const urlParam = new URL('https:' + rawUrl).searchParams.get('uddg');
                return urlParam || rawUrl;
            }
            return rawUrl;
        }
        return null;
    } catch (error) {
        console.error('  [DDG] Search error:', error.message);
        return null;
    }
}
