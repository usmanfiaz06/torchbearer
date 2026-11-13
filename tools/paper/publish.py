#!/usr/bin/env python3
"""
Publish the white paper as a page people can read in the browser.

    python3 tools/paper/publish.py

Takes whitepaper/index.html (the print source, which is not deployed) and writes
papers/financial-systems-riyadh.html plus its stylesheet and images, with a reader
bar, fit-to-screen scaling and a closing panel for downloads and feedback. Re-run
it, and copy the rendered PDF into assets/papers/, whenever the paper changes.
"""

import os
import re
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "whitepaper")
SLUG = "financial-systems-riyadh"
OUT_DIR = os.path.join(ROOT, "papers", SLUG)
OUT_HTML = os.path.join(ROOT, "papers", SLUG + ".html")

SITE = "https://jointorchbearer.com"
PDF = "/assets/papers/torchbearer-financial-systems-riyadh-2026.pdf"
EMAIL = "aimenrafiq@jointorchbearer.com"
TITLE = "Designing financial systems for agency, resilience and productive participation"
DESC = ("A Torchbearer white paper from the Riyadh roundtable of 10 October 2026: Saudi Arabia has largely won "
        "financial access. What it takes for that access to build agency, resilience and productive participation.")

THOUGHTS = ("mailto:%s?subject=%s" % (EMAIL, "Thoughts%20on%20the%20financial%20systems%20white%20paper"))

HEAD = f"""<meta name="description" content="{DESC}">
<link rel="canonical" href="{SITE}/papers/{SLUG}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Torchbearer">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="{DESC}">
<meta property="og:url" content="{SITE}/papers/{SLUG}">
<meta property="og:image" content="{SITE}/assets/img/og/insight-financial-systems-riyadh.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/mark-dark.png">
<link rel="stylesheet" href="{SLUG}/reader.css">
<script src="{SLUG}/reader.js" defer></script>
"""

BAR = f"""<header class="rbar">
  <a class="rbar__brand" href="/"><img src="/assets/img/mark-light.png" alt=""><span>Torchbearer</span></a>
  <span class="rbar__ttl">White paper · Riyadh, 2026</span>
  <nav class="rbar__act">
    <a class="rbtn rbtn--ghost" href="{THOUGHTS}">Send us your thoughts</a>
    <a class="rbtn" href="{PDF}" download>Download PDF</a>
  </nav>
</header>
<main class="reader" id="reader">
"""

END = f"""</main>
<section class="rend">
  <div class="rend__in">
    <p class="rend__k">Join the conversation</p>
    <h2>What did we miss?</h2>
    <p class="rend__p">Tell us where you agree, where you do not, and what the next roundtable on SME finance should ask.
      Every reply is read, and the sharpest will shape the next room.</p>
    <div class="rend__row">
      <a class="rbtn" href="{THOUGHTS}">Send us your thoughts</a>
      <a class="rbtn rbtn--ghost" href="{PDF}" download>Download the PDF</a>
    </div>
    <form class="rend__form" data-notify="{EMAIL}">
      <label for="nemail">Get the next paper when it is published</label>
      <div><input id="nemail" name="email" type="email" required placeholder="you@organisation.com" autocomplete="email">
      <button class="rbtn" type="submit">Notify me</button></div>
      <p class="rend__note">Opens your email app with the request filled in, so you can see exactly what you send.</p>
    </form>
    <p class="rend__links"><a href="/insight">More from Torchbearer Insight</a> · <a href="/partner">Work with us</a></p>
  </div>
</section>
"""


def main():
    os.makedirs(os.path.join(OUT_DIR, "img"), exist_ok=True)
    html = open(os.path.join(SRC, "index.html"), encoding="utf-8").read()

    # images: copy only what the paper uses, and re-point the paths
    for name in sorted(set(re.findall(r'src="img/([^"]+)"', html))):
        shutil.copy2(os.path.join(SRC, "img", name), os.path.join(OUT_DIR, "img", name))
    html = html.replace('src="img/', 'src="%s/img/' % SLUG)
    html = html.replace('src="../assets/', 'src="/assets/')
    html = html.replace('<link rel="stylesheet" href="paper.css">', '<link rel="stylesheet" href="%s/paper.css">' % SLUG)

    css = open(os.path.join(SRC, "paper.css"), encoding="utf-8").read()
    css = css.replace("@import url(../assets/css/fonts.css);", "@import url(/assets/css/fonts.css);")
    open(os.path.join(OUT_DIR, "paper.css"), "w", encoding="utf-8").write(css)
    for f in ("reader.css", "reader.js"):
        shutil.copy2(os.path.join(ROOT, "tools", "paper", f), os.path.join(OUT_DIR, f))

    html = re.sub(r"<title>.*?</title>", "<title>%s | Torchbearer</title>" % TITLE, html, flags=re.S)
    html = html.replace("</head>", HEAD + "</head>", 1)
    html = html.replace("<body>", "<body class=\"is-reader\">\n" + BAR, 1)
    html = html.replace("</body>", END + "</body>", 1)
    open(OUT_HTML, "w", encoding="utf-8").write(html)
    print("wrote", os.path.relpath(OUT_HTML, ROOT))


if __name__ == "__main__":
    main()
