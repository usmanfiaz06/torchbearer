# Torchbearer

Website for Torchbearer — a social enterprise that designs, delivers and verifies climate and social
programmes.

**Positioning:** delivery-led advisory firm, delivering in Pakistan and Saudi Arabia. The site never asks for
money — it offers capability, and lets the evidence architecture do the persuading.

**Spine:** Design · Deliver · Verify. Verification is the differentiator and is treated as such throughout.

---

## Running it

Plain static HTML, CSS and vanilla JS. No build step required to serve it, no dependencies, no tracking, and
no third-party requests — fonts and photography are self-hosted.

```bash
npx http-server -p 8000        # or: python3 -m http.server 8000
```

Note that a plain file server will not reproduce the extensionless URLs used in production (`/about` rather
than `/about.html`). For a faithful local preview use `vercel dev`.

## Deploying to Vercel

Import the repository and accept the defaults — there is deliberately no `package.json`, so Vercel treats it
as a static site and serves the repository root with no build step.

| Setting | Value |
|---|---|
| Framework preset | Other |
| Build command | *(leave empty)* |
| Output directory | *(leave empty — repo root)* |
| Install command | *(leave empty)* |

`vercel.json` handles the rest:

- **`cleanUrls`** — pages are served at `/about`, not `/about.html`. All internal links are already written
  that way, so there are no redirect hops.
- **`trailingSlash: false`** — one canonical form per URL.
- **`404.html`** — served automatically for unmatched routes.
- **Caching** — fonts immutable for a year, images 30 days, CSS and JS one hour with
  stale-while-revalidate. CSS and JS are not content-hashed, so they are deliberately not marked immutable.
- **Security headers** — `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and a strict
  CSP (`default-src 'self'`). The CSP is only possible because nothing is loaded off-domain; adding an
  external script, font or analytics tag means updating it.

`.vercelignore` keeps `tools/`, the README and the source logo out of the deployment, so the build fragments
are never publicly reachable.

### Domain

`SITE_URL` in `tools/build.py` is set to `https://jointorchbearer.com`; it drives canonical tags, `og:url`,
absolute `og:image` URLs and `sitemap.xml`. If it ever changes, update it there, update the `Sitemap:` line in
`robots.txt`, then rerun **both** `python3 tools/build.py` and the OG renderer — the domain is printed on the
share cards themselves.

---

## Editing content

Pages are assembled from body fragments so the navigation and footer stay identical everywhere.

```
tools/pages/<slug>.html    body fragment — this is what you edit
tools/build.py             wraps each fragment in the shared shell
<slug>.html                generated output, committed to the repo
```

```bash
python3 tools/build.py
```

The build also checks every internal link and reports any that do not resolve.

To add a page: create `tools/pages/<slug>.html`, add an entry to `PAGES` in `tools/build.py`, and add the slug
to `NAV` if it belongs in the main navigation. Then rebuild.

### Structure

```
index         thesis → what we do → SDG alignment → insight → field → method → capabilities → quote → CTA
about         what we are, six operating principles, governance, people
capabilities  design / delivery / measurement & verification / advisory / evaluation, plus "what we don't do"
programmes    Maahwari (flagship), climate resilience, delivery capability programmes
evidence      the evidence standard, four rules, live programme record, verification pack contents
alignment     SDG targets × Vision 2030 × Saudi Green Initiative — the dual mapping table
method        the five stages in full, and what we publish for every programme
insight       field notes and method papers
volunteer     roles, conditions, and the registration form
partner       contact form, who we work with, how an engagement runs
```

---

## Before this goes live

The site is built to be honest about what does not exist yet, so nothing here is fabricated — but these
gaps are the difference between a credible site and a strong one. Every location is marked with a
`<!-- TO ADD: ... -->` comment in the relevant fragment.

**Blocking:**

1. **Legal entity** — registered name, jurisdiction, registration number, incorporation date.
   `tools/pages/about.html`, governance section.
2. **People** — founders and leadership: names, roles, photos, bios. Currently the single largest credibility
   gap. `tools/pages/about.html`, people section.
3. **Advisory board** — three or four credible names changes how the entire site reads. Same file.
4. **Programme figures** — for each programme: district, dates, participant counts, delivery partner, funder,
   and the measured result. `tools/pages/evidence.html` and `tools/pages/programmes.html`.
5. **Contact reality** — confirm `info@jointorchbearer.com` is live and monitored; it is the only address
   on the site. Add a registered address and phone.

**Important:**

6. **Photography.** Everything currently on the site is Unsplash stock, shot in Pakistan and Saudi Arabia and
   labelled on the site as representative rather than as our own programmes. Real operational photography —
   production, training, fieldwork, faces of people working rather than receiving — is the single biggest visual
   upgrade available. Replace the files in `assets/img/photos/`; references live in `tools/pages/`.
7. **Arabic.** A properly written, RTL Arabic version is one of the fastest credibility signals available in
   the Gulf market, and its absence is noticed. Not machine translation.
8. **Capability statement PDF** — a downloadable version of the method framework, linked from `method.html`.
9. **Volunteer form endpoint.** The form on `/volunteer` has no backend: it composes a prefilled message and
   opens the visitor's mail client (`volunteerForm()` in `assets/js/main.js`). That works everywhere and needs no
   infrastructure, but it loses anyone without a configured mail client. To take real submissions, point the
   `<form>` at an endpoint — a Vercel serverless function, or a hosted form service — and add that origin to
   `form-action` and `connect-src` in the `vercel.json` CSP, which currently allows `'self'` only.

---

## Share cards and structured data

Every page carries a 1200x630 Open Graph card, Twitter `summary_large_image` tags, and a schema.org
`@graph` block.

**Cards** live in `assets/img/og/<slug>.jpg` and are rendered from `tools/og/card.html` by screenshotting it
in a headless browser, so they use the site's real typeface and colour system rather than an approximation.
To change a card's title or backdrop, edit the `CARDS` map in `tools/og/render.mjs` and re-run:

```bash
python3 -m http.server 8901 &          # serve the repo root
node tools/og/render.mjs http://127.0.0.1:8901
```

Use landscape source photography — a portrait source crops badly at 1200x630, and the renderer warns when
one is narrower than 1.3:1.

**Structured data** is generated per page by `graph()` in `tools/build.py`: an `Organization` node
(description, logo, `sameAs` social profiles, `areaServed` for Pakistan and Saudi Arabia, `knowsAbout`
topics, contact points), a `WebSite` node, a `WebPage` node, and a `BreadcrumbList` on every page except the
homepage. Organisation-level facts live in the `ORG` dict at the top of that file — edit them once and every
page updates.

Two notes. Inline JSON-LD is not blocked by the site's `script-src 'self'` CSP; it is a data block rather
than an executed script, and this was verified in a browser rather than assumed. And legacy `geo.region`
meta tags are deliberately absent: search engines stopped reading them years ago, so geographic targeting is
expressed through `areaServed` in the graph instead.

---

## Design system

Cloned from the supplied reference: alternating near-black / off-white full-bleed bands, oversized tight-tracked
display type, hairline rules, drag-to-scroll rails, circular arrow controls.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0d0d0d` | dark bands, footer |
| `--deep` | `#0f1720` | secondary dark band |
| `--paper` | `#f0efec` | primary light band |
| `--white` | `#ffffff` | alternating light band |
| `--amber` | `#f2a81d` | single accent — replaces the reference's red |
| `--taupe` | `#c69c6d` | secondary brand tone |

Type is Inter Tight (display) and Inter (body), self-hosted under the SIL Open Font License.

`assets/js/main.js` provides drag rails, the index cyclers used by the "what we do", SDG and method blocks,
scroll reveal, the mobile menu, and the canvas dot map. All behaviour degrades to readable static content
without JavaScript, and honours `prefers-reduced-motion`.

The logo variants in `assets/img/` are generated from `Torchbearers-whiteBG.png` — `mark-dark.png` for light
backgrounds, `mark-light.png` for dark.
