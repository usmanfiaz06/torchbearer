/* Torchbearer — interaction layer */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- mobile nav ---------- */
  function nav() {
    var btn = $('[data-burger]'), panel = $('[data-menu]');
    if (!btn || !panel) return;
    var open = false;
    function set(v) {
      open = v;
      panel.style.display = v ? 'block' : 'none';
      document.body.style.overflow = v ? 'hidden' : '';
      btn.setAttribute('aria-expanded', String(v));
    }
    btn.addEventListener('click', function () { set(!open); });
    $$('a', panel).forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) set(false); });
  }

  /* ---------- drag-to-scroll rails ---------- */
  function rails() {
    $$('[data-drag]').forEach(function (el) {
      var down = false, startX = 0, startL = 0, moved = 0;
      el.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        down = true; moved = 0;
        startX = e.clientX; startL = el.scrollLeft;
        el.classList.add('is-drag');
      });
      el.addEventListener('pointermove', function (e) {
        if (!down) return;
        var d = e.clientX - startX;
        moved = Math.max(moved, Math.abs(d));
        if (moved > 4) { el.setPointerCapture(e.pointerId); e.preventDefault(); }
        el.scrollLeft = startL - d;
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
        el.addEventListener(ev, function () { down = false; el.classList.remove('is-drag'); });
      });
      el.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
      el.addEventListener('dragstart', function (e) { e.preventDefault(); });

      // paired prev / next buttons
      var group = el.getAttribute('data-drag');
      $$('[data-railbtn="' + group + '"]').forEach(function (b) {
        b.addEventListener('click', function () {
          var card = el.firstElementChild;
          var step = card ? card.getBoundingClientRect().width + 20 : 320;
          el.scrollBy({ left: b.getAttribute('data-dir') === 'prev' ? -step : step, behavior: 'smooth' });
        });
      });
    });
  }

  /* ---------- generic index cycler ---------- */
  function cycler(root) {
    var items = $$('[data-item]', root);
    if (!items.length) return;
    var i = 0;
    var counter = $('[data-count]', root);
    var dots = $$('[data-dot]', root);
    var progress = $('[data-progress]', root);

    function draw() {
      items.forEach(function (el, n) { el.classList.toggle('is-on', n === i); });
      dots.forEach(function (el, n) { el.classList.toggle('is-on', n === i); });
      if (counter) counter.textContent = pad(i + 1) + ' / ' + pad(items.length);
      if (progress) progress.style.width = ((i + 1) / items.length * 100) + '%';
      $$('[data-swap]', root).forEach(function (el) {
        var key = el.getAttribute('data-swap');
        var val = items[i].getAttribute('data-' + key);
        if (!val) return;
        if (el.tagName === 'IMG') {
          if (el.src !== val) { el.style.opacity = 0; setTimeout(function () { el.src = val; el.style.opacity = 1; }, 180); }
        } else { el.textContent = val; }
      });
    }
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function go(d) { i = (i + d + items.length) % items.length; draw(); }

    $$('[data-go]', root).forEach(function (b) {
      b.addEventListener('click', function () { go(parseInt(b.getAttribute('data-go'), 10)); });
    });
    dots.forEach(function (d, n) { d.addEventListener('click', function () { i = n; draw(); }); });
    draw();
  }

  /* ---------- reveal on scroll ---------- */
  function reveal() {
    var els = $$('[data-rev]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var d = parseFloat(en.target.getAttribute('data-rev')) || 0;
        setTimeout(function () { en.target.classList.add('is-in'); }, d * 1000);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- abstract dot map ---------- */
  function dotmap() {
    var cv = $('[data-dotmap]');
    if (!cv) return;
    var ctx = cv.getContext('2d');

    // soft density blobs — an abstraction of the landmasses, not a survey map
    var blobs = [
      [0.17, 0.30, 0.14], [0.25, 0.62, 0.10], [0.46, 0.26, 0.10],
      [0.51, 0.52, 0.12], [0.65, 0.31, 0.16], [0.80, 0.72, 0.07]
    ];
    var nodes = [
      { x: 0.598, y: 0.415 },   // Gulf
      { x: 0.678, y: 0.372 }    // South Asia
    ];

    function paint() {
      var w = cv.clientWidth || 900;
      var h = Math.round(w * 0.42);
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = w * dpr; cv.height = h * dpr;
      cv.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      var gap = w < 620 ? 7 : 9;
      for (var x = gap; x < w - gap / 2; x += gap) {
        for (var y = gap; y < h - gap / 2; y += gap) {
          var u = x / w, v = y / h, best = 0;
          for (var b = 0; b < blobs.length; b++) {
            var dx = (u - blobs[b][0]), dy = (v - blobs[b][1]) * 0.62;
            var d = Math.sqrt(dx * dx + dy * dy) / blobs[b][2];
            best = Math.max(best, 1 - d);
          }
          if (best <= 0.02) continue;
          var a = Math.min(1, best * 1.5);
          ctx.fillStyle = 'rgba(255,255,255,' + (0.14 + a * 0.62).toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(x, y, 1.15 + a * 0.7, 0, 6.2832);
          ctx.fill();
        }
      }

      var p = nodes.map(function (n) { return { x: n.x * w, y: n.y * h }; });

      // connecting arc
      var mx = (p[0].x + p[1].x) / 2, my = (p[0].y + p[1].y) / 2 - h * 0.13;
      ctx.strokeStyle = 'rgba(242,168,29,.75)';
      ctx.lineWidth = 1.35;
      ctx.beginPath();
      ctx.moveTo(p[0].x, p[0].y);
      ctx.quadraticCurveTo(mx, my, p[1].x, p[1].y);
      ctx.stroke();

      p.forEach(function (n) {
        ctx.fillStyle = '#f2a81d';
        ctx.beginPath(); ctx.arc(n.x, n.y, 4.4, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = 'rgba(242,168,29,.4)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(n.x, n.y, 13, 0, 6.2832); ctx.stroke();
        ctx.strokeStyle = 'rgba(242,168,29,.18)';
        ctx.beginPath(); ctx.arc(n.x, n.y, 23, 0, 6.2832); ctx.stroke();
      });
    }

    paint();
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(paint, 160); });
  }

  /* ---------- year + init ---------- */
  function boot() {
    $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
    nav(); rails(); reveal(); dotmap();
    $$('[data-cycler]').forEach(cycler);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
