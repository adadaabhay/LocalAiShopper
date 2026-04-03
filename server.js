import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
if (!process.env.AI_PROVIDER) {
  process.env.AI_PROVIDER = 'gemini';
}

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const { buildApp } = await import('./backend/shared/app.js');
const app = buildApp(repoRoot);
const port = Number(process.env.PORT || 5000);

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`ShopSense running on http://localhost:${port}`);
  });
}

export default app;
