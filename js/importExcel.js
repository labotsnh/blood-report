// ═══════════════════════════════════════════
// IMPORT EXCEL
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// IMPORT EXCEL
// ═══════════════════════════════════════════
const ua = document.getElementById('uploadArea');
const fi = document.getElementById('fileInput');
ua.addEventListener('dragover', e => { e.preventDefault(); ua.classList.add('drag'); });
ua.addEventListener('dragleave', () => ua.classList.remove('drag'));
ua.addEventListener('drop', e => { e.preventDefault(); ua.classList.remove('drag'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
fi.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });

function handleFile(file) {
  if (!file.name.match(/\.(xlsx|xlsm|xls)$/i)) { showToast('⚠️ Excel files only', 'err'); return; }
  document.getElementById('fileTag').style.display = 'inline-flex';
  document.getElementById('fileTagName').textContent = file.name;
  document.getElementById('btnImport').disabled = false;
  showProg(true);
  const reader = new FileReader();
  reader.onload = e => {
    try {
      importWB = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
      const d = importWB.SheetNames.filter(n => n.toLowerCase().includes('day'));
      showProg(false); showToast(`📂 Loaded! ${d.length} day sheets`, 'ok');
    } catch(err) { showProg(false); showToast('❌ ' + err.message, 'err'); }
  };
  reader.readAsArrayBuffer(file);
}

async function importExcel() {
  if (!importWB) { showToast('Upload file ជាមុន!', 'err'); return; }
  const btn = document.getElementById('btnImport');
  btn._orig = btn.innerHTML; btn.innerHTML = '<span class="spinner"></span> Importing...'; btn.disabled = true;
  showProg(true);

  const days = importWB.SheetNames.filter(n => n.toLowerCase().includes('day'));
  let added = 0, batch = [];

  for (const sName of days) {
    const ws  = importWB.Sheets[sName];
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    for (let r = 2; r < raw.length; r++) {
      const row = raw[r]; if (!row) continue;
      const has = [1,2,3,4,5].some(c => { const vv = row[c]; return vv !== null && vv !== undefined && String(vv).trim() !== ''; });
      if (!has) continue;
      const xm = parseFloat(row[17]) || 0, us = parseFloat(row[26]) || 0;
      batch.push({
        sheet: sName, date: fv(row[1]), hn: fv(row[2]), name: fv(row[3]),
        age: fv(row[4]), gender: fv(row[5]) || 'ប', ward_from: fv(row[6]),
        ward_to: fv(row[7]), phone: fv(row[8]), doctor_req: fv(row[9]),
        diagnosis: fv(row[10]), hb: fv(row[11]), ht: fv(row[12]),
        blood_code: fv(row[13]), grp: fv(row[14]), blood_type: fv(row[15]),
        blood_exp: fv(row[16]), xmatch: fv(row[17]),
        s25: fv(row[18]), s37: fv(row[19]), anti: fv(row[20]), come: fv(row[21]),
        qty_new: fv(row[22]), qty_borrow: fv(row[23]), qty_return: fv(row[24]),
        stock_sent: xm - us, qty_used: fv(row[26]), back_stock: fv(row[27]),
        doctor_out: fv(row[28]), checkin_dt: fv(row[29]), given_count: fv(row[30]),
        lab_person: fv(row[31]), ward_recv: fv(row[32]), out_date: fv(row[33]),
        not_returned: xm - us, cannot_return: null, given_back: fv(row[36]),
        info_time: fv(row[37]), info_recv: fv(row[38]), reason: fv(row[39])
      });
      added++;
    }
  }

  // Batch insert in chunks of 100
  try {
    const CHUNK = 100;
    for (let i = 0; i < batch.length; i += CHUNK) {
      await sbInsert(batch.slice(i, i + CHUNK));
      const pct = Math.round(((i + CHUNK) / batch.length) * 100);
      document.getElementById('progFill').style.width = Math.min(pct, 100) + '%';
    }
    showProg(false);
    const res = document.getElementById('importResult');
    res.style.display = 'block';
    res.textContent = `✅ Import ជោគជ័យ! បានបញ្ចូល ${added} records ពី ${days.length} day sheets ទៅ Supabase`;
    showToast(`✅ Imported ${added} records!`, 'ok');
  } catch(e) {
    showProg(false); showToast('❌ Import error: ' + e.message, 'err');
  } finally {
    btn.innerHTML = btn._orig; btn.disabled = false;
  }
}

function fv(vv) {
  if (vv === null || vv === undefined) return null;
  if (vv instanceof Date) return vv.toISOString().split('T')[0];
  const s = String(vv).trim();
  return s === '' ? null : s;
}
