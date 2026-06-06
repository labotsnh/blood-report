// ═══════════════════════════════════════════
// INIT — App initialization
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  // Hide setup overlay
  const ov = document.getElementById('setupOverlay');
  if (ov) ov.style.display = 'none';
  setDbStatus(true);

  // Set today's date
  const fd = document.getElementById('f_date');
  if (fd) fd.value = new Date().toISOString().split('T')[0];

  // Auto-select current month
  (function() {
    const monthNum = new Date().getMonth() + 1;
    const sel = document.getElementById('daySelect');
    if (!sel) return;
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === 'Month ' + monthNum) { sel.selectedIndex = i; break; }
    }
  })();

  loadRecords();
});
