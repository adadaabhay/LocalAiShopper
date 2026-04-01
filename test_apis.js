import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

async function testKeys() {
    console.log('--- TESTING API KEYS ---');

    console.log('1. JINA:', process.env.JINA_API_KEY ? 'Set' : 'Missing');
    try {
        const r = await fetch('https://r.jina.ai/https://example.com', {
            headers: { 'Authorization': `Bearer ${process.env.JINA_API_KEY}` }
        });
        console.log(`   Result: ${r.status === 200 ? 'SUCCESS' : 'FAILED (' + r.status + ')'}`);
    } catch (e) { console.log('   Error:', e.message); }

    console.log('\n2. GEMINI:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Say hello');
        console.log(`   Result: ${result.response.text() ? 'SUCCESS' : 'FAILED'}`);
    } catch (e) { console.log('   Error:', e.message); }

    console.log('\n3. GROQ:', process.env.GROQ_API_KEY ? 'Set' : 'Missing');
    try {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: 'Say hello' }]
            })
        });
        const data = await r.json();
        console.log(`   Result: ${data.choices ? 'SUCCESS' : 'FAILED (' + r.status + ')'}`);
    } catch (e) { console.log('   Error:', e.message); }

    console.log('\n4. OPENROUTER:', process.env.OPENROUTER_API_KEY ? 'Set' : 'Missing');
    try {
        const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp:free',
                messages: [{ role: 'user', content: 'Say hello' }]
            })
        });
        const data = await r.json();
        console.log(`   Result: ${data.choices ? 'SUCCESS' : 'FAILED (' + r.status + ')'}`);
    } catch (e) { console.log('   Error:', e.message); }
}

testKeys();
