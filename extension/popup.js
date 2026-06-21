// Show the live skill count in the popup from the bundled snapshot.
fetch(chrome.runtime.getURL('skills.json'))
  .then((r) => r.json())
  .then((data) => {
    const arr = Array.isArray(data) ? data : (data.skills || []);
    const n = arr.filter((s) => s && s.title).length;
    if (n) document.getElementById('count').textContent = n;
  })
  .catch(() => {});
