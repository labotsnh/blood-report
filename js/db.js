// ═══════════════════════════════════════════
// DB — Supabase API helpers & connection
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// SUPABASE API
// ═══════════════════════════════════════════
async function sbFetch(path, opts = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      'apikey': SB_KEY,
      'Authorization': `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': opts.prefer || 'return=representation',
      ...(opts.headers || {})
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.hint || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

async function sbSelect(filter = '') {
  return sbFetch(`${TABLE}?order=id.asc${filter ? '&' + filter : ''}&limit=10000`);
}

async function sbInsert(row) {
  return sbFetch(TABLE, { method: 'POST', body: JSON.stringify(row) });
}

async function sbUpdate(id, row) {
  return sbFetch(`${TABLE}?id=eq.${id}`, {
    method: 'PATCH', body: JSON.stringify(row), prefer: 'return=representation'
  });
}

async function sbDelete(id) {
  return sbFetch(`${TABLE}?id=eq.${id}`, { method: 'DELETE', prefer: 'return=minimal' });
}

async function sbCount() {
  const res = await fetch(`${SB_URL}/rest/v1/${TABLE}?select=count`, {
    headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Prefer': 'count=exact', 'Range-Unit': 'items', 'Range': '0-0' }
  });
  return parseInt(res.headers.get('content-range')?.split('/')[1] || '0');
}

// ═══════════════════════════════════════════
// CONNECT
// ═══════════════════════════════════════════
async function connectSupabase() {
  const url = document.getElementById('sb_url').value.trim().replace(/\/$/, '');
  const key = document.getElementById('sb_key').value.trim();
  const err  = document.getElementById('setupErr');
  const btn  = document.getElementById('connectBtn');

  if (!url || !key) { err.textContent = '⚠️ សូមបញ្ចូល URL និង Key'; err.style.display = 'block'; return; }

  btn.innerHTML = '<span class="spinner"></span> Connecting...';
  btn.disabled = true;
  err.style.display = 'none';

  SB_URL = url; SB_KEY = key;
  try {
    await sbCount();
    localStorage.setItem('sb_url', url);
    localStorage.setItem('sb_key', key);
    document.getElementById('setupOverlay').style.display = 'none';
    setDbStatus(true);
    showToast('✅ Connected to Supabase!', 'ok');
    loadRecords();
  } catch(e) {
    err.textContent = '❌ ' + e.message;
    err.style.display = 'block';
    btn.innerHTML = '🔌 ភ្ជាប់ Supabase';
    btn.disabled = false;
  }
}

function setDbStatus(on) {
  document.getElementById('dbDot').className = 'db-dot' + (on ? '' : ' off');
  document.getElementById('dbLabel').textContent = on ? 'Connected' : 'Disconnected';
}

function resetConnection() {
  if (!confirm('Reset Supabase connection?')) return;
  localStorage.removeItem('sb_url'); localStorage.removeItem('sb_key');
  location.reload();
}

// Auto-connect — hide setup if config hardcoded or saved
const isHardcoded = SB_CONFIG.url !== 'https://eafafsasgootmplemioi.supabase.co' && SB_CONFIG.key !== 'sb_publishable_REEKwClXZMQ6gFlw2zOnZw_m24PP9m5';
if (isHardcoded) {
  localStorage.setItem('sb_url', SB_URL);
  localStorage.setItem('sb_key', SB_KEY);
}
if (SB_URL && SB_URL !== 'https://eafafsasgootmplemioi.supabase.co' && SB_KEY) {
  document.getElementById('setupOverlay').style.display = 'none';
  setDbStatus(true);
}
