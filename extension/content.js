/* PM Skills content script — injects a skill picker into ChatGPT, Claude.ai & Gemini.
 * Clicking a skill drops its framework into the chat box so the user just adds their task.
 * No network calls; skills are bundled with the extension. */
(() => {
  'use strict';
  if (window.__pmSkillsLoaded) return;
  window.__pmSkillsLoaded = true;

  const HOST = location.hostname;
  const SITE = /claude\.ai/.test(HOST) ? 'claude'
    : /gemini\.google/.test(HOST) ? 'gemini'
    : 'chatgpt';

  let SKILLS = [];

  // --- find the live chat input for the current site ----------------------
  function findInput() {
    const sels = SITE === 'claude'
      ? ['div.ProseMirror[contenteditable="true"]', 'div[contenteditable="true"]']
      : SITE === 'gemini'
        ? ['.ql-editor[contenteditable="true"]', 'rich-textarea .ql-editor', 'div[contenteditable="true"]']
        : ['#prompt-textarea', 'div[contenteditable="true"]', 'textarea'];
    for (const s of sels) {
      const el = document.querySelector(s);
      if (el && el.offsetParent !== null) return el;
    }
    // last resort: the largest visible textarea / contenteditable
    const cands = [...document.querySelectorAll('textarea, div[contenteditable="true"]')]
      .filter((e) => e.offsetParent !== null);
    return cands.sort((a, b) => b.clientHeight - a.clientHeight)[0] || null;
  }

  // --- insert text into a textarea or contenteditable, prepended ----------
  function insertSkill(text) {
    const el = findInput();
    if (!el) {
      navigator.clipboard.writeText(text);
      toast("Couldn't find the chat box — copied the skill to your clipboard instead.");
      return;
    }
    el.focus();
    const existing = (el.tagName === 'TEXTAREA' ? el.value : el.innerText) || '';
    const combined = existing.trim()
      ? text + '\n\n---\n\nMy task:\n' + existing.trim()
      : text + '\n\n---\n\nMy task: ';

    if (el.tagName === 'TEXTAREA') {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(el, combined);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // contenteditable (ChatGPT ProseMirror, Claude ProseMirror, Gemini Quill)
      el.innerHTML = '';
      el.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data: combined }));
      // execCommand still works for these editors and fires the right events
      const ok = document.execCommand && document.execCommand('insertText', false, combined);
      if (!ok) {
        combined.split('\n').forEach((line, i) => {
          if (i) el.appendChild(document.createElement('br'));
          el.appendChild(document.createTextNode(line));
        });
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    toast('Skill inserted — add your task and send.');
  }

  // --- toast --------------------------------------------------------------
  let toastT;
  function toast(msg) {
    let t = document.getElementById('pm-skills-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'pm-skills-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2600);
  }

  // --- UI: launcher + panel ----------------------------------------------
  function buildUI() {
    const launcher = document.createElement('button');
    launcher.id = 'pm-skills-launcher';
    launcher.type = 'button';
    launcher.title = 'Insert a PM Skill';
    launcher.innerHTML = '<span>🧠</span> Skills';
    document.body.appendChild(launcher);

    const panel = document.createElement('div');
    panel.id = 'pm-skills-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <div class="pm-panel-head">
        <strong>🧠 PM Skills</strong>
        <span class="pm-count"></span>
        <button class="pm-close" type="button" aria-label="Close">×</button>
      </div>
      <input class="pm-search" type="search" placeholder="Search skills… (PRD, launch, rubric, contract)" />
      <div class="pm-list"></div>
      <div class="pm-foot">Inserts the framework into the chat box. <a href="https://mohitagw15856.github.io/pm-claude-skills/" target="_blank" rel="noopener">Open the Playground ↗</a></div>`;
    document.body.appendChild(panel);

    const search = panel.querySelector('.pm-search');
    const list = panel.querySelector('.pm-list');
    const countEl = panel.querySelector('.pm-count');

    function render(q = '') {
      const term = q.trim().toLowerCase();
      const items = !term ? SKILLS : SKILLS.filter((s) =>
        (s.title + ' ' + s.description + ' ' + (s.plugin || '')).toLowerCase().includes(term));
      list.innerHTML = '';
      countEl.textContent = `${SKILLS.length} skills`;
      if (!items.length) { list.innerHTML = '<div class="pm-empty">No match.</div>'; return; }
      for (const s of items.slice(0, 60)) {
        const row = document.createElement('button');
        row.className = 'pm-row';
        row.type = 'button';
        row.innerHTML = `<span class="pm-title">${esc(s.title)}</span>
          <span class="pm-bundle">${esc((s.plugin || '').replace('pm-', ''))}</span>
          <span class="pm-desc">${esc(s.description || '')}</span>`;
        row.addEventListener('click', () => {
          insertSkill(s.instructions || s.description || '');
          close();
        });
        list.appendChild(row);
      }
    }

    function open() { panel.hidden = false; search.value = ''; render(); search.focus(); }
    function close() { panel.hidden = true; }
    launcher.addEventListener('click', () => (panel.hidden ? open() : close()));
    panel.querySelector('.pm-close').addEventListener('click', close);
    search.addEventListener('input', () => render(search.value));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    document.addEventListener('click', (e) => {
      if (!panel.hidden && !panel.contains(e.target) && e.target !== launcher && !launcher.contains(e.target)) close();
    });
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  // --- load bundled skills then build UI ----------------------------------
  fetch(chrome.runtime.getURL('skills.json'))
    .then((r) => r.json())
    .then((data) => {
      const arr = Array.isArray(data) ? data : (data.skills || []);
      SKILLS = arr.filter((s) => s && s.title).sort((a, b) => a.title.localeCompare(b.title));
      buildUI();
    })
    .catch((e) => console.warn('PM Skills: failed to load skills.json', e));
})();
