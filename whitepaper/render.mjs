/**
 * Render the white paper to an A4 PDF, plus PNG previews of every page.
 *
 *   python3 -m http.server 8902 &
 *   node whitepaper/render.mjs http://127.0.0.1:8902 [--png]
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ORIGIN = process.argv[2] || 'http://127.0.0.1:8902';
const OUT = 'whitepaper/Torchbearer-White-Paper-Financial-Inclusion-Riyadh-2026.pdf';
const PNG = process.argv.includes('--png');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
const resp = await page.goto(`${ORIGIN}/whitepaper/index.html`, { waitUntil: 'networkidle' });
if (!resp || !resp.ok()) throw new Error(`paper failed to load: ${resp && resp.status()}`);
await page.evaluate(() => document.fonts.ready);

const report = await page.evaluate(() => {
  const pages = [...document.querySelectorAll('.page')];
  // anything inside a page that pokes past its bottom edge will be cropped
  const over = [];
  pages.forEach((p, i) => {
    const pb = p.getBoundingClientRect().bottom;
    p.querySelectorAll('.pad > *, .pad, [class*="body"], .run').forEach(el => {
      const b = el.getBoundingClientRect().bottom;
      if (b > pb + 1) over.push(`p${i + 1} ${el.className || el.tagName} +${Math.round(b - pb)}px`);
    });
    const pad = p.querySelector('.pad');
    if (pad && pad.scrollHeight > pad.clientHeight + 2) over.push(`p${i + 1} .pad scroll +${pad.scrollHeight - pad.clientHeight}px`);
  });
  return {
    count: pages.length, over,
    broken: [...document.images].filter(im => !im.complete || !im.naturalWidth).map(im => im.getAttribute('src')),
  };
});
if (report.broken.length) throw new Error('broken images: ' + report.broken.join(', '));
if (report.over.length) console.warn('  ! overflow:\n   ' + report.over.join('\n   '));

if (PNG) {
  const els = await page.$$('.page');
  for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: `whitepaper/preview/p${String(i + 1).padStart(2, '0')}.png` });
}
await page.pdf({ path: OUT, width: '210mm', height: '297mm', printBackground: true, preferCSSPageSize: true });
console.log(`rendered ${report.count} pages -> ${OUT}`);
await browser.close();
