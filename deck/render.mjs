/**
 * Render the pitch deck to PDF at 1280x720 (16:9), one slide per page.
 *
 *   python3 -m http.server 8901 &
 *   node deck/render.mjs http://127.0.0.1:8901
 *
 * Serving over HTTP rather than file:// matters — the self-hosted fonts are
 * referenced relatively and will not load otherwise.
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ORIGIN = process.argv[2] || 'http://127.0.0.1:8901';
const OUT = process.argv[3] || 'deck/Torchbearer-Misk-Launchpad.pdf';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

const resp = await page.goto(`${ORIGIN}/deck/index.html`, { waitUntil: 'networkidle' });
if (!resp || !resp.ok()) throw new Error(`deck failed to load: ${resp && resp.status()}`);

await page.evaluate(() => document.fonts.ready);

const report = await page.evaluate(() => {
  const slides = [...document.querySelectorAll('.slide')];
  return {
    count: slides.length,
    // a slide whose content exceeds the frame will silently crop in the PDF
    overflowing: slides
      .map((s, i) => ({ n: i + 1, over: s.scrollHeight - s.clientHeight }))
      .filter(s => s.over > 2),
    brokenImages: [...document.images]
      .filter(im => !im.complete || im.naturalWidth === 0)
      .map(im => im.getAttribute('src')),
  };
});

if (report.brokenImages.length) throw new Error('broken images: ' + report.brokenImages.join(', '));
if (report.overflowing.length) {
  console.warn('  ! content overflows the slide frame and will crop:',
    report.overflowing.map(s => `slide ${s.n} by ${s.over}px`).join('; '));
}

await page.pdf({
  path: OUT,
  width: '1280px',
  height: '720px',
  printBackground: true,
  pageRanges: `1-${report.count}`,
});

console.log(`rendered ${report.count} slides -> ${OUT}`);
await browser.close();
