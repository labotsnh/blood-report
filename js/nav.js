// ═══════════════════════════════════════════
// NAV — Page navigation & utilities
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const tabs = document.querySelectorAll('.nav-tab');
  if (id === 'pg-entry')  tabs[0].classList.add('active');
  if (id === 'pg-main')   { tabs[1].classList.add('active'); loadRecords(); }
  if (id === 'pg-import') tabs[2].classList.add('active');
}

// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
function showProg(on) {
  document.getElementById('progBar').style.display = on ? 'block' : 'none';
  if (on) { const f = document.getElementById('progFill'); f.style.width = '0%'; setTimeout(() => f.style.width = '30%', 50); }
}
var tt;
function showToast(m, t = 'info') {
  const el = document.getElementById('toast');
  el.textContent = m; el.className = `toast ${t} show`;
  clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 4000);
}

// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
// INIT
// ═══════════════════════════════════════════
// Force connect with embedded credentials
SB_URL = 'https://eafafsasgootmplemioi.supabase.co';
SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZmFmc2FzZ29vdG1wbGVtaW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NDE3NzcsImV4cCI6MjA5MjQxNzc3N30.r6t1MFr6qKSRM_lsLXmo5DtU4GvE9X0xqb4ImIzrcLg';
localStorage.setItem('sb_url', SB_URL);
localStorage.setItem('sb_key', SB_KEY);
const _ov = document.getElementById('setupOverlay');
if (_ov) _ov.style.display = 'none';
setDbStatus(true);
loadRecords();
document.getElementById('f_date').value = new Date().toISOString().split('T')[0];

// Auto-select current month
(function() {
  const monthNum = new Date().getMonth() + 1;
  const sel = document.getElementById('daySelect');
  if (!sel) return;
  for (let i = 0; i < sel.options.length; i++) {
    if (sel.options[i].value === 'Month ' + monthNum) {
      sel.selectedIndex = i;
      break;
    }
  }
})();
if (SB_URL && SB_URL !== 'https://eafafsasgootmplemioi.supabase.co' && SB_KEY) loadRecords();
});
