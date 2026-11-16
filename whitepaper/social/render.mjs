/**
 * Render each .post in posts.html to a 1080x1350 PNG.
 *
 *   python3 -m http.server 8902 &
 *   node whitepaper/social/render.mjs http://127.0.0.1:8902
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ORIGIN = process.argv[2] || 'http://127.0.0.1:8902';
const NAMES = ['post-1-the-room', 'post-2a-headline-data', 'post-2b-headline-statement'];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
const resp = await page.goto(`${ORIGIN}/whitepaper/social/posts.html`, { waitUntil: 'networkidle' });
if (!resp || !resp.ok()) throw new Error(`posts failed to load: ${resp && resp.status()}`);
await page.evaluate(() => document.fonts.ready);
const posts = await page.$$('.post');
for (let i = 0; i < posts.length; i++) {
  const out = `whitepaper/social/${NAMES[i] || 'post-' + (i + 1)}.png`;
  await posts[i].screenshot({ path: out });
  console.log('  ok', out);
}
await browser.close();
