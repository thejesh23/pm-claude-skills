// Render ```chart code blocks (a small JSON spec produced by any skill) into real charts via Chart.js,
// with PNG export. Mirrors diagrams.js. marked turns a ```chart fence into
// <pre><code class="language-chart">…</code></pre>; enhance() finds those, parses the JSON, and draws a
// bar/line/pie/doughnut chart on a <canvas> (Chart.js lazy-loaded from CDN). Exposes window.PMCharts.
//
// Spec format (simple — easy for a model to emit):
//   { "type": "bar"|"line"|"pie"|"doughnut"|"area",
//     "title": "Optional title",
//     "labels": ["Q1","Q2","Q3"],
//     "series": [ { "name": "MRR", "data": [10,12,15] }, { "name": "Churn", "data": [2,2,1] } ] }
// A raw Chart.js config (an object with a "data" key) is also accepted and passed through.
(function (g) {
  'use strict';
  var CHART_SRC = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
  var loading = null;
  // Playground-flavoured palette (accent + complements), used in order for each series/slice.
  var PALETTE = ['#d97757', '#5aa9e6', '#6ee7b7', '#f4c95d', '#b07cf0', '#ef6f6c', '#7ad7c1', '#9aa0aa'];

  function loadChart() {
    if (g.Chart) return Promise.resolve(g.Chart);
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = CHART_SRC; s.async = true;
      s.onload = function () { resolve(g.Chart); };
      s.onerror = function () { reject(new Error('Could not load the chart library.')); };
      document.head.appendChild(s);
    });
    return loading;
  }

  function hexA(hex, a) {
    var m = hex.replace('#', '');
    var r = parseInt(m.slice(0, 2), 16), gg = parseInt(m.slice(2, 4), 16), b = parseInt(m.slice(4, 6), 16);
    return 'rgba(' + r + ',' + gg + ',' + b + ',' + a + ')';
  }

  // Turn the simple spec into a Chart.js config. Pass through a raw config untouched.
  function toConfig(spec) {
    if (spec && spec.data && spec.type) return spec; // already a Chart.js config
    var type = (spec.type || 'bar').toLowerCase();
    var area = type === 'area';
    var base = area ? 'line' : type;
    var pieish = base === 'pie' || base === 'doughnut';
    var series = spec.series || (spec.data ? [{ name: spec.label || '', data: spec.data }] : []);
    var datasets;
    if (pieish) {
      datasets = [{
        data: (series[0] && series[0].data) || [],
        backgroundColor: ((spec.labels || []).map(function (_l, i) { return PALETTE[i % PALETTE.length]; })),
        borderColor: '#0d0f14', borderWidth: 2,
      }];
    } else {
      datasets = series.map(function (s, i) {
        var c = PALETTE[i % PALETTE.length];
        return {
          label: s.name || s.label || ('Series ' + (i + 1)),
          data: s.data || [],
          backgroundColor: base === 'line' ? hexA(c, area ? 0.18 : 0.85) : hexA(c, 0.78),
          borderColor: c, borderWidth: 2, pointBackgroundColor: c,
          fill: area, tension: base === 'line' ? 0.3 : 0,
        };
      });
    }
    var ink = '#c7ccd6', grid = 'rgba(255,255,255,0.08)';
    return {
      type: base,
      data: { labels: spec.labels || [], datasets: datasets },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: {
          legend: { display: !pieish ? datasets.length > 1 : true, labels: { color: ink } },
          title: { display: !!spec.title, text: spec.title || '', color: '#e8eaf0', font: { size: 15 } },
        },
        scales: pieish ? {} : {
          x: { ticks: { color: ink }, grid: { color: grid } },
          y: { ticks: { color: ink }, grid: { color: grid }, beginAtZero: spec.beginAtZero !== false },
        },
      },
    };
  }

  function exportPng(canvas, base) {
    // Composite onto a dark background so the exported PNG isn't transparent.
    var out = document.createElement('canvas');
    out.width = canvas.width; out.height = canvas.height;
    var ctx = out.getContext('2d');
    ctx.fillStyle = '#0d0f14'; ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, 0, 0);
    var a = document.createElement('a');
    a.href = out.toDataURL('image/png'); a.download = base + '.png'; a.click();
  }

  function toolbar(canvas, base) {
    var bar = document.createElement('div');
    bar.className = 'diagram-tools';
    var png = document.createElement('button');
    png.type = 'button'; png.className = 'ghost'; png.textContent = '🖼️ PNG';
    png.title = 'Download this chart as a PNG image';
    png.addEventListener('click', function () { exportPng(canvas, base); });
    bar.appendChild(png);
    return bar;
  }

  // Find rendered ```chart blocks under root and turn each into a chart. Safe to call repeatedly.
  function enhance(root, baseName) {
    if (!root) return;
    var blocks = [].slice.call(root.querySelectorAll('code.language-chart'))
      .map(function (c) { return c.closest('pre') || c; })
      .filter(function (pre) { return pre && !pre.dataset.chartDone; });
    if (!blocks.length) return;
    var base = baseName || 'chart';
    loadChart().then(function (Chart) {
      blocks.forEach(function (pre) {
        if (pre.dataset.chartDone) return;
        pre.dataset.chartDone = '1';
        var code = pre.querySelector('code');
        var src = (code ? code.textContent : pre.textContent) || '';
        var spec;
        try { spec = JSON.parse(src); } catch (e) {
          pre.dataset.chartDone = 'err';
          var hint = document.createElement('div');
          hint.className = 'diagram-err';
          hint.textContent = '⚠ Could not read this chart (invalid JSON) — showing the source.';
          pre.parentNode.insertBefore(hint, pre);
          return;
        }
        var fig = document.createElement('figure');
        fig.className = 'diagram chart';
        var holder = document.createElement('div');
        holder.className = 'chart-holder';
        var canvas = document.createElement('canvas');
        holder.appendChild(canvas);
        fig.appendChild(holder);
        pre.replaceWith(fig);
        try {
          new Chart(canvas.getContext('2d'), toConfig(spec));
          fig.appendChild(toolbar(canvas, base));
        } catch (e) {
          fig.replaceWith(pre);
          pre.dataset.chartDone = 'err';
        }
      });
    }).catch(function () { /* Chart.js CDN unreachable — leave code blocks as-is */ });
  }

  g.PMCharts = { enhance: enhance, load: loadChart };
})(window);
