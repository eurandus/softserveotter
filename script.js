(function () {
  var root = document.documentElement;
  var stage = document.getElementById('stage');
  var ring = document.getElementById('ring');
  var cards = Array.prototype.slice.call(ring.children);
  var toggle = document.getElementById('motionToggle');
  var idxLabel = document.getElementById('activeIdx');
  var N = cards.length;
  var step = 360 / N;
  var radius = 0;
  var ticking = false;

  document.getElementById('yr').textContent = new Date().getFullYear();

  // ---- motion preference (OS setting + manual toggle) ----
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var saved = null;
  try { saved = localStorage.getItem('motion'); } catch (e) {}
  var paused = saved ? saved === 'paused' : mq.matches;

  function applyMotion() {
    root.classList.toggle('no-motion', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Resume motion' : 'Pause motion';
    if (paused) {
      ring.style.transform = '';
      cards.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; c.style.pointerEvents = ''; });
    } else {
      layout();
      update();
    }
  }

  toggle.addEventListener('click', function () {
    paused = !paused;
    try { localStorage.setItem('motion', paused ? 'paused' : 'running'); } catch (e) {}
    applyMotion();
  });

  // ---- layout: place cards on a ring ----
  function layout() {
    var w = Math.min(280, window.innerWidth * 0.68);
    var h = Math.min(380, w * 1.36);
    ring.style.setProperty('--cw', w + 'px');
    ring.style.setProperty('--ch', h + 'px');
    radius = (w / 2) / Math.tan(Math.PI / N) + 30;
    cards.forEach(function (c, i) {
      c.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + radius + 'px)';
    });
  }

  // ---- scroll-linked rotation ----
  function progress() {
    var rect = stage.getBoundingClientRect();
    var total = stage.offsetHeight - window.innerHeight;
    return Math.min(1, Math.max(0, -rect.top / total));
  }

  function update() {
    ticking = false;
    if (paused) return;
    var p = progress();
    var rot = -p * step * (N - 1);
    ring.style.transform = 'translateZ(' + (-radius) + 'px) rotateY(' + rot + 'deg)';
    var front = 0, best = 999;
    cards.forEach(function (c, i) {
      var d = i * step + rot;           // angle from the front
      d = ((d + 540) % 360) - 180;      // normalise to -180..180
      var facing = (Math.cos(d * Math.PI / 180) + 1) / 2;
      c.style.opacity = (0.15 + 0.85 * facing).toFixed(3);
      c.style.pointerEvents = Math.abs(d) < step * 0.6 ? 'auto' : 'none';
      if (Math.abs(d) < best) { best = Math.abs(d); front = i; }
    });
    idxLabel.textContent = ('0' + (front + 1)).slice(-2);
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { if (!paused) { layout(); update(); } });
  applyMotion();
})();
