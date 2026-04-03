import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
process.env.AI_PROVIDER = 'gemini';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, '..', '..');
const { buildApp } = await import('../shared/app.js');
const app = buildApp(repoRoot);
const port = Number(process.env.PORT || 5000);

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`ShopSense (Gemini) on http://localhost:${port}`);
  });
}

export default app;
