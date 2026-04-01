import os
import sys
import json
import asyncio
import random

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from duckduckgo_search import DDGS
from playwright.async_api import async_playwright

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

app = FastAPI(title="ShopSense AI - Playwright Agentic Pipeline")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PYDANTIC MODELS ---
class CompareRequest(BaseModel):
    product_name: str
    user_persona: str

class PlatformData(BaseModel):
    sticker_price: int
    landed_cost: int
    discount_applied: str
    fine_print_warning: Optional[str] = None

class Competitor(BaseModel):
    name: str
    estimated_price: int
    why_better: str

class CompareResponse(BaseModel):
    product_title: str
    inferred_variant: str
    amazon_data: PlatformData
    flipkart_data: PlatformData
    persona_score: float
    persona_verdict: str
    winner: str
    spec_rating: float
    spec_summary: str
    competitors: list[Competitor]
    trust_warnings: list[str]

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
]

async def scrape_json_ld(url: str):
    """Scout Strategy: Use Playwright to dig out the exact SEO JSON-LD from the DOM."""
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(user_agent=random.choice(USER_AGENTS))
            page = await context.new_page()
            
            await page.goto(url, wait_until="domcontentloaded", timeout=15000)
            
            try:
                script_content = await page.locator('script[type="application/ld+json"]').first.inner_text(timeout=5000)
                data = script_content
            except Exception:
                # If ld+json isn't found cleanly, dump the entire text of the body to Gemini instead
                data = await page.locator("body").inner_text(timeout=5000)
                data = data[:15000] # Cap text size
                
            await browser.close()
            return data
    except Exception as e:
        return f"Scrape Failed: {str(e)}"

# --- AGENTIC ENDPOINT ---
@app.post("/api/v1/compare-product", response_model=CompareResponse)
async def compare_product(req: CompareRequest):
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured.")
        
    try:
        # STEP 1: The Compass (DDGS purely finds the URL)
        amazon_snippets = []
        flipkart_snippets = []
        brand_snippets = []
        
        try:
            with DDGS() as ddgs:
                amz_search = list(ddgs.text(f"site:amazon.in {req.product_name}", max_results=1))
                flp_search = list(ddgs.text(f"site:flipkart.com {req.product_name}", max_results=1))
                off_search = list(ddgs.text(f"official site specifications parameters {req.product_name}", max_results=1))
                
                amz_url = amz_search[0]['href'] if amz_search else None
                flp_url = flp_search[0]['href'] if flp_search else None
                off_url = off_search[0]['href'] if off_search else None
                
                # STEP 2: The Scout (Playwright fetches the exact page DOM/JSON-LD)
                amz_data = await scrape_json_ld(amz_url) if amz_url else "Amazon URL not found."
                flp_data = await scrape_json_ld(flp_url) if flp_url else "Flipkart URL not found."
                off_data = await scrape_json_ld(off_url) if off_url else "Official Brand URL not found."
                
                amazon_snippets.append({"url": amz_url, "extracted_dom": amz_data})
                flipkart_snippets.append({"url": flp_url, "extracted_dom": flp_data})
                brand_snippets.append({"url": off_url, "extracted_dom": off_data})
                
        except Exception as ddgs_error:
            print(f"Agent Compass Error: {ddgs_error}. Utilizing Gemini Internal Memory Fallback.")
            amazon_snippets = [{"extracted_dom": f"LIVE WEB SCRAPE RATELIMITED. As an AI expert, use your deep internal knowledge to accurately estimate the real-world current Indian pricing (in ₹) for '{req.product_name}' on Amazon.in. Factor in a realistic standard bank discount (e.g., HDFC/SBI) and define the hardware specs."}]
            flipkart_snippets = [{"extracted_dom": f"LIVE WEB SCRAPE RATELIMITED. Estimate realistic accurate Flipkart pricing for '{req.product_name}'. Factor in typical e-commerce discounts and 7-day return policies."}]
            brand_snippets = [{"extracted_dom": f"LIVE WEB SCRAPE RATELIMITED. Use your native mathematical weights to define exactly what the 100% true Official hardware specifications are for '{req.product_name}' so we can cross-validate Amazon/Flipkart claims against your Ground Truth."}]
            
        search_context = json.dumps({
            "amazon_scraped_data": amazon_snippets,
            "flipkart_scraped_data": flipkart_snippets,
            "official_brand_data": brand_snippets
        })

        # STEP 3: The Brain (Gemini Intelligence)
        prompt = f"""
        You are the highly advanced 'ShopSense Brain' AI.
        Product requested: "{req.product_name}"
        User Persona: "{req.user_persona}"
        
        Live scraped data for Amazon, Flipkart, and the OFFICIAL Brand Site:
        {search_context}
        
        TASKS:
        1. Identify the `product_title` and deduce the `inferred_variant` (e.g., "Assumed exactly 128GB Base Model") if the user didn't specify one, based on typical pricing.
        2. Identify the `sticker_price` for both platforms. Omit currency shells (raw integer).
        3. Scan snippets for the ABSOLUTE BEST bank offer or instantaneous discount practically listed on the platform snippets. Automatically apply it to calculate `landed_cost` (Sticker Price - Best Native Discount Found + Courier Fees). In `discount_applied`, explicitly state what you found (e.g., "-₹4000 via Natively Auto-Detected HDFC Offer"). If none found, write "None Found".
        4. Identify anti-consumer Fine Print (e.g., 'Replacement Only'). Return null if clean.
        5. Generate a `persona_score` (0.0 to 10.0 scale) and a 2-sentence `persona_verdict`.
        6. Determine the `winner` ("Amazon", "Flipkart", or "Tie") strictly based on the final Landed Cost and returns.
        7. Evaluate the product's hardware logic to give an absolute objective `spec_rating` (0.0-10.0) and a sharp 1-sentence `spec_summary` (e.g., 'A16 Bionic chip, 48MP camera, trailing 60Hz display...').
        8. Generate 2 distinct powerful `competitors` (Alternative phones/products) currently available in the market that the user should explicitly consider instead, with estimated integer prices and 1 sharp sentence on `why_better`.
        9. CROSS-REFERENCE SPECS: Read the `official_brand_data` specs and critically compare them against every hardware claim found in `amazon_scraped_data` and `flipkart_scraped_data`. Are the Amazon/Flipkart third-party sellers lying or exaggerating? (e.g. claiming 144Hz screen when official is 120Hz). If you detect discrepancies, log explicit string warnings into the `trust_warnings` list (e.g. "Amazon seller exaggerates RAM size."). If everything perfectly matches Official Data, return an empty list [].
        
        Output perfectly valid JSON matching the exact schema provided. Do not use blockquotes like ```json.
        {{
            "product_title": "string",
            "inferred_variant": "string",
            "amazon_data": {{
                "sticker_price": integer,
                "landed_cost": integer,
                "discount_applied": "string",
                "fine_print_warning": "string or null"
            }},
            "flipkart_data": {{
                "sticker_price": integer,
                "landed_cost": integer,
                "discount_applied": "string",
                "fine_print_warning": "string or null"
            }},
            "persona_score": float,
            "persona_verdict": "string",
            "winner": "string",
            "spec_rating": float,
            "spec_summary": "string",
            "competitors": [
                {{
                    "name": "string",
                    "estimated_price": integer,
                    "why_better": "string"
                }},
                {{
                    "name": "string",
                    "estimated_price": integer,
                    "why_better": "string"
                }}
            ],
            "trust_warnings": ["string"]
        }}
        """

        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        # STEP 4: Output
        return json.loads(response.text)

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Gemini failed to output valid JSON.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent Error: {str(e)}")

# --- FALLBACK CHAT ENDPOINT ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_gemini(request: ChatRequest):
    """
    A simple endpoint to have an open-ended chat with the Gemini model.
    """
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured.")
        
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(request.message)
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
