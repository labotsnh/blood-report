// ═══════════════════════════════════════════
// MAIN FILE — Load, render, filter, delete, export
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// LOAD & RENDER TABLE
// ═══════════════════════════════════════════
async function loadRecords() {
  document.getElementById('tableWrap').innerHTML = '<div class="empty"><div class="ei">⏳</div><p>Loading from Supabase...</p></div>';
  try {
    allRecs = await sbSelect();
    const sheets = [...new Set(allRecs.map(r => r.sheet))];
    document.getElementById('st-total').textContent = allRecs.length;
    document.getElementById('st-days').textContent  = sheets.length;
    buildChips(sheets);
    updateSpecialCounts();
    applyFilter();
  } catch(e) {
    setDbStatus(false);
    document.getElementById('tableWrap').innerHTML = `<div class="empty"><div class="ei">❌</div><p>Error: ${e.message}</p></div>`;
    showToast('❌ Cannot load: ' + e.message, 'err');
  }
}

function buildChips(sheets) {
  const bar = document.getElementById('dayBar'); bar.innerHTML = '';
  const all = document.createElement('div');
  all.className = 'dchip' + (activeDay === 'all' ? ' on' : '');
  all.textContent = 'ទាំងអស់ (' + allRecs.length + ')';
  all.onclick = () => { activeDay = 'all'; buildChips([...new Set(allRecs.map(r => r.sheet))]); applyFilter(); };
  bar.appendChild(all);
  sheets.sort().forEach(s => {
    const cnt = allRecs.filter(r => r.sheet === s).length;
    const c = document.createElement('div');
    c.className = 'dchip' + (activeDay === s ? ' on' : '');
    c.textContent = s + ' (' + cnt + ')';
    c.onclick = () => { activeDay = s; buildChips(sheets); applyFilter(); };
    bar.appendChild(c);
  });
}

var activeSpecial = ''; // 'sent' | 'jamphak' | 'notret' | ''

function updateSpecialCounts() {
  const sentCount    = allRecs.filter(r => parseFloat(r.stock_sent)   > 0).length;
  const jamphakCount = allRecs.filter(r => parseFloat(r.given_count)  > 0).length;
  const notretCount  = allRecs.filter(r => parseFloat(r.not_returned) > 0).length;
  const cannotCount = allRecs.filter(r => r.cannot_return === 'ពុំអាច' || r.cannot_return === 'yes').length;
  const cs = document.getElementById('cnt-sent');
  const cj = document.getElementById('cnt-jamphak');
  const cn = document.getElementById('cnt-notret');
  const cc = document.getElementById('cnt-cannot');
  if (cs) cs.textContent = sentCount;
  if (cj) cj.textContent = jamphakCount;
  if (cn) cn.textContent = notretCount;
  if (cc) cc.textContent = cannotCount;
}

function filterSpecial(type) {
  // Toggle
  if (activeSpecial === type) { activeSpecial = ''; }
  else { activeSpecial = type; }
  // Update button styles
  ['sent','jamphak','notret','cannot'].forEach(t => {
    const btn = document.getElementById('btn-filter-' + t);
    if (!btn) return;
    btn.className = 'filter-btn';
    if (activeSpecial === t) {
      if (t === 'sent')    btn.classList.add('active-gold');
      if (t === 'jamphak') btn.classList.add('active-orange');
      if (t === 'notret')  btn.classList.add('active-red');
      if (t === 'cannot')  btn.classList.add('active-red');
    }
  });
  applyFilter();
}

function clearSpecialFilter() {
  activeSpecial = '';
  ['sent','jamphak','notret','cannot'].forEach(t => {
    const btn = document.getElementById('btn-filter-' + t);
    if (btn) btn.className = 'filter-btn';
  });
  applyFilter();
}

function applyFilter() {
  const hn   = (document.getElementById('s-hn')?.value   || '').trim().toLowerCase();
  const wd   = (document.getElementById('s-ward')?.value || '').trim().toLowerCase();
  const dt   = (document.getElementById('s-date')?.value || '').trim();
  filtered = allRecs.filter(r => {
    if (activeDay !== 'all' && r.sheet !== activeDay) return false;
    if (hn && !String(r.hn        || '').toLowerCase().includes(hn)) return false;
    if (wd && !String(r.ward_from || '').toLowerCase().includes(wd)) return false;
    if (dt && !String(r.date      || '').includes(dt)) return false;
    // Special filters
    if (activeSpecial === 'sent'    && !(parseFloat(r.stock_sent)   > 0)) return false;
    if (activeSpecial === 'jamphak' && !(parseFloat(r.given_count)  > 0)) return false;
    if (activeSpecial === 'notret'  && !(parseFloat(r.not_returned) > 0)) return false;
    if (activeSpecial === 'cannot' && !(r.cannot_return === 'ពុំអាច' || r.cannot_return === 'yes')) return false;
    return true;
  });
  document.getElementById('st-filt').textContent = filtered.length;
  document.getElementById('st-show').textContent = Math.min(filtered.length, PER);
  updateSpecialCounts();
  curPage = 1;
  renderTable();
}

function clearSearch() {
  document.getElementById('s-hn').value   = '';
  document.getElementById('s-ward').value = '';
  document.getElementById('s-date').value = '';
  applyFilter();
}

const TCOLS = ['sn_code','date','hn','name','age','gender','ward_from','ward_to','doctor_req',
               'diagnosis','hb','grp','blood_type','xmatch','s25',
               'qty_new','qty_borrow','qty_return','stock_sent','qty_used','given_count',
               'not_returned','lab_person','ward_recv','reason'];
const THDRS = ['🏷️ SN','ថ្ងៃ','HN','ឈ្មោះ','អាយុ','ភេទ','ផ្នែកស្នើ','ទៅ','គ្រូពេទ្យ','Dx','Hb',
               'Group','ប្រភេទ','X-Match','25C',
               '🆕 ថ្មី','🔄 ខ្ចី','↩️ សង','📦 ស្តុកផ្ញើ','✅ យកប្រើ','⏳ នៅជំពាក់',
               '❗ មិនទាន់សង','Lab','WARD','មូលហេតុ'];

function renderTable() {
  const wrap = document.getElementById('tableWrap');
  const hn = (document.getElementById('s-hn')?.value   || '').trim().toLowerCase();
  const wd = (document.getElementById('s-ward')?.value || '').trim().toLowerCase();
  const dt = (document.getElementById('s-date')?.value || '').trim();

  if (!filtered.length) {
    wrap.innerHTML = `<div class="empty"><div class="ei">${allRecs.length ? '🔍' : '📋'}</div><p>${allRecs.length ? 'គ្មាន Record ត្រូវ Filter' : 'មិនទាន់មី Record<br><small>ចូល Data Entry ដើម្បីបញ្ចូល</small>'}</p></div>`;
    document.getElementById('pag').innerHTML = ''; return;
  }

  const tp = Math.ceil(filtered.length / PER);
  const st = (curPage - 1) * PER;
  const pg = filtered.slice(st, st + PER);
  document.getElementById('st-show').textContent = pg.length;

  let h = `<table><thead><tr><th>#</th>${THDRS.map(t => `<th>${t}</th>`).join('')}<th>Sheet</th><th>⚙</th></tr></thead><tbody>`;

  pg.forEach((r, i) => {
    const gi = st + i;
    const g = r.grp || '';
    const gc = g.includes('AB') ? 'AB' : g.includes('A') ? 'A' : g.includes('B') ? 'B' : g.includes('O') ? 'O' : 'm';
    const gB  = g ? `<span class="badge b${gc}">${g}</span>` : '-';
    const gnB = r.gender === 'ប' ? `<span class="badge bm">ប</span>` : `<span class="badge bf">ស</span>`;
    const okB = val => val ? `<span class="badge bok">✓</span>` : '-';
    const numR = val => (val !== null && val !== undefined && val !== '') ? `<b style="color:var(--red)">${val}</b>` : '-';
    const numG = val => (val !== null && val !== undefined && val !== '') ? `<b style="color:var(--gold)">${val}</b>` : '-';

    const cv = {
      sn_code: r.sn_code ? `<span style="font-family:JetBrains Mono,monospace;font-weight:800;color:#0369A1;background:#F0F9FF;padding:2px 8px;border-radius:6px;font-size:11px">${r.sn_code}</span>` : '-',
      date: r.date ? (dt ? hl(r.date, dt) : r.date) : '-',
      hn: r.hn ? (hn ? hl(r.hn, hn) : r.hn) : '-',
      name: r.name || '-', age: r.age || '-', gender: gnB,
      ward_from: r.ward_from ? (wd ? hl(r.ward_from, wd) : r.ward_from) : '-',
      ward_to: r.ward_to || '-', doctor_req: r.doctor_req ? `<span style="background:#FFF7ED;color:#C2410C;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;font-family:Noto Sans Khmer,sans-serif">${r.doctor_req}</span>` : '-',
      diagnosis: r.diagnosis || '-', hb: r.hb || '-',
      grp: gB, blood_type: r.blood_type || '-',
      xmatch: r.xmatch || '-', s25: okB(r.s25),
      qty_new:    r.qty_new    ? `<span class="td-badge td-blue">${r.qty_new}</span>`   : '-',
      qty_borrow: r.qty_borrow ? `<span class="td-badge td-purple">${r.qty_borrow}</span>` : '-',
      qty_return: r.qty_return ? `<span class="td-badge td-teal">${r.qty_return}</span>`  : '-',
      stock_sent:   (r.stock_sent!=null&&r.stock_sent!=='') ? `<span class="td-badge td-gold">${r.stock_sent}</span>` : '-',
      qty_used:     r.qty_used ? `<span class="td-badge td-green">${r.qty_used}</span>`  : '-',
      given_count:  (r.given_count!=null&&r.given_count!=='') ? `<span class="td-badge td-orange">${r.given_count}</span>` : '-',
      not_returned: (r.not_returned!=null&&r.not_returned!=='') ? `<span class="td-badge td-red">${r.not_returned}</span>` : '-',
      lab_person: r.lab_person || '-', ward_recv: r.ward_recv || '-', reason: r.reason || '-'
    };

    h += `<tr><td>${gi + 1}</td>`;
    TCOLS.forEach(k => h += `<td title="${String(cv[k]).replace(/<[^>]+>/g,'')||''}">${cv[k] ?? '-'}</td>`);
    h += `<td style="font-family:JetBrains Mono,monospace;font-size:10px;color:var(--muted)">${r.sheet}</td>`;
    h += `<td><div class="tbl-act"><button class="ib edit" onclick="openEdit(${gi})" title="Edit">✏️</button><button class="ib del" onclick="delRec(${r.id})" title="Delete">🗑</button></div></td></tr>`;
  });

  h += '</tbody></table>';
  wrap.innerHTML = h;
  renderPag(tp);
}

function hl(s, q) {
  return String(s).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), m => `<mark>${m}</mark>`);
}

function renderPag(tp) {
  const p = document.getElementById('pag');
  if (tp <= 1) { p.innerHTML = `<span>${filtered.length} records</span><span></span>`; return; }
  let h = `<span>Page ${curPage}/${tp} · ${filtered.length} records</span><div class="pag-btns">`;
  h += `<button class="pb" onclick="goPg(1)" ${curPage===1?'disabled':''}>«</button>`;
  h += `<button class="pb" onclick="goPg(${curPage-1})" ${curPage===1?'disabled':''}>‹</button>`;
  for (let i = Math.max(1, curPage-2); i <= Math.min(tp, curPage+2); i++)
    h += `<button class="pb ${i===curPage?'on':''}" onclick="goPg(${i})">${i}</button>`;
  h += `<button class="pb" onclick="goPg(${curPage+1})" ${curPage===tp?'disabled':''}>›</button>`;
  h += `<button class="pb" onclick="goPg(${tp})" ${curPage===tp?'disabled':''}>»</button></div>`;
  p.innerHTML = h;
}
function goPg(p) { curPage = p; renderTable(); }

// ═══════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════
async function delRec(id) {
  if (!confirm('Delete record ១ ក្បាល ពី Supabase?')) return;
  try {
    await sbDelete(id);
    showToast('🗑 Deleted', 'info');
    await loadRecords();
  } catch(e) { showToast('❌ ' + e.message, 'err'); }
}

// ═══════════════════════════════════════════
// EXPORT EXCEL
// ═══════════════════════════════════════════
function exportExcel() {
  const exportData = (filtered && filtered.length > 0) ? filtered : allRecs;
  if (!exportData.length) { showToast('គ្មាន records', 'err'); return; }

  const hn   = (document.getElementById('s-hn')?.value   || '').trim();
  const wd   = (document.getElementById('s-ward')?.value || '').trim();
  const dt   = (document.getElementById('s-date')?.value || '').trim();
  const isFiltered = hn || wd || dt || activeDay !== 'all' || activeSpecial;
  const label = isFiltered ? '_filtered' : '_all';

  const wb2 = XLSX.utils.book_new();

  // ── Header ──
  const hdr = [
    'No','Sheet','SN','ថ្ងៃ','HN','ឈ្មោះ','អាយុ','ភេទ',
    'ផ្នែកស្នើ','ទៅ','ទូរ','គ្រូពេទ្យស្នើ','Dx','Hb','Ht',
    // Per-bag fields
    'Bag No','លេខកូដ','Group/Rh','ប្រភេទ','ថ្ងៃផុត',
    'យកប្រើរួច','អ្នកយកប្រើ','ថ្ងៃ ម៉ោង យក','បុគ្គលិក-Lab',
    // X-Match
    'X-Match','បុគ្គលិក X-Match','ថ្ងៃ ម៉ោង X-Match','NBTC(PL)',
    '25C','37C','Anti.IGG','Come Chk',
    // Usage
    'ថ្មី','ខ្ចី','សង','ស្តុកផ្ញើ','យកប្រើ','នៅជំពាក់',
    // Return
    'មិនទាន់សង','ពុំអាចសង','ម៉ោងព័ត៌មាន','អ្នកទទួល','មូលហេតុ',
    // Checkin
    'គ្រូពេទ្យកាត់ចូល','ថ្ងៃ ម៉ោង កាត់ចូល','ចំនួននៅជំពាក់(ត្រ.)',
  ];

  const BAG_SFXS = ['','_2','_3','_4','_5','_6','_7'];
  const rows = [hdr];
  let globalNo = 1;

  exportData.forEach(r => {
    // Check which bags have data
    const activeBags = BAG_SFXS.filter(sfx =>
      r['blood_code'+sfx] || r['grp'+sfx] || r['blood_type'+sfx] || r['bag_used'+sfx]
    );
    const bagsToExport = activeBags.length > 0 ? activeBags : [''];

    bagsToExport.forEach((sfx, bi) => {
      const bagNo = BAG_SFXS.indexOf(sfx) + 1;
      const isFirst = bi === 0;

      rows.push([
        isFirst ? globalNo : '',                    // No (only first bag row)
        isFirst ? r.sheet : '',                     // Sheet
        isFirst ? (r.sn_code||'') : '',            // SN
        isFirst ? (r.date||'') : '',               // ថ្ងៃ
        isFirst ? (r.hn||'') : '',                 // HN
        isFirst ? (r.name||'') : '',               // ឈ្មោះ
        isFirst ? (r.age||'') : '',                // អាយុ
        isFirst ? (r.gender||'') : '',             // ភេទ
        isFirst ? (r.ward_from||'') : '',          // ផ្នែកស្នើ
        isFirst ? (r.ward_to||'') : '',            // ទៅ
        isFirst ? (r.phone||'') : '',              // ទូរ
        isFirst ? (r.doctor_req||'') : '',         // គ្រូពេទ្យ
        isFirst ? (r.diagnosis||'') : '',          // Dx
        isFirst ? (r.hb||'') : '',                // Hb
        isFirst ? (r.ht||'') : '',                // Ht
        // Per-bag
        bagNo,                                      // Bag No
        r['blood_code'+sfx] || '',                 // លេខកូដ
        r['grp'+sfx] || '',                        // Group
        r['blood_type'+sfx] || '',                 // ប្រភេទ
        r['blood_exp'+sfx] || '',                  // ថ្ងៃផុត
        r['bag_used'+sfx] === 'yes' ? 'yes' : '', // យកប្រើ
        r['bag_taker'+sfx] || '',                  // អ្នកយក
        r['bag_taken_dt'+sfx] || '',               // ថ្ងៃ ម៉ោង យក
        r['bag_lab_staff'+sfx] || '',              // Lab staff
        // X-Match (first bag only)
        isFirst ? (r.xmatch||'') : '',
        isFirst ? (r.xmatch_staff||'') : '',
        isFirst ? (r.xmatch_dt||'') : '',
        isFirst ? (r.nbtc||'') : '',
        isFirst ? (r.s25||'') : '',
        isFirst ? (r.s37||'') : '',
        isFirst ? (r.anti||'') : '',
        isFirst ? (r.come||'') : '',
        // Usage
        isFirst ? (r.qty_new||'') : '',
        isFirst ? (r.qty_borrow||'') : '',
        isFirst ? (r.qty_return||'') : '',
        isFirst ? (r.stock_sent??'') : '',
        isFirst ? (r.qty_used||'') : '',
        isFirst ? (r.given_count??'') : '',
        // Return
        isFirst ? (r.not_returned??'') : '',
        isFirst ? (r.cannot_return||'') : '',
        isFirst ? (r.info_time||'') : '',
        isFirst ? (r.info_recv||'') : '',
        isFirst ? (r.reason||'') : '',
        // Checkin
        isFirst ? (r.doctor_out||'') : '',
        isFirst ? (r.checkin_dt||'') : '',
        isFirst ? (r.given_back||'') : '',
      ]);
    });

    globalNo++;
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Style header row bold (basic)
  ws['!cols'] = hdr.map((h, i) => {
    // Make bag code column wider
    if (i === 16) return { wch: 18 }; // លេខកូដ
    if (i === 4)  return { wch: 14 }; // HN
    if (i === 5)  return { wch: 18 }; // ឈ្មោះ
    return { wch: 12 };
  });

  XLSX.utils.book_append_sheet(wb2, ws, 'Main File');

  // Also create per-sheet tabs
  const ds = {};
  exportData.forEach(r => { if (!ds[r.sheet]) ds[r.sheet] = []; ds[r.sheet].push(r); });

  const fname = 'blood_report_' + new Date().toISOString().slice(0,10) + label + '.xlsx';
  XLSX.writeFile(wb2, fname);
  showToast('⬇️ Exported ' + exportData.length + ' records · ' + (rows.length-1) + ' rows (per bag)', 'ok');
}
