// Client-side document export — turn a skill's markdown output into a real deliverable:
// Word (.doc), PDF (print), PowerPoint (.pptx), or Excel (.xlsx). No backend; pptx/xlsx
// libs load lazily from CDN only when used. Exposes window.PMExport.
(function (g) {
  'use strict';

  function safeName(t) { return (t || 'pm-skills-output').replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'output'; }
  function saveBlob(blob, filename) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[data-x="' + src + '"]')) return resolve();
      var s = document.createElement('script');
      s.src = src; s.async = true; s.setAttribute('data-x', src);
      s.onload = resolve; s.onerror = function () { reject(new Error('Could not load ' + src)); };
      document.head.appendChild(s);
    });
  }
  // marked + DOMPurify are already on every tool page.
  function mdToHtml(md) { return DOMPurify.sanitize(marked.parse(md || '')); }

  // --- Word (.doc via Office-HTML, opens cleanly in Word/Pages/Docs) ----------
  function toWord(md, title) {
    var body = mdToHtml(md);
    var html = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>" + (title || 'Document') + "</title>" +
      "<style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.5} h1{font-size:20pt} h2{font-size:15pt} h3{font-size:13pt} table{border-collapse:collapse} td,th{border:1px solid #999;padding:4pt 8pt} code{font-family:Consolas,monospace}</style></head><body>" +
      body + "</body></html>";
    saveBlob(new Blob(['﻿', html], { type: 'application/msword' }), safeName(title) + '.doc');
  }

  // --- PDF (clean print window → user saves as PDF; selectable text) -----------
  function toPDF(md, title) {
    var w = window.open('', '_blank');
    if (!w) { alert('Allow pop-ups to export as PDF.'); return; }
    w.document.write('<html><head><meta charset="utf-8"><title>' + (title || 'Document') + '</title>' +
      '<style>body{font:14px/1.65 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:820px;margin:40px auto;padding:0 26px;color:#111}' +
      'h1,h2,h3{line-height:1.25;margin:1.2em 0 .4em} table{border-collapse:collapse;width:100%;margin:12px 0} th,td{border:1px solid #ccc;padding:6px 10px;text-align:left}' +
      'code{background:#f3f3f3;padding:1px 5px;border-radius:4px;font-family:Consolas,monospace} pre{background:#f3f3f3;padding:12px;border-radius:6px;overflow:auto}' +
      'blockquote{border-left:3px solid #ddd;margin:0;padding-left:14px;color:#555}@media print{body{margin:0}}</style></head><body>' +
      mdToHtml(md) + '<scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print();},200);}</scr' + 'ipt></body></html>');
    w.document.close();
  }

  // --- PowerPoint (.pptx) — headings become slides, bullets become content -----
  function mdToSlides(md, title) {
    var lines = (md || '').split('\n'), slides = [], cur = null;
    function push() { if (cur) slides.push(cur); }
    for (var i = 0; i < lines.length; i++) {
      var ln = lines[i].trim();
      var h = ln.match(/^(#{1,3})\s+(.*)/);
      if (h) { push(); cur = { title: clean(h[2]), bullets: [] }; continue; }
      if (!cur) cur = { title: title || 'Overview', bullets: [] };
      var b = ln.match(/^[-*+]\s+(.*)/) || ln.match(/^\d+[.)]\s+(.*)/);
      if (b) cur.bullets.push(clean(b[1]));
      else if (ln && !ln.startsWith('|') && !ln.startsWith('```') && !/^[-=|]{3,}$/.test(ln)) cur.bullets.push(clean(ln));
    }
    push();
    return slides.filter(function (s) { return s.title || s.bullets.length; });
  }
  function clean(s) { return s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/`(.+?)`/g, '$1').replace(/\[(.+?)\]\(.+?\)/g, '$1').trim(); }

  async function toPptx(md, title) {
    await loadScript('https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js');
    var pptx = new g.PptxGenJS();
    pptx.defineLayout && pptx.layout && (pptx.layout = 'LAYOUT_WIDE');
    var slides = mdToSlides(md, title);
    // Title slide
    var t = pptx.addSlide();
    t.addText(title || 'PM Skills', { x: 0.5, y: 2.4, w: '90%', h: 1, fontSize: 34, bold: true, color: '1F2937', align: 'center' });
    t.addText('Generated with PM Skills', { x: 0.5, y: 3.5, w: '90%', h: 0.5, fontSize: 14, color: 'D97757', align: 'center' });
    slides.forEach(function (s) {
      var sl = pptx.addSlide();
      sl.addText(s.title || ' ', { x: 0.5, y: 0.35, w: '92%', h: 0.9, fontSize: 26, bold: true, color: '1F2937' });
      if (s.bullets.length) {
        sl.addText(s.bullets.slice(0, 12).map(function (b) { return { text: b, options: { bullet: true, breakLine: true } }; }),
          { x: 0.6, y: 1.4, w: '88%', h: 5, fontSize: 16, color: '374151', valign: 'top' });
      }
    });
    pptx.writeFile({ fileName: safeName(title) + '.pptx' });
  }

  // --- Excel (.xlsx) — every markdown table becomes a sheet --------------------
  function parseMdTables(md) {
    var lines = (md || '').split('\n'), tables = [], rows = [];
    function isRow(l) { return /^\s*\|.*\|\s*$/.test(l); }
    function isSep(l) { return /^\s*\|?[\s:|-]+\|?\s*$/.test(l) && l.indexOf('-') > -1; }
    function cells(l) { return l.trim().replace(/^\||\|$/g, '').split('|').map(function (c) { return clean(c.trim()); }); }
    function flush() { if (rows.length) tables.push(rows); rows = []; }
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      if (isRow(l)) { if (isSep(l)) continue; rows.push(cells(l)); }
      else flush();
    }
    flush();
    return tables.filter(function (t) { return t.length > 1; });
  }
  async function toXlsx(md, title) {
    var tables = parseMdTables(md);
    if (!tables.length) { alert('No tables found in this output to export to Excel. Try Word or PDF instead.'); return; }
    await loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
    var wb = g.XLSX.utils.book_new();
    tables.forEach(function (t, i) { g.XLSX.utils.book_append_sheet(wb, g.XLSX.utils.aoa_to_sheet(t), 'Table ' + (i + 1)); });
    g.XLSX.writeFile(wb, safeName(title) + '.xlsx');
  }

  g.PMExport = {
    word: toWord, pdf: toPDF, pptx: toPptx, xlsx: toXlsx,
    hasTables: function (md) { return parseMdTables(md).length > 0; },
  };
})(window);
