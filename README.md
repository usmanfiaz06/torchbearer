# Torchbearer

Website for Torchbearer — a social enterprise that designs, delivers and verifies climate and social
programmes.

**Positioning:** delivery-led advisory firm. Pakistan is the delivery geography; the Gulf, and Saudi Arabia
in particular, is the partnership focus. The site never asks for money — it offers capability, and lets the
evidence architecture do the persuading.

**Spine:** Design · Deliver · Verify. Verification is the differentiator and is treated as such throughout.

---

## Running it

Plain static HTML, CSS and vanilla JS. No build step required to serve it, no dependencies, no tracking, and
no third-party requests — fonts and photography are self-hosted.

```bash
npx http-server -p 8000        # or: python3 -m http.server 8000
```

Deploys as-is to GitHub Pages, Netlify, Vercel, S3 or any static host. Point the host at the repository root.

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
partner       who we work with, how an engagement runs, contact
credits       photography, typeface and source attribution
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
5. **Contact reality** — confirm the domain and that the three mailboxes exist.
   `tools/pages/partner.html`. Add registered address, phone and LinkedIn URL.

**Important:**

6. **Photography.** Everything currently on the site is Unsplash stock, credited on `credits.html` and
   labelled as representative. Real operational photography — production, training, fieldwork, faces of people
   working rather than receiving — is the single biggest visual upgrade available. Replace files in
   `assets/img/photos/` and update `tools/pages/credits.html`.
7. **Arabic.** A properly written, RTL Arabic version is one of the fastest credibility signals available in
   the Gulf market, and its absence is noticed. Not machine translation.
8. **Capability statement PDF** — a downloadable version of the method framework, linked from `method.html`.
9. **Social URLs** — the LinkedIn and Instagram links on the homepage currently point at `#`.

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
