// ═══════════════════════════════════════════
// DATA ENTRY — Form, calc, save
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// FORMULA
// ═══════════════════════════════════════════
// ── DYNAMIC BAG ROWS ──
var currentBagCount = 1;
const MAX_BAGS = 7;
const BAG_SFXS = ['','_2','_3','_4','_5','_6','_7'];

function grpOptsHtml() {
  return '<option value="">-- ជ្រើស --</option><option>A Pos</option><option>A Neg</option><option>B Pos</option><option>B Neg</option><option>O Pos</option><option>O Neg</option><option>AB Pos</option><option>AB Neg</option>';
}
function typeOptsHtml() {
  return '<option value="">-- ជ្រើស --</option><option value="WB">WB</option><option value="RC">RC</option><option value="PL">PL</option><option value="FFP">FFP</option>';
}

function addBagRow() {
  if (currentBagCount >= MAX_BAGS) return;
  currentBagCount++;
  const n   = currentBagCount;
  const sfx = '_' + n;
  const ph  = 'e.g. 2026' + (1233 + n);

  const div = document.createElement('div');
  div.className = 'bag-row';
  div.id = 'bagrow' + sfx;
  div.style.marginTop = '10px';
  div.innerHTML = `
    <div class="bag-row-title">
      <span>${n}</span>
      Bag ${n}
      <button type="button" onclick="removeSingleBag('${sfx}')"
        style="margin-left:auto;padding:3px 10px;border:1.5px solid var(--border);border-radius:6px;background:white;color:var(--muted);font-size:12px;cursor:pointer">✕</button>
    </div>
    <div class="fg" style="grid-template-columns:1fr 140px 1fr 1fr 1fr 1fr 1fr 1fr;gap:14px;align-items:end">
      <div class="fld"><label>📋 លេខកូដ</label><input type="text" id="f_blood_code${sfx}" placeholder="${ph}"></div>
      <div class="fld">
        <label style="color:var(--green)">✅ យកប្រើរួច</label>
        <label style="display:flex;align-items:center;gap:8px;border:2px solid var(--border);border-radius:9px;padding:10px 14px;cursor:pointer;background:white;transition:all .15s;font-size:14px;font-weight:700"
               id="lbl_used${sfx}"
               onmouseenter="this.style.borderColor='var(--green)'"
               onmouseleave="this.style.borderColor=document.getElementById('f_bag_used${sfx}').checked?'var(--green)':'var(--border)'">
          <input type="checkbox" id="f_bag_used${sfx}" style="accent-color:var(--green);width:17px;height:17px" onchange="bagUsedChange(this,'${sfx}')">
          <span id="span_used${sfx}" style="font-size:14px;font-weight:700">យកប្រើ</span>
        </label>
      </div>
      <div class="fld">
        <label style="color:var(--red)">🔄 វិលចូលស្តុក</label>
        <label style="display:flex;align-items:center;gap:8px;border:2px solid var(--border);border-radius:9px;padding:10px 14px;cursor:pointer;background:white;transition:all .15s;font-size:14px;font-weight:700"
               id="lbl_back${sfx}"
               onmouseenter="this.style.borderColor='var(--red)'"
               onmouseleave="this.style.borderColor=document.getElementById('f_bag_back${sfx}').checked?'var(--red)':'var(--border)'">
          <input type="checkbox" id="f_bag_back${sfx}" style="accent-color:var(--red);width:17px;height:17px" onchange="bagBackChange(this,'${sfx}')">
          <span id="span_back${sfx}" style="font-size:14px;font-weight:700">វិលស្តុក</span>
        </label>
      </div>
      <div class="fld"><label>🩸 Group / Rh</label><select id="f_group${sfx}">${grpOptsHtml()}</select></div>
      <div class="fld"><label>💉 ប្រភេទ</label><select id="f_blood_type${sfx}">${typeOptsHtml()}</select></div>
      <div class="fld"><label>📅 ថ្ងៃផុត</label><input type="date" id="f_blood_exp${sfx}"></div>
      <div class="fld"><label>👤 អ្នកយកប្រើ</label><input type="text" id="f_bag_taker${sfx}" placeholder="ឈ្មោះ..."></div>
      <div class="fld"><label>🕐 ថ្ងៃ ម៉ោង យក</label><input type="datetime-local" id="f_bag_taken_dt${sfx}"></div>
      <div class="fld"><label>🧑‍⚕️ បុគ្គលិក-Lab</label><select id="f_bag_lab_staff${sfx}" style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;font-weight:600;width:100%;font-family:JetBrains Mono,monospace;cursor:pointer;outline:none;transition:border-color .2s"><option value="">-- ជ្រើស --</option><option value="SMH">SMH</option><option value="SLS">SLS</option><option value="NBT">NBT</option><option value="SPT">SPT</option><option value="SSD">SSD</option><option value="HSN">HSN</option><option value="CCT">CCT</option><option value="HSC">HSC</option><option value="KRN">KRN</option><option value="TSP">TSP</option><option value="HSP">HSP</option><option value="SSN">SSN</option><option value="EKP">EKP</option><option value="VVK">VVK</option><option value="SCL">SCL</option><option value="PVN">PVN</option><option value="YMR">YMR</option><option value="NSM">NSM</option><option value="THL">THL</option><option value="CSI">CSI</option><option value="DOD">DOD</option><option value="HCY">HCY</option><option value="LST">LST</option><option value="DSP">DSP</option><option value="VCN">VCN</option><option value="LSN">LSN</option><option value="KNT">KNT</option><option value="YKN">YKN</option><option value="TEL">TEL</option><option value="CSR">CSR</option><option value="SML">SML</option><option value="ECP">ECP</option></select></div>
    </div>`;

  // Add back_fields div INSIDE this bag
  const bfDiv = document.createElement('div');
  bfDiv.id = 'back_fields' + sfx;
  bfDiv.style.cssText = 'display:none;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:10px;padding:14px 16px;background:var(--red3);border:1.5px solid var(--red);border-radius:12px;animation:slideDown .2s ease';
  bfDiv.innerHTML = `
    <div class="fld">
      <label style="color:var(--red)">👤 អ្នកអោយកាត់</label>
      <input type="text" id="f_back_giver${sfx}" placeholder="ឈ្មោះ..."
        style="border:2px solid var(--red);border-radius:9px;padding:10px 13px;font-size:14px;font-family:Noto Sans Khmer,sans-serif;width:100%;outline:none;background:white">
    </div>
    <div class="fld">
      <label style="color:var(--red)">🕐 ថ្ងៃ ម៉ោង វិល</label>
      <div style="display:flex;gap:6px">
        <input type="date" id="f_back_date${sfx}" style="flex:1.2;border:2px solid var(--red);border-radius:9px;padding:10px 8px;font-size:12px;outline:none;background:white">
        <input type="time" id="f_back_time${sfx}" style="flex:1;border:2px solid var(--red);border-radius:9px;padding:10px 8px;font-size:12px;font-family:JetBrains Mono,monospace;outline:none;background:white">
      </div>
    </div>
    <div class="fld">
      <label style="color:var(--red)">🧑‍⚕️ បុគ្គលិក Lab</label>
      <select id="f_back_lab${sfx}" style="border:2px solid var(--red);border-radius:9px;padding:10px 13px;font-size:14px;font-family:JetBrains Mono,monospace;font-weight:600;width:100%;outline:none;cursor:pointer;background:white"><option value="">-- ជ្រើស --</option><option value="SMH">SMH</option><option value="SLS">SLS</option><option value="NBT">NBT</option><option value="SPT">SPT</option><option value="SSD">SSD</option><option value="HSN">HSN</option><option value="CCT">CCT</option><option value="HSC">HSC</option><option value="KRN">KRN</option><option value="TSP">TSP</option><option value="HSP">HSP</option><option value="SSN">SSN</option><option value="EKP">EKP</option><option value="VVK">VVK</option><option value="SCL">SCL</option><option value="PVN">PVN</option><option value="YMR">YMR</option><option value="NSM">NSM</option><option value="THL">THL</option><option value="CSI">CSI</option><option value="DOD">DOD</option><option value="HCY">HCY</option><option value="LST">LST</option><option value="DSP">DSP</option><option value="VCN">VCN</option><option value="LSN">LSN</option><option value="KNT">KNT</option><option value="YKN">YKN</option><option value="TEL">TEL</option><option value="CSR">CSR</option><option value="SML">SML</option><option value="ECP">ECP</option></select>
    </div>
    <div class="fld">
      <label style="color:var(--red)">📝 មូលហេតុ</label>
      <input type="text" id="f_back_reason${sfx}" placeholder="មូលហេតុ..."
        style="border:2px solid var(--red);border-radius:9px;padding:10px 13px;font-size:14px;font-family:Noto Sans Khmer,sans-serif;width:100%;outline:none;background:white">
    </div>`;
  // Insert back_fields INSIDE the bag div
  div.appendChild(bfDiv);

  document.getElementById('bagContainer').appendChild(div);
  updateBagUI();
}

function removeSingleBag(sfx) {
  const el = document.getElementById('bagrow' + sfx);
  if (el) {
    el.remove();
    currentBagCount--;
    updateBagUI();
    bagUsedChange({checked: false}, sfx); // recount used
  }
}

function removeBagRow() {
  if (currentBagCount <= 1) return;
  const sfx = '_' + currentBagCount;
  const el = document.getElementById('bagrow' + sfx);
  if (el) el.remove();
  currentBagCount--;
  updateBagUI();
}

function updateBagUI() {
  const addBtn    = document.getElementById('btnAddBag');
  const removeBtn = document.getElementById('btnRemoveBag');
  const label     = document.getElementById('bagCountLabel');
  if (label)     label.textContent = 'Bag ' + currentBagCount + ' / ' + MAX_BAGS;
  if (addBtn)    addBtn.style.opacity = currentBagCount >= MAX_BAGS ? '0.4' : '1';
  if (removeBtn) removeBtn.style.display = currentBagCount > 1 ? 'inline-flex' : 'none';
}

// Reset bag rows to 1
function resetBagRows() {
  const container = document.getElementById('bagContainer');
  // Remove all except first bag
  const bags = container.querySelectorAll('.bag-row');
  bags.forEach((b, i) => { if (i > 0) b.remove(); });
  currentBagCount = 1;
  updateBagUI();
}

// Count checked
// ── NBTC Checkbox Change ──
function nbtcChange(chk) {
  const lbl  = document.getElementById('lbl_nbtc');
  const span = document.getElementById('span_nbtc');
  if (chk.checked) {
    if (lbl)  { lbl.style.borderColor='var(--blue)'; lbl.style.background='var(--blue2)'; }
    if (span) { span.textContent='✅ ឈាមមកពី NBTC (PL)'; span.style.color='var(--blue)'; }
  } else {
    if (lbl)  { lbl.style.borderColor='var(--border)'; lbl.style.background='white'; }
    if (span) { span.textContent='ឈាមមកពី NBTC (PL)'; span.style.color='inherit'; }
  }
}

// ── Data Entry: Cannot Return Change ──
function dataEntryCannotChange(chk) {
  const wrap     = document.getElementById('f_cannot_wrap');
  const span     = document.getElementById('f_cannot_span');
  const label    = document.getElementById('f_cannot_label');
  const reasonEl = document.getElementById('f_reason');
  const reasonLbl= document.getElementById('f_reason_label');

  if (chk.checked) {
    // ពុំអាចសង → zero out not_returned and given_count
    if (wrap)  { wrap.style.borderColor='var(--red)'; wrap.style.background='var(--red3)'; }
    if (span)  { span.textContent='⛔ ពុំអាចសង'; span.style.color='var(--red)'; }
    if (label) { label.style.color='var(--red)'; }
    // Set auto fields to 0
    const notRet = document.getElementById('f_not_returned');
    const givCnt = document.getElementById('f_given_count');
    if (notRet) { notRet.value = 0; notRet.style.color='var(--muted)'; }
    if (givCnt) { givCnt.value = 0; givCnt.style.color='var(--muted)'; }
    // Highlight reason as required
    // Re-run calc to enforce zeros
    calc();
    if (reasonEl)  { reasonEl.style.borderColor='var(--red)'; reasonEl.style.boxShadow='0 0 0 3px rgba(185,28,28,.08)'; reasonEl.placeholder='* សូមបំពេញមូលហេតុ...'; reasonEl.focus(); }
    if (reasonLbl) { reasonLbl.innerHTML='📝 មូលហេតុ <span style="color:var(--red);font-weight:900">* (ត្រូវបំពេញ)</span>'; reasonLbl.style.color='var(--red)'; }
  } else {
    // Unchecked → restore
    if (wrap)  { wrap.style.borderColor='var(--border)'; wrap.style.background='white'; }
    if (span)  { span.textContent='ពុំអាចសង'; span.style.color='inherit'; }
    if (label) { label.style.color=''; }
    // Recalc
    calc();
    const notRetR = document.getElementById('f_not_returned');
    const givCntR = document.getElementById('f_given_count');
    if (notRetR) notRetR.style.color='';
    if (givCntR) givCntR.style.color='';
    if (reasonEl)  { reasonEl.style.borderColor=''; reasonEl.style.boxShadow=''; reasonEl.placeholder='មូលហេតុ...'; }
    if (reasonLbl) { reasonLbl.innerHTML='📝 មូលហេតុ'; reasonLbl.style.color=''; }
  }
}

// ── Bag Back Stock Change ──
function bagBackChange(chk, sfx) {
  const lbl    = document.getElementById('lbl_back'    + sfx);
  const span   = document.getElementById('span_back'   + sfx);
  const row    = document.getElementById('bagrow'      + sfx);
  const fields = document.getElementById('back_fields' + sfx);

  if (chk.checked) {
    if (lbl)    { lbl.style.borderColor='var(--red)'; lbl.style.background='var(--red3)'; }
    if (span)   { span.textContent='🔄 វិលរួច'; span.style.color='var(--red)'; }
    if (row)    { row.style.borderColor='var(--red)'; }
    // Show extra fields
    if (fields) { fields.style.display='grid'; }
    // Uncheck "យកប្រើរួច" if checked
    const usedCb = document.getElementById('f_bag_used' + sfx);
    if (usedCb && usedCb.checked) {
      usedCb.checked = false;
      bagUsedChange(usedCb, sfx);
    }
    // Auto +1 to back_stock
    const bkEl = document.getElementById('f_back_stock');
    if (bkEl) { bkEl.value = (parseFloat(bkEl.value)||0) + 1; calc(); }
    // Focus on first field
    setTimeout(() => { document.getElementById('f_back_giver'+sfx)?.focus(); }, 100);
  } else {
    if (lbl)    { lbl.style.borderColor='var(--border)'; lbl.style.background='white'; }
    if (span)   { span.textContent='វិលស្តុក'; span.style.color='inherit'; }
    if (row)    { row.style.borderColor='var(--border)'; }
    // Hide extra fields
    if (fields) { fields.style.display='none'; }
    // Auto -1 from back_stock
    const bkEl = document.getElementById('f_back_stock');
    if (bkEl) { bkEl.value = Math.max(0,(parseFloat(bkEl.value)||0)-1); calc(); }
  }
}

// Count checked "យកប្រើរួច" boxes → update f_used
function bagUsedChange(chk, sfx) {
  // Style the label
  const lbl = document.getElementById('lbl_used' + sfx);
  const span = document.getElementById('span_used' + sfx);
  const row = document.getElementById('bagrow' + sfx);
  if (chk.checked) {
    lbl.style.borderColor = 'var(--green)';
    lbl.style.background  = 'var(--green2)';
    span.textContent = '✅ យកប្រើរួច';
    if (row) row.classList.add('bag-used-done');
  } else {
    lbl.style.borderColor = 'var(--border)';
    lbl.style.background  = 'white';
    span.textContent = 'យកប្រើ';
    if (row) row.classList.remove('bag-used-done');
  }
  // Count all checked bags → set f_used
  const sfxList = ['', '_2', '_3', '_4', '_5', '_6', '_7'];
  let usedCount = 0;
  sfxList.forEach(s => {
    const el = document.getElementById('f_bag_used' + s);
    if (el && el.checked) usedCount++;
  });
  document.getElementById('f_used').value = usedCount;
  calc();
}

// ── SN Auto Format ──
function formatSN(input) {
  // Remove "SN-" prefix if user typed it
  let val = input.value.replace(/^SN-/i, '').replace(/[^0-9A-Za-z]/g, '');
  input.value = val;
  // Show preview below input
  let preview = document.getElementById('sn_preview');
  if (!preview) {
    preview = document.createElement('div');
    preview.id = 'sn_preview';
    preview.style.cssText = 'font-size:12px;font-weight:800;color:#0369A1;font-family:JetBrains Mono,monospace;margin-top:4px;letter-spacing:1px;min-height:16px';
    input.closest('.fld').appendChild(preview);
  }
  preview.textContent = val ? '→ SN-' + val : '';
}

// Get formatted SN value
function getSNValue() {
  const val = document.getElementById('f_sn')?.value?.trim() || '';
  return val ? 'SN-' + val : '';
}

// ── Doctor Auto Format ──
function formatDoctor(input) {
  let val = input.value.replace(/^វេជ្ជ[- \s]*/u, '');
  input.value = val;
  // Show preview
  let preview = document.getElementById('doc_preview');
  if (!preview) {
    preview = document.createElement('div');
    preview.id = 'doc_preview';
    preview.style.cssText = 'font-size:12px;font-weight:800;color:#C2410C;font-family:Noto Sans Khmer,sans-serif;margin-top:4px;min-height:16px';
    input.closest('.fld').appendChild(preview);
  }
  preview.textContent = val ? '→ វេជ្ជ-' + val : '';
}

function getDoctorValue() {
  const val = document.getElementById('f_doctor_req')?.value?.trim() || '';
  return val ? 'វេជ្ជ-' + val : '';
}

function calc() {
  const xm  = parseFloat(document.getElementById('f_xmatch').value)     || 0;
  const us  = parseFloat(document.getElementById('f_used').value)        || 0;
  const bk  = parseFloat(document.getElementById('f_back_stock').value)  || 0;
  const ret = parseFloat(document.getElementById('f_return').value)      || 0;
  // ស្តុកផ្ញើ = X-Match − យកប្រើ − វិលចូលស្តុក
  document.getElementById('f_stock_sent').value   = Math.max(0, xm - us - bk);
  // នៅជំពាក់ = X-Match − វិលចូលស្តុក − សង
  // ពុំអាចសង → zero នៅជំពាក់ + មិនទាន់សង
  if (document.getElementById('f_cannot_return')?.checked) {
    document.getElementById('f_given_count').value  = 0;
    document.getElementById('f_not_returned').value = 0;
  } else {
    document.getElementById('f_given_count').value  = Math.max(0, xm - bk - ret);
    // មិនទាន់សង = X-Match − វិលចូលស្តុក − សង
    document.getElementById('f_not_returned').value = Math.max(0, xm - bk - ret);
  }
}

// ═══════════════════════════════════════════
// FORM READ / CLEAR
// ═══════════════════════════════════════════
function readForm() {
  const xm = parseFloat(document.getElementById('f_xmatch').value) || 0;
  const us  = parseFloat(document.getElementById('f_used').value)   || 0;
  return {
    sheet:         document.getElementById('daySelect').value,
    sn_code:       getSNValue(),
    date:          document.getElementById('f_date').value || null,
    hn:            v('f_hn'), name: v('f_name'), age: v('f_age'),
    gender:        document.querySelector('input[name="gender"]:checked')?.value || 'ប',
    ward_from:     v('f_ward_from'), ward_to: v('f_ward_to'), phone: v('f_phone'),
    doctor_req:    getDoctorValue(), diagnosis: v('f_diagnosis'),
    hb:            v('f_hb'), ht: v('f_ht'), blood_code: v('f_blood_code'),
    bag_used:   document.getElementById('f_bag_used')?.checked  ? 'yes' : '',
    bag_back:        document.getElementById('f_bag_back')?.checked   ? 'yes' : '',
    bag_back_giver:  (document.getElementById('f_bag_back')?.checked ? (document.getElementById('f_back_giver')?.value||'') : '') || null,
    bag_back_dt:     (document.getElementById('f_bag_back')?.checked ? ((document.getElementById('f_back_date')?.value||'') + ' ' + (document.getElementById('f_back_time')?.value||'')) : '') || null,
    bag_back_lab:    (document.getElementById('f_bag_back')?.checked ? (document.getElementById('f_back_lab')?.value||'') : '') || null,
    bag_back_reason: (document.getElementById('f_bag_back')?.checked ? (document.getElementById('f_back_reason')?.value||'') : '') || null,
    bag_back_2: document.getElementById('f_bag_back_2')?.checked ? 'yes' : '',
    bag_back_3: document.getElementById('f_bag_back_3')?.checked ? 'yes' : '',
    bag_back_4: document.getElementById('f_bag_back_4')?.checked ? 'yes' : '',
    bag_back_5: document.getElementById('f_bag_back_5')?.checked ? 'yes' : '',
    bag_back_6: document.getElementById('f_bag_back_6')?.checked ? 'yes' : '',
    bag_back_7: document.getElementById('f_bag_back_7')?.checked ? 'yes' : '',
    bag_used_2: document.getElementById('f_bag_used_2')?.checked ? 'yes' : '',
    bag_used_3: document.getElementById('f_bag_used_3')?.checked ? 'yes' : '',
    bag_used_4: document.getElementById('f_bag_used_4')?.checked ? 'yes' : '',
    bag_used_5: document.getElementById('f_bag_used_5')?.checked ? 'yes' : '',
    bag_used_6: document.getElementById('f_bag_used_6')?.checked ? 'yes' : '',
    bag_used_7: document.getElementById('f_bag_used_7')?.checked ? 'yes' : '',
    blood_code_2: v('f_blood_code_2'), blood_code_3: v('f_blood_code_3'),
    bag_taker:    v('f_bag_taker'),    bag_taken_dt:    v('f_bag_taken_dt'),    bag_lab_staff:    v('f_bag_lab_staff'),
    bag_taker_2:  v('f_bag_taker_2'),  bag_taken_dt_2:  v('f_bag_taken_dt_2'),  bag_lab_staff_2:  v('f_bag_lab_staff_2'),
    bag_taker_3:  v('f_bag_taker_3'),  bag_taken_dt_3:  v('f_bag_taken_dt_3'),  bag_lab_staff_3:  v('f_bag_lab_staff_3'),
    bag_taker_4:  v('f_bag_taker_4'),  bag_taken_dt_4:  v('f_bag_taken_dt_4'),  bag_lab_staff_4:  v('f_bag_lab_staff_4'),
    bag_taker_5:  v('f_bag_taker_5'),  bag_taken_dt_5:  v('f_bag_taken_dt_5'),  bag_lab_staff_5:  v('f_bag_lab_staff_5'),
    bag_taker_6:  v('f_bag_taker_6'),  bag_taken_dt_6:  v('f_bag_taken_dt_6'),  bag_lab_staff_6:  v('f_bag_lab_staff_6'),
    bag_taker_7:  v('f_bag_taker_7'),  bag_taken_dt_7:  v('f_bag_taken_dt_7'),  bag_lab_staff_7:  v('f_bag_lab_staff_7'),
    blood_code_4: v('f_blood_code_4'), blood_code_5: v('f_blood_code_5'),
    blood_code_6: v('f_blood_code_6'), blood_code_7: v('f_blood_code_7'),
    grp:           document.getElementById('f_group').value,
    grp_2: document.getElementById('f_group_2')?.value||null,
    grp_3: document.getElementById('f_group_3')?.value||null,
    grp_4: document.getElementById('f_group_4')?.value||null,
    grp_5: document.getElementById('f_group_5')?.value||null,
    grp_6: document.getElementById('f_group_6')?.value||null,
    grp_7: document.getElementById('f_group_7')?.value||null,
    blood_type:    document.getElementById('f_blood_type').value,
    blood_type_2: document.getElementById('f_blood_type_2')?.value||null,
    blood_type_3: document.getElementById('f_blood_type_3')?.value||null,
    blood_type_4: document.getElementById('f_blood_type_4')?.value||null,
    blood_type_5: document.getElementById('f_blood_type_5')?.value||null,
    blood_type_6: document.getElementById('f_blood_type_6')?.value||null,
    blood_type_7: document.getElementById('f_blood_type_7')?.value||null,
    blood_exp:     document.getElementById('f_blood_exp').value || null,
    blood_exp_2:  document.getElementById('f_blood_exp_2')?.value||null,
    blood_exp_3:  document.getElementById('f_blood_exp_3')?.value||null,
    blood_exp_4:  document.getElementById('f_blood_exp_4')?.value||null,
    blood_exp_5:  document.getElementById('f_blood_exp_5')?.value||null,
    blood_exp_6:  document.getElementById('f_blood_exp_6')?.value||null,
    blood_exp_7:  document.getElementById('f_blood_exp_7')?.value||null,
    xmatch:        v('f_xmatch'),
    xmatch_staff:  v('f_xmatch_staff'),
    xmatch_dt:     (() => { const d=document.getElementById('f_xmatch_date')?.value||''; const t=document.getElementById('f_xmatch_time')?.value||''; return d&&t?d+' '+t:(d||t||null); })(),
    nbtc:          document.getElementById('f_nbtc')?.checked ? 'yes' : '',
    s25:           document.getElementById('f_s25').checked  ? 'ok' : '',
    s37:           document.getElementById('f_s37').checked  ? 'ok' : '',
    anti:          document.getElementById('f_anti').checked ? 'ok' : '',
    come:          document.getElementById('f_come').checked ? 'ok' : '',
    qty_new:       v('f_new'), qty_borrow: v('f_borrow'), qty_return: v('f_return'),
    stock_sent:    Math.max(0, xm - us - (parseFloat(document.getElementById('f_back_stock').value) || 0)),
    qty_used:      v('f_used'), back_stock: v('f_back_stock'),
    doctor_out:    v('f_doctor_out'), checkin_dt: v('f_checkin_dt'),
    given_count:   document.getElementById('f_cannot_return')?.checked ? '0' : (document.getElementById('f_given_count')?.value || null),
    lab_person:    v('f_lab_person'),
    ward_recv:     v('f_ward_recv'), out_date:      (() => { const d = document.getElementById('f_out_date')?.value||''; const t = document.getElementById('f_out_time')?.value||''; return d&&t?d+' '+t:(d||t||null); })(),
    not_returned:  document.getElementById('f_cannot_return')?.checked ? '0' : Math.max(0, xm - (parseFloat(document.getElementById('f_back_stock').value)||0) - (parseFloat(document.getElementById('f_return').value)||0)),
    cannot_return: document.getElementById('f_cannot_return').checked ? 'ពុំអាច' : '',
    given_back:    v('f_given_back'), info_time: v('f_info_time'),
    info_recv:     v('f_info_recv'), reason: v('f_reason')
  };
}
function v(id) { return document.getElementById(id)?.value?.trim() || null; }

function clearForm() {
  ['f_sn','f_date','f_hn','f_name','f_age','f_ward_from','f_ward_to','f_phone','f_doctor_req',
   'f_diagnosis','f_hb','f_ht','f_blood_code','f_blood_exp','f_xmatch','f_new',
   'f_borrow','f_return','f_used','f_back_stock','f_doctor_out','f_checkin_dt',
   'f_given_count','f_lab_person','f_ward_recv','f_out_date','f_given_back',
   'f_info_time','f_info_recv','f_reason','f_stock_sent','f_not_returned',
   'f_blood_code_2','f_blood_code_3','f_blood_code_4','f_blood_code_5','f_blood_code_6','f_blood_code_7',
   'f_bag_taker','f_bag_taken_dt','f_bag_lab_staff',
   'f_bag_taker_2','f_bag_taken_dt_2','f_bag_lab_staff_2',
   'f_bag_taker_3','f_bag_taken_dt_3','f_bag_lab_staff_3',
   'f_bag_taker_4','f_bag_taken_dt_4','f_bag_lab_staff_4',
   'f_bag_taker_5','f_bag_taken_dt_5','f_bag_lab_staff_5',
   'f_bag_taker_6','f_bag_taken_dt_6','f_bag_lab_staff_6',
   'f_bag_taker_7','f_bag_taken_dt_7','f_bag_lab_staff_7',
   'f_blood_exp_2','f_blood_exp_3','f_blood_exp_4','f_blood_exp_5','f_blood_exp_6','f_blood_exp_7']
  .forEach(id => { const e = document.getElementById(id); if (e) e.value = ''; });
  ['f_s25','f_s37','f_anti','f_come','f_cannot_return'].forEach(id => {
    document.getElementById(id).checked = false;
  });
  // Reset select fields
  ['f_xmatch_staff','f_ward_from','f_ward_to'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  // Reset bag lab_staff selects
  ['','_2','_3','_4','_5','_6','_7'].forEach(s => {
    const el = document.getElementById('f_bag_lab_staff' + s);
    if (el) el.value = '';
    const el2 = document.getElementById('f_back_lab' + s);
    if (el2) el2.value = '';
  });
  // Reset cannot_return UI
  dataEntryCannotChange({checked: false});
  // Reset NBTC
  const nbtcEl = document.getElementById('f_nbtc');
  if (nbtcEl) { nbtcEl.checked = false; nbtcChange(nbtcEl); }
  document.getElementById('f_group').value = '';
  document.getElementById('f_blood_type').value = '';
  [2,3,4,5,6,7].forEach(n => {
    const g = document.getElementById('f_group_'+n); if(g) g.value='';
    const t = document.getElementById('f_blood_type_'+n); if(t) t.value='';
  });
  // Reset bag_used checkboxes
  ['','_2','_3','_4','_5','_6','_7'].forEach(s => {
    const cb = document.getElementById('f_bag_used'+s);
    if (cb) { cb.checked = false; bagUsedChange(cb, s); }
    const cb2 = document.getElementById('f_bag_back'+s);
    if (cb2) { cb2.checked = false; bagBackChange(cb2, s); }
    // Clear back fields
    ['f_back_giver','f_back_date','f_back_time','f_back_lab','f_back_reason'].forEach(fid => {
      const el = document.getElementById(fid + s); if (el) el.value = '';
    });
  });
  document.querySelector('input[name="gender"][value="ប"]').checked = true;
  document.getElementById('f_date').value = new Date().toISOString().split('T')[0];
  resetBagRows();
}

// ═══════════════════════════════════════════
// SAVE RECORD
// ═══════════════════════════════════════════
async function saveRecord() {
  const rec = readForm();
  if (!rec.hn && !rec.name) { showToast('⚠️ សូមបញ្ចូល HN ឬ ឈ្មោះ', 'err'); return false; }
  // Validate: cannot_return requires reason
  if (document.getElementById('f_cannot_return')?.checked && !rec.reason?.trim()) {
    const r = document.getElementById('f_reason');
    if (r) { r.style.borderColor='var(--red)'; r.style.boxShadow='0 0 0 3px rgba(185,28,28,.12)'; r.focus(); }
    showToast('⚠️ សូមបំពេញ មូលហេតុ ព្រោះ tick ពុំអាចសង!', 'err');
    return false;
  }

  setBtnLoading('btn1', true);
  setBtnLoading('btnSave', true);
  try {
    await sbInsert(rec);
    showToast('✅ Saved to Supabase!', 'ok');
    return true;
  } catch(e) {
    showToast('❌ Error: ' + e.message, 'err'); return false;
  } finally {
    setBtnLoading('btn1', false);
    setBtnLoading('btnSave', false);
  }
}

async function saveAndNew() {
  const ok = await saveRecord();
  if (ok) clearForm();
}

function setBtnLoading(id, on) {
  const el = document.getElementById(id);
  if (!el) return;
  if (on) { el._orig = el.innerHTML; el.innerHTML = '<span class="spinner"></span> Saving...'; el.disabled = true; }
  else    { el.innerHTML = el._orig || el.innerHTML; el.disabled = false; }
}
