#!/usr/bin/env python3
"""
Torchbearer static site build.

Wraps each body fragment in tools/pages/<slug>.html with the shared shell
(head, navigation, footer) and writes <slug>.html to the repo root.

    python3 tools/build.py

No dependencies, no toolchain. The generated .html files are committed, so the
site can be served as-is from any static host.
"""

import os
import re

# Public origin — used for canonical URLs, og:url and sitemap.xml.
# Change this when the production domain is confirmed.
SITE_URL = "https://torchbearer.org"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_DIR = os.path.join(ROOT, "tools", "pages")

# slug: (nav label or None to hide, <title>, meta description)
PAGES = {
    "index": (None,
              "Torchbearer — Delivery, design and verification for climate and social programmes",
              "Torchbearer designs, delivers and verifies climate and social programmes in the environments that are "
              "hardest to reach — and reports outcomes institutions can put their name to."),
    "about": ("About", "About — Torchbearer",
              "Who Torchbearer is, how we are governed, and the principles we hold ourselves to."),
    "capabilities": ("Capabilities", "Capabilities — Torchbearer",
                     "Programme design, field delivery, measurement and verification, and advisory for institutions "
                     "running their own social and environmental programmes."),
    "programmes": ("Programmes", "Programmes — Torchbearer",
                   "Maahwari and our climate resilience programmes — what they do, how they are delivered, and what "
                   "we measure."),
    "evidence": ("Evidence", "Evidence — Torchbearer",
                 "Our evidence standard, what we publish for every programme, and the current programme record."),
    "alignment": ("Alignment", "Alignment — Torchbearer",
                  "Every programme mapped to named Sustainable Development Goal targets, Saudi Vision 2030 and the "
                  "Saudi Green Initiative."),
    "method": ("Method", "Method — Torchbearer",
               "The Torchbearer framework: Scope, Design, Deliver, Measure, Verify — and the standards attached to "
               "each stage."),
    "insight": ("Insight", "Insight — Torchbearer",
                "Field notes, method papers and programme data from Torchbearer."),
    "partner": (None, "Partner with us — Torchbearer",
                "How Torchbearer works with institutions, funds, corporates and government entities."),
    "credits": (None, "Credits — Torchbearer",
                "Photography, typeface and attribution credits for torchbearer.org."),
    "404": (None, "Page not found — Torchbearer",
            "The page you were looking for does not exist."),
}

NAV = ["about", "capabilities", "programmes", "evidence", "alignment", "method", "insight"]

def to_url(slug):
    """Deployed path for a page slug. Vercel serves these extensionless."""
    return "/" if slug == "index" else "/" + slug


def absolutise(html):
    """Rewrite fragment-relative links to root-absolute, extensionless URLs.

    Fragments are authored with plain relative paths so they stay readable and
    previewable on disk; the deployed site uses absolute paths so that a page at
    /about resolves its assets identically to one at /.
    """
    html = re.sub(r'(href|src)="index\.html(#[^"]*)?"',
                  lambda m: '%s="/%s"' % (m.group(1), m.group(2) or ""), html)
    html = re.sub(r'(href|src)="(?!https?:|//|/|#|mailto:)([a-z0-9\-]+)\.html(#[^"]*)?"',
                  lambda m: '%s="/%s%s"' % (m.group(1), m.group(2), m.group(3) or ""), html)
    html = re.sub(r'(href|src)="(?!https?:|//|/|#|mailto:)(assets/)',
                  lambda m: '%s="/%s' % (m.group(1), m.group(2)), html)
    html = re.sub(r'data-img="(?!https?:|/)(assets/)', r'data-img="/\1', html)
    return html


SHELL = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<link rel="canonical" href="{canonical}">
<meta property="og:url" content="{canonical}">
<link rel="icon" href="/assets/img/mark-dark.png">
<link rel="stylesheet" href="assets/css/fonts.css">
<link rel="stylesheet" href="assets/css/main.css">
</head>
<body>

<a href="#main" class="skip">Skip to content</a>

<header class="nav">
  <div class="wrap nav__in">
    <a class="nav__brand" href="index.html" aria-label="Torchbearer — home">
      <img src="assets/img/mark-dark.png" alt="">
      <span class="nav__word">Torchbearer<small>Sustainability · Inclusion · Impact</small></span>
    </a>
    <nav class="nav__links" aria-label="Primary">
{navlinks}
    </nav>
    <div class="nav__tools">
      <a class="pill nav__cta" href="partner.html">Partner with us</a>
      <button class="nav__burger" data-burger aria-label="Menu" aria-expanded="false"><span></span></button>
    </div>
  </div>
</header>

<div data-menu class="menu">
  <div class="wrap" style="padding-block:40px">
    <nav class="menu__nav" aria-label="Mobile">
{menulinks}
    </nav>
    <a class="pill" href="partner.html" style="margin-top:32px">Partner with us</a>
  </div>
</div>

<main id="main">

{body}

</main>

<footer class="foot">
  <div class="wrap">
    <div class="foot__top">
      <div class="foot__brand">
        <img src="assets/img/mark-light.png" alt="Torchbearer">
        <p>A social enterprise designing, delivering and verifying climate and social programmes.
          Sustainability. Inclusion. Impact.</p>
      </div>
      <div>
        <h5>Organisation</h5>
        <ul>
          <li><a href="about.html">About</a></li>
          <li><a href="about.html#governance">Governance</a></li>
          <li><a href="method.html">Method</a></li>
          <li><a href="partner.html">Partner with us</a></li>
        </ul>
      </div>
      <div>
        <h5>Work</h5>
        <ul>
          <li><a href="capabilities.html">Capabilities</a></li>
          <li><a href="programmes.html">Programmes</a></li>
          <li><a href="programmes.html#maahwari">Maahwari</a></li>
          <li><a href="evidence.html">Evidence</a></li>
        </ul>
      </div>
      <div>
        <h5>Resources</h5>
        <ul>
          <li><a href="alignment.html">Alignment framework</a></li>
          <li><a href="insight.html">Insight</a></li>
          <li><a href="partner.html#contact">Contact</a></li>
          <li><a href="credits.html">Credits</a></li>
        </ul>
      </div>
    </div>
    <div class="foot__bot">
      <span>© <span data-year>2026</span> Torchbearer. All rights reserved.</span>
      <span>Sustainability · Inclusion · Impact</span>
    </div>
  </div>
</footer>

<script src="assets/js/main.js"></script>
</body>
</html>
"""


def build():
    written = []
    for slug, (label, title, desc) in PAGES.items():
        frag = os.path.join(PAGES_DIR, slug + ".html")
        if not os.path.exists(frag):
            print("  skip (no fragment):", slug)
            continue
        body = open(frag, encoding="utf-8").read().strip()

        navlinks, menulinks = [], []
        for n in NAV:
            cur = ' aria-current="page"' if n == slug else ""
            navlinks.append('      <a href="%s"%s>%s</a>' % (to_url(n), cur, PAGES[n][0]))
            menulinks.append('      <a href="%s" class="d3"%s>%s</a>' % (to_url(n), cur, PAGES[n][0]))

        html = absolutise(SHELL.format(
            title=title, desc=desc, body=body,
            canonical=SITE_URL.rstrip("/") + to_url(slug),
            navlinks="\n".join(navlinks), menulinks="\n".join(menulinks),
        ))
        out = os.path.join(ROOT, slug + ".html")
        open(out, "w", encoding="utf-8").write(html)
        written.append(slug + ".html")
    print("built %d pages: %s" % (len(written), ", ".join(written)))

    # sitemap — every page except the 404
    urls = [SITE_URL.rstrip("/") + to_url(s) for s in PAGES if s != "404"]
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>',
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        sitemap.append("  <url><loc>%s</loc></url>" % u)
    sitemap.append("</urlset>")
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write("\n".join(sitemap) + "\n")
    print("wrote sitemap.xml (%d urls)" % len(urls))

    # fail loudly on links and assets that do not resolve
    missing = set()
    for name in written:
        html = open(os.path.join(ROOT, name), encoding="utf-8").read()
        for href in re.findall(r'(?:href|src)="(/[^"#?]*)', html):
            target = href.rstrip("/")
            if target == "":
                target = "index.html"
            elif not os.path.splitext(target)[1]:
                target = target.lstrip("/") + ".html"
            else:
                target = target.lstrip("/")
            if not os.path.exists(os.path.join(ROOT, target)):
                missing.add("%s -> %s" % (name, href))
    if missing:
        print("BROKEN LINKS:")
        for m in sorted(missing):
            print("  ", m)
        raise SystemExit(1)
    print("all internal links and assets resolve")


if __name__ == "__main__":
    build()
