/**
 * Render Open Graph share cards (1200x630) into assets/img/og/.
 *
 *   python3 -m http.server 8901 &          # serve the repo root
 *   node tools/og/render.mjs http://127.0.0.1:8901
 *
 * Cards are screenshotted from tools/og/card.html so they use the site's real
 * typeface and colour system rather than an approximation of them.
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';

const ORIGIN = process.argv[2] || 'http://127.0.0.1:8901';
const OUT = 'assets/img/og';

// slug: [eyebrow, title (| = line break), background photo id]
const CARDS = {
  index:        ['Sustainability · Inclusion · Impact', 'Where mandates|meet reality',      'photo-1514558427911-8e293bebf18c'],
  about:        ['About',        'A social enterprise|built around delivery',               'photo-1651135135875-a6d458a9462d'],
  capabilities: ['Capabilities', 'What we are|built to do',                                 'photo-1606023760910-5577d0dbe7b5'],
  programmes:   ['Programmes',   'Maahwari, and the|work around it',                        'photo-1698992985938-32e7cff274a3'],
  evidence:     ['Evidence',     'Evidence,|on the record',                                 'photo-1645891697649-6548872ce502'],
  alignment:    ['Alignment',    'One programme,|two frameworks',                           'photo-1716571349499-0b83f5dbb7a2'],
  method:       ['Method',       'Scope. Design. Deliver.|Measure. Verify.',                'photo-1698993082050-19ca94c62fb8'],
  insight:      ['Insight',      'Field notes|&amp; method papers',                         'photo-1565456796917-ba75922b081f'],
  volunteer:    ['Volunteer',    'Volunteer|with us',                                       'photo-1778864875183-9a89ea0ac26f'],
  'insight/third-sector':    ['Sector analysis · Saudi Arabia', "Saudi Arabia's third sector|grew ninefold", 'photo-1694018359679-49465b4c0d61'],
  'insight/disclosure-2030': ['Outlook · Saudi Arabia', 'Reported under|tomorrow\u2019s rules',        'photo-1716571349499-0b83f5dbb7a2'],
  'insight/gender-gap':        ['Women & gender', 'Two countries,|opposite directions',        'photo-1633279305915-3760f40ae70d'],
  'insight/capital-gap':       ['Investment', 'One market broke records.|The other lost 90%.',   'photo-1783261289456-1215b34c52e1'],
  'insight/access-to-finance': ['Access to finance', 'Thirteen|per cent',                        'photo-1782216521575-d1525e6ba8d7'],
  'insight/social-pillar':     ['ESG', 'The S in ESG is the one|nobody can prove',               'photo-1784637729389-f24e1d2a8b22'],
  'insight/reuse-rate':      ['Method paper', 'Reusables only work|if people keep using them',   'photo-1707904549943-2b97a4e8f279'],
  'insight/impact-numbers':  ['Method paper', 'Why most impact numbers|do not survive an audit', 'photo-1606023760910-5577d0dbe7b5'],
  'insight/school-days':     ['Women\u2019s health · Pakistan', 'The school days|nobody counts', 'photo-1664819323515-ce3fab4d4d1e'],
  'insight/thirty-days':     ['Field note · Pakistan', 'A flood response,|thirty days in',       'photo-1565456796917-ba75922b081f'],
  partner:      ['Partner with us', 'Work|with us',                                         'photo-1694018359679-49465b4c0d61'],
};

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

let n = 0;
for (const [slug, [eyebrow, title, img]] of Object.entries(CARDS)) {
  const url = `${ORIGIN}/tools/og/card.html?e=${encodeURIComponent(eyebrow)}` +
              `&t=${encodeURIComponent(title)}&img=${encodeURIComponent(img)}`;
  const resp = await page.goto(url, { waitUntil: 'networkidle' });
  if (!resp || !resp.ok()) throw new Error(`card.html failed for ${slug}: ${resp && resp.status()}`);
  const bg = await page.evaluate(() => {
    const el = document.getElementById('bg');
    if (!el) return { ok: true, ratio: 99 };
    return { ok: el.complete && el.naturalWidth > 0, ratio: el.naturalWidth / el.naturalHeight };
  });
  if (!bg.ok) throw new Error(`background image failed to load for ${slug}`);
  if (bg.ratio < 1.3) console.warn(`  ! ${slug}: source is ${bg.ratio.toFixed(2)}:1 — portrait sources crop badly at 1200x630`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/${slug.replace('/', '-')}.jpg`, type: 'jpeg', quality: 86 });
  console.log('  ok', `${slug.replace('/', '-')}.jpg`);
  n++;
}

await browser.close();
console.log(`rendered ${n} og cards`);
