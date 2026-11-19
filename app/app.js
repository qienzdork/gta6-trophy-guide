// Leonida Ledger — GTA VI PS5 trophy guide & tracker.
// Offline static app: loads app/data/trophies.json, keeps the checklist in
// localStorage, and never talks to the network. Written fresh for this entry.
const DATA_URL = 'data/trophies.json';
const STORE_KEY = 'leonida-ledger-v1';

const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

const state = {
  trophies: [],
  earned: new Set(),
  spoiler: false,
  openId: null,
  view: 'guide',
  search: '',
  kind: '',
  grade: '',
  status: '',
  sort: 'list',
};

const $ = (sel) => document.querySelector(sel);

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.earned)) state.earned = new Set(saved.earned);
    if (typeof saved.spoiler === 'boolean') state.spoiler = saved.spoiler;
  } catch {
    // A corrupt save is ignored; the checklist just starts empty.
  }
}

function saveStore() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      earned: [...state.earned],
      spoiler: state.spoiler,
    }));
  } catch {
    // Private mode can refuse localStorage; the page still works in-memory.
  }
}

async function loadData() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error('trophy data failed to load');
  const data = await res.json();
  state.trophies = data.trophies;
  return data;
}

function gradeLabel(t) {
  return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
}

function kindLabel(kind) {
  const labels = {
    platinum: 'Platinum', story: 'Story', side: 'Side stories',
    robbery: 'Robbery', activity: 'Activities', collectible: 'Collectibles',
    combat: 'Combat & hidden moments', completion: '100% completion',
  };
  return labels[kind] ?? kind;
}

function renderProgress() {
  const earned = state.trophies.filter((t) => state.earned.has(t.id));
  const gs = earned.reduce((sum, t) => sum + t.gamerscore, 0);
  $('#progress-count').textContent = `${earned.length} / ${state.trophies.length} earned`;
  $('#progress-gs').textContent = `${gs.toLocaleString()} / 1,000 G`;
  $('#progress-fill').style.width = `${(earned.length / state.trophies.length) * 100}%`;
}

function trophyCard(t) {
  const card = document.createElement('article');
  card.className = 'trophy' + (state.earned.has(t.id) ? ' earned' : '') + (state.openId === t.id ? ' open' : '');
  card.dataset.id = t.id;

  const head = document.createElement('div');
  head.className = 'trophy-head';

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'trophy-check';
  check.checked = state.earned.has(t.id);
  check.setAttribute('aria-label', `Mark ${t.name} as earned`);
  check.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (check.checked) state.earned.add(t.id); else state.earned.delete(t.id);
    saveStore();
    renderProgress();
    renderList();
  });
  head.appendChild(check);

  const main = document.createElement('div');
  main.className = 'trophy-main';
  const name = document.createElement('div');
  name.className = 'trophy-name';
  name.textContent = t.name;
  main.appendChild(name);

  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  if (state.spoiler && t.hidden) {
    desc.textContent = 'Hidden trophy — turn off “Hide spoilers” to reveal the details.';
    desc.classList.add('spoiler-hidden');
  } else {
    desc.textContent = t.desc;
  }
  main.appendChild(desc);

  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  const grade = document.createElement('span');
  grade.className = `badge ${t.grade}`;
  grade.textContent = gradeLabel(t);
  meta.appendChild(grade);
  const gs = document.createElement('span');
  gs.className = 'badge gs';
  gs.textContent = `${t.gamerscore} G`;
  meta.appendChild(gs);
  if (t.hidden) {
    const hidden = document.createElement('span');
    hidden.className = 'badge hidden-t';
    hidden.textContent = 'Hidden';
    meta.appendChild(hidden);
  }
  const kind = document.createElement('span');
  kind.className = 'badge kind';
  kind.textContent = kindLabel(t.kind);
  meta.appendChild(kind);
  main.appendChild(meta);
  head.appendChild(main);

  head.addEventListener('click', () => {
    state.openId = state.openId === t.id ? null : t.id;
    renderList();
  });
  card.appendChild(head);

  const guide = document.createElement('p');
  guide.className = 'trophy-guide';
  if (state.spoiler && t.hidden) {
    guide.textContent = 'Hidden while spoilers are off.';
  } else {
    guide.textContent = t.guide;
  }
  card.appendChild(guide);
  return card;
}

function filteredTrophies() {
  const q = state.search.trim().toLowerCase();
  let list = state.trophies.filter((t) => {
    if (state.kind && t.kind !== state.kind) return false;
    if (state.grade && t.grade !== state.grade) return false;
    if (state.status === 'earned' && !state.earned.has(t.id)) return false;
    if (state.status === 'missing' && state.earned.has(t.id)) return false;
    if (q) {
      const hay = `${t.name} ${t.desc} ${t.guide}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  if (state.sort === 'grade') {
    list = [...list].sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.name.localeCompare(b.name));
  } else if (state.sort === 'name') {
    list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  }
  return list;
}

function renderList() {
  const list = filteredTrophies();
  const box = $('#trophy-list');
  box.innerHTML = '';
  for (const t of list) box.appendChild(trophyCard(t));
  $('#shown-count').textContent = `Showing ${list.length} of ${state.trophies.length} trophies`;
}

function showView(view) {
  state.view = view;
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === view);
  });
  document.querySelectorAll('.view').forEach((section) => {
    section.classList.toggle('active', section.id === `view-${view}`);
  });
}

function exportProgress() {
  const payload = {
    app: 'leonida-ledger',
    game: 'Grand Theft Auto VI',
    exported_at: new Date().toISOString(),
    earned: [...state.earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-ledger-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = new Set(state.trophies.map((t) => t.id));
      const earned = (Array.isArray(data.earned) ? data.earned : []).filter((id) => ids.has(id));
      state.earned = new Set(earned);
      saveStore();
      renderProgress();
      renderList();
    } catch {
      alert('That file is not a valid Leonida Ledger export.');
    }
  };
  reader.readAsText(file);
}

function bindControls() {
  $('#search').addEventListener('input', (ev) => { state.search = ev.target.value; renderList(); });
  $('#filter-kind').addEventListener('change', (ev) => { state.kind = ev.target.value; renderList(); });
  $('#filter-grade').addEventListener('change', (ev) => { state.grade = ev.target.value; renderList(); });
  $('#filter-status').addEventListener('change', (ev) => { state.status = ev.target.value; renderList(); });
  $('#sort').addEventListener('change', (ev) => { state.sort = ev.target.value; renderList(); });
  const spoiler = $('#spoiler');
  spoiler.checked = state.spoiler;
  spoiler.addEventListener('change', () => { state.spoiler = spoiler.checked; saveStore(); renderList(); });
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  });
  $('#export').addEventListener('click', exportProgress);
  $('#import').addEventListener('change', (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (file) importProgress(file);
    ev.target.value = '';
  });
  $('#reset').addEventListener('click', () => {
    if (confirm('Clear all earned trophies? This cannot be undone.')) {
      state.earned = new Set();
      saveStore();
      renderProgress();
      renderList();
    }
  });
}

function applyShotParams() {
  const params = new URLSearchParams(location.search);
  const view = params.get('view');
  if (view && ['guide', 'roadmap', 'missables', 'sources'].includes(view)) showView(view);
  const open = params.get('open');
  if (open && state.trophies.some((t) => t.id === open)) {
    state.openId = open;
    showView('guide');
  }
  if (params.get('spoiler') === '1') {
    state.spoiler = true;
    const box = $('#spoiler');
    if (box) box.checked = true;
  }
}

async function init() {
  loadStore();
  bindControls();
  try {
    await loadData();
  } catch (err) {
    $('#trophy-list').textContent = 'Could not load the trophy list. Serve the app over HTTP (node serve.ts) and reload.';
    window.__ledgerReady = true;
    return;
  }
  applyShotParams();
  renderProgress();
  renderList();
  window.__ledger = { state };
  window.__ledgerReady = true;
}

init();
