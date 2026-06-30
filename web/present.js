// Live "Present" mode — turn the current skill output into an in-browser slideshow.
// Splits the markdown at H1/H2 headings into slides, renders each (with diagrams/charts), and shows a
// fullscreen deck with arrow-key / space / Esc navigation. No dependency beyond marked + DOMPurify
// (already loaded). Exposes window.PMPresent.start(markdown, title).
(function (g) {
  'use strict';

  // Split markdown into slides at top-level (#) and section (##) headings.
  function splitSlides(md, title) {
    var lines = (md || '').split('\n');
    var slides = [], cur = null, inFence = false;
    function push() { if (cur && cur.trim()) slides.push(cur); cur = null; }
    for (var i = 0; i < lines.length; i++) {
      var ln = lines[i];
      if (/^\s*```/.test(ln)) inFence = !inFence; // don't split inside a code/diagram fence
      if (!inFence && /^#{1,2}\s+\S/.test(ln)) { push(); cur = ln + '\n'; }
      else { if (cur == null) cur = ''; cur += ln + '\n'; }
    }
    push();
    // Prepend a title slide.
    slides.unshift('# ' + (title || 'PM Skills') + '\n');
    return slides;
  }

  function start(md, title) {
    if (!md || !md.trim()) return;
    var slidesMd = splitSlides(md, title);
    var idx = 0;

    var overlay = document.createElement('div');
    overlay.className = 'present-overlay';
    overlay.innerHTML =
      '<div class="present-stage"><div class="present-slide markdown" id="presentSlide"></div></div>' +
      '<div class="present-bar">' +
        '<button class="present-btn" id="presentPrev" title="Previous (←)">‹</button>' +
        '<span class="present-count" id="presentCount"></span>' +
        '<button class="present-btn" id="presentNext" title="Next (→)">›</button>' +
        '<button class="present-btn present-close" id="presentClose" title="Exit (Esc)">✕</button>' +
      '</div>';
    document.body.appendChild(overlay);

    var slideEl = overlay.querySelector('#presentSlide');
    var countEl = overlay.querySelector('#presentCount');

    function render() {
      slideEl.innerHTML = DOMPurify.sanitize(marked.parse(slidesMd[idx], { breaks: true }));
      if (g.PMDiagrams) g.PMDiagrams.enhance(slideEl, 'slide');
      if (g.PMCharts) g.PMCharts.enhance(slideEl, 'slide');
      countEl.textContent = (idx + 1) + ' / ' + slidesMd.length;
      slideEl.scrollTop = 0;
    }
    function go(n) { idx = Math.max(0, Math.min(slidesMd.length - 1, n)); render(); }
    function close() {
      document.removeEventListener('keydown', onKey);
      if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) {} }
      overlay.remove();
    }
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(idx + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(idx - 1); }
      else if (e.key === 'Escape') { close(); }
      else if (e.key === 'Home') { go(0); }
      else if (e.key === 'End') { go(slidesMd.length - 1); }
    }

    overlay.querySelector('#presentNext').addEventListener('click', function () { go(idx + 1); });
    overlay.querySelector('#presentPrev').addEventListener('click', function () { go(idx - 1); });
    overlay.querySelector('#presentClose').addEventListener('click', close);
    // Click the right/left third of the stage to advance/retreat.
    overlay.querySelector('.present-stage').addEventListener('click', function (e) {
      if (e.target.closest('a, button, .diagram-tools')) return;
      var x = e.clientX / window.innerWidth;
      if (x > 0.66) go(idx + 1); else if (x < 0.34) go(idx - 1);
    });
    document.addEventListener('keydown', onKey);
    try { (overlay.requestFullscreen || function () {}).call(overlay); } catch (e) {}
    render();
  }

  g.PMPresent = { start: start, splitSlides: splitSlides };
})(window);
