// ═══════════════════════════════════════════
// EDIT RECORD — Edit modal logic
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// EDIT
// ═══════════════════════════════════════════
function openEdit(i) {
  const r = filtered[i]; editId = r.id;
  document.getElementById('editSub').textContent = 'ID: ' + r.id + ' · HN: ' + (r.hn || '—') + ' · ' + (r.name || '—');
  document.getElementById('editBody').innerHTML = buildEditForm(r);
  document.getElementById('editModal').classList.add('open');
  // Recalc auto fields after modal opens
  setTimeout(() => editCalc(), 50);
}

function ef(k, l, t, val) {
  return `<div class="fld"><label>${l}</label><input type="${t}" data-key="${k}" value="${eH(String(val ?? ''))}" style="border:1.5px solid var(--border);border-radius:8px;padding:9px 12px;font-size:13px;width:100%;font-family:Noto Sans Khmer,sans-serif;outline:none;transition:border-color .2s" onfocus="this.style.borderColor='var(--red)'" onblur="this.style.borderColor='var(--border)'"></div>`;
}
function esel(k, l, opts, val) {
  return `<div class="fld"><label>${l}</label><select data-key="${k}" style="border:1.5px solid var(--border);border-radius:8px;padding:9px 12px;font-size:13px;width:100%;font-family:Noto Sans Khmer,sans-serif;cursor:pointer;outline:none">${opts.map(o => `<option ${o===val?'selected':''}>${o}</option>`).join('')}</select></div>`;
}
function eH(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }

function buildEditForm(r) {
  function einp(key, label, type, val, extra='') {
    return `<div class="fld">
      <label>${label}</label>
      <input type="${type}" data-key="${key}" value="${eH(String(val??''))}"
        style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;font-weight:500;width:100%;font-family:Noto Sans Khmer,sans-serif;outline:none;transition:border-color .2s"
        onfocus="this.style.borderColor='var(--red)'" onblur="this.style.borderColor='var(--border)'" ${extra}>
    </div>`;
  }
  function esel(key, label, opts_html) {
    return `<div class="fld">
      <label>${label}</label>
      <select data-key="${key}"
        style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;font-weight:500;width:100%;font-family:Noto Sans Khmer,sans-serif;cursor:pointer;outline:none;transition:border-color .2s"
        onfocus="this.style.borderColor='var(--red)'" onblur="this.style.borderColor='var(--border)'">
        ${opts_html}
      </select>
    </div>`;
  }
  function staffOpts(v) {
    const list = ['','SMH','SLS','NBT','SPT','SSD','HSN','CCT','HSC','KRN','TSP','HSP','SSN','EKP','VVK','SCL','PVN','YMR','NSM','THL','CSI','DOD','HCY','LST','DSP','VCN','LSN','KNT','YKN','TEL','CSR','SML','ECP'];
    return list.map(s=>`<option value="${s}" ${s===(v||'')?'selected':''}>${s||'-- ជ្រើស --'}</option>`).join('');
  }
  function grpOpts(v) {
    return ['','A Pos','A Neg','B Pos','B Neg','O Pos','O Neg','AB Pos','AB Neg']
      .map(o=>`<option value="${o}" ${o===(v||'')?'selected':''}>${o||'-- ជ្រើស --'}</option>`).join('');
  }
  function wardOpts(v) {
    return ['','ED','DMID','MICU','OBGY','SICU','SUR','PED','ANES']
      .map(o=>`<option value="${o}" ${o===(v||'')?'selected':''}>${o||'-- ជ្រើស --'}</option>`).join('');
  }
  function typeOpts(v) {
    return [['','-- ជ្រើស --'],['WB','WB'],['RC','RC'],['PL','PL'],['FFP','FFP']]
      .map(([val,lbl])=>`<option value="${val}" ${val===(v||'')?'selected':''}>${lbl}</option>`).join('');
  }
  function secDiv(icon, label, color) {
    return `<div style="display:flex;align-items:center;gap:12px;margin:20px 0 14px">
      <span style="padding:5px 16px;border-radius:20px;font-size:12px;font-weight:800;color:white;background:${color};white-space:nowrap">${icon} ${label}</span>
      <div style="flex:1;height:1.5px;background:var(--border)"></div>
    </div>`;
  }
  function autoField(key, label, color, val) {
    return `<div class="fld">
      <label style="color:${color}">${label} 🔢</label>
      <div style="display:flex;border:2px solid ${color};border-radius:9px;overflow:hidden;background:${color}22">
        <input type="number" data-key="${key}" value="${val??''}" id="edit_${key}"
          style="border:none;outline:none;flex:1;padding:11px 14px;font-size:15px;font-weight:900;color:${color};background:transparent;font-family:JetBrains Mono,monospace">
        <span style="background:${color}22;border-left:1.5px solid ${color};padding:11px 12px;font-size:11px;font-weight:700;color:${color};display:flex;align-items:center;font-family:JetBrains Mono,monospace">auto</span>
      </div>
    </div>`;
  }

  // ── Build bag rows: only show bags that have data, always show at least Bag 1 ──
  const bagSfxs = ['','_2','_3','_4','_5','_6','_7'];
  function bagHasData(sfx) {
    return !!(r['blood_code'+sfx] || r['grp'+sfx] || r['blood_type'+sfx] || r['blood_exp'+sfx] || r['bag_used'+sfx]);
  }

  // Determine which bags to show
  let editBagCount = 1;
  bagSfxs.forEach((sfx, i) => { if (i > 0 && bagHasData(sfx)) editBagCount = i + 1; });

  function makeBagRowEdit(sfx, n) {
    const code    = r['blood_code'+sfx] || '';
    const grp     = r['grp'+sfx] || '';
    const btype   = r['blood_type'+sfx] || '';
    const bexp    = r['blood_exp'+sfx] || '';
    const taker   = r['bag_taker'+sfx] || '';
    const takenDt = r['bag_taken_dt'+sfx] || '';
    const used    = r['bag_used'+sfx] === 'yes';
    const title   = n === 1 ? 'Bag 1 (ដំបូង)' : `Bag ${n}`;
    const bgStyle = used ? 'background:#F0FDF4;border-color:var(--green)' : '';

    return `<div class="bag-row" id="edit_bagrow${sfx}" style="${bgStyle}">
      <div class="bag-row-title">
        <span style="background:var(--red);color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;flex-shrink:0">${n}</span>
        ${title}
        ${n > 1 ? `<button type="button" onclick="editRemoveBag('${sfx}')"
          style="margin-left:auto;padding:3px 10px;border:1.5px solid var(--border);border-radius:6px;background:white;color:var(--muted);font-size:12px;cursor:pointer;font-weight:600">✕ លុប</button>` : ''}
      </div>
      <div style="display:grid;grid-template-columns:1.8fr 140px 1fr 1fr 1fr 1fr 1fr 1fr;gap:12px;align-items:end">
        <div class="fld"><label>📋 លេខកូដ</label>
          <input type="text" data-key="blood_code${sfx}" value="${eH(code)}"
            style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:15px;font-weight:800;width:100%;font-family:JetBrains Mono,monospace;outline:none;letter-spacing:.5px"
            onfocus="this.style.borderColor='var(--red)'" onblur="this.style.borderColor='var(--border)'">
        </div>
        <div class="fld">
          <label style="color:var(--green)">✅ យកប្រើរួច</label>
          <label id="edit_lbl_used${sfx}"
            style="display:flex;align-items:center;gap:8px;border:2px solid ${used?'var(--green)':'var(--border)'};border-radius:9px;padding:10px 14px;cursor:pointer;background:${used?'var(--green2)':'white'};transition:all .15s;font-size:14px;font-weight:700"
            onmouseenter="this.style.borderColor='var(--green)'"
            onmouseleave="if(!document.getElementById('edit_bag_used${sfx}').checked)this.style.borderColor='var(--border)'">
            <input type="checkbox" id="edit_bag_used${sfx}" data-key="bag_used${sfx}"
              ${used?'checked':''}
              style="accent-color:var(--green);width:17px;height:17px"
              onchange="editBagUsedChange(this,'${sfx}')">
            <span id="edit_span_used${sfx}" style="font-size:14px;font-weight:700">${used?'✅ យកប្រើរួច':'យកប្រើ'}</span>
          </label>
        </div>
        <div class="fld">
          <label style="color:var(--red)">🔄 វិលចូលស្តុក</label>
          <label id="edit_lbl_back${sfx}"
            style="display:flex;align-items:center;gap:8px;border:2px solid ${r['bag_back'+sfx]?'var(--red)':'var(--border)'};border-radius:9px;padding:10px 14px;cursor:pointer;background:${r['bag_back'+sfx]?'var(--red3)':'white'};transition:all .15s;font-size:14px;font-weight:700"
            onmouseenter="this.style.borderColor='var(--red)'"
            onmouseleave="if(!document.getElementById('edit_bag_back${sfx}').checked)this.style.borderColor='var(--border)'">
            <input type="checkbox" id="edit_bag_back${sfx}" data-key="bag_back${sfx}"
              ${r['bag_back'+sfx]?'checked':''}
              style="accent-color:var(--red);width:17px;height:17px"
              onchange="editBagBackChange(this,'${sfx}')">
            <span id="edit_span_back${sfx}" style="font-size:14px;font-weight:700;color:${r['bag_back'+sfx]?'var(--red)':'inherit'}">${r['bag_back'+sfx]?'🔄 វិលរួច':'វិលស្តុក'}</span>
          </label>
        </div>
        <div class="fld"><label>🩸 Group / Rh</label>
          <select data-key="grp${sfx}" style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;width:100%;font-family:Noto Sans Khmer,sans-serif;cursor:pointer;outline:none">
            ${grpOpts(grp)}
          </select>
        </div>
        <div class="fld"><label>💉 ប្រភេទ</label>
          <select data-key="blood_type${sfx}" style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;width:100%;font-family:Noto Sans Khmer,sans-serif;cursor:pointer;outline:none">
            ${typeOpts(btype)}
          </select>
        </div>
        <div class="fld"><label>📅 ថ្ងៃផុត</label>
          <input type="date" data-key="blood_exp${sfx}" value="${eH(bexp)}"
            style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;width:100%;font-family:Noto Sans Khmer,sans-serif;outline:none">
        </div>
        <div class="fld"><label>👤 អ្នកយកប្រើ</label>
          <input type="text" data-key="bag_taker${sfx}" value="${eH(taker)}"
            style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;width:100%;font-family:Noto Sans Khmer,sans-serif;outline:none"
            onfocus="this.style.borderColor='var(--red)'" onblur="this.style.borderColor='var(--border)'">
        </div>
        <div class="fld"><label>🕐 ថ្ងៃ ម៉ោង យក</label>
          <input type="datetime-local" data-key="bag_taken_dt${sfx}" value="${eH(takenDt)}"
            style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;width:100%;font-family:Noto Sans Khmer,sans-serif;outline:none"
            onfocus="this.style.borderColor='var(--red)'" onblur="this.style.borderColor='var(--border)'">
        </div>
        <div class="fld"><label>🧑‍⚕️ បុគ្គលិក-Lab</label>
          <select data-key="bag_lab_staff${sfx}" style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;font-weight:600;width:100%;font-family:JetBrains Mono,monospace;cursor:pointer;outline:none;transition:border-color .2s"><option value="">-- ជ្រើស --</option><option value="SMH">SMH</option><option value="SLS">SLS</option><option value="NBT">NBT</option><option value="SPT">SPT</option><option value="SSD">SSD</option><option value="HSN">HSN</option><option value="CCT">CCT</option><option value="HSC">HSC</option><option value="KRN">KRN</option><option value="TSP">TSP</option><option value="HSP">HSP</option><option value="SSN">SSN</option><option value="EKP">EKP</option><option value="VVK">VVK</option><option value="SCL">SCL</option><option value="PVN">PVN</option><option value="YMR">YMR</option><option value="NSM">NSM</option><option value="THL">THL</option><option value="CSI">CSI</option><option value="DOD">DOD</option><option value="HCY">HCY</option><option value="LST">LST</option><option value="DSP">DSP</option><option value="VCN">VCN</option><option value="LSN">LSN</option><option value="KNT">KNT</option><option value="YKN">YKN</option><option value="TEL">TEL</option><option value="CSR">CSR</option><option value="SML">SML</option><option value="ECP">ECP</option></select>
        </div>
      </div>
    </div>`;
  }

  // Build visible bag rows
  let bagRowsHtml = '<div id="editBagContainer">';
  for (let i = 0; i < editBagCount; i++) {
    bagRowsHtml += makeBagRowEdit(bagSfxs[i], i+1);
  }
  bagRowsHtml += '</div>';

  // Add bag button (if less than 7)
  bagRowsHtml += `
  <div style="display:flex;align-items:center;gap:10px;margin:12px 0 4px">
    <button type="button" id="editBtnAddBag" onclick="editAddBag()"
      style="display:flex;align-items:center;gap:8px;padding:9px 18px;border:2px dashed var(--red);border-radius:10px;background:rgba(185,28,28,.04);color:var(--red);font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;font-family:Noto Sans Khmer,sans-serif">
      ➕ បន្ថែម Bag
    </button>
    <span id="editBagCountLabel" style="font-size:11px;color:var(--muted);font-family:JetBrains Mono,monospace">Bag ${editBagCount} / 7</span>
  </div>`;

  return `
  ${secDiv('🏥','ព័ត៌មានអ្នកជំងឺ','var(--dark)')}
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:4px">
    <div class="fld">
      <label>🏷️ SN ប៉ុងឈាម</label>
      <div style="display:flex;border:2px solid var(--border);border-radius:9px;overflow:hidden;transition:border-color .2s" onfocusin="this.style.borderColor='var(--red)'" onfocusout="this.style.borderColor='var(--border)'">
        <span style="background:#F0F9FF;border-right:1.5px solid #BAE6FD;padding:11px 12px;font-size:13px;font-weight:800;color:#0369A1;white-space:nowrap;display:flex;align-items:center;font-family:JetBrains Mono,monospace">SN-</span>
        <input type="text" data-key="sn_code" id="edit_sn_input"
          value="${eH(String(r.sn_code||'').replace(/^SN-/i,''))}"
          placeholder="058770..."
          oninput="this.dataset.rawval=this.value"
          style="border:none;outline:none;flex:1;padding:11px 14px;font-size:14px;font-weight:700;font-family:JetBrains Mono,monospace;letter-spacing:1px">
      </div>
    </div>
    ${einp('date','📅 ថ្ងៃ','date',r.date)}
    ${einp('hn','🪪 HN ជំងឺ','text',r.hn)}
    ${einp('name','👤 ឈ្មោះ','text',r.name)}
    ${einp('age','🔢 អាយុ','number',r.age)}
    <div class="fld"><label>⚧ ភេទ</label>
      <select data-key="gender" style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;font-family:Noto Sans Khmer,sans-serif;cursor:pointer;outline:none">
        <option ${'ប'===r.gender?'selected':''}>ប</option>
        <option ${'ស'===r.gender?'selected':''}>ស</option>
      </select>
    </div>
    <div class="fld">
      <label>🏥 ផ្នែកស្នើ</label>
      <select data-key="ward_from"
        style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;font-weight:500;width:100%;font-family:Noto Sans Khmer,sans-serif;cursor:pointer;outline:none"
        onfocus="this.style.borderColor='var(--red)'" onblur="this.style.borderColor='var(--border)'">
        ${wardOpts(r.ward_from)}
      </select>
    </div>
    <div class="fld">
      <label>➡️ ទៅ</label>
      <select data-key="ward_to"
        style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;font-weight:500;width:100%;font-family:Noto Sans Khmer,sans-serif;cursor:pointer;outline:none"
        onfocus="this.style.borderColor='var(--red)'" onblur="this.style.borderColor='var(--border)'">
        ${wardOpts(r.ward_to)}
      </select>
    </div>
    ${einp('phone','📞 ទូរសព្ទ','text',r.phone)}
    <div class="fld">
      <label>👨‍⚕️ គ្រូពេទ្យ ស្នើ</label>
      <div style="display:flex;border:2px solid var(--border);border-radius:9px;overflow:hidden;transition:border-color .2s" onfocusin="this.style.borderColor='var(--red)'" onfocusout="this.style.borderColor='var(--border)'">
        <span style="background:#FFF7ED;border-right:1.5px solid #FED7AA;padding:11px 12px;font-size:13px;font-weight:800;color:#C2410C;white-space:nowrap;display:flex;align-items:center;font-family:Noto Sans Khmer,sans-serif">វេជ្ជ-</span>
        <input type="text" data-key="doctor_req" id="edit_doctor_req"
          value="${eH(String(r.doctor_req||'').replace(/^វេជ្ជ[-\s]*/u,''))}"
          placeholder="ឈ្មោះ..."
          style="border:none;outline:none;flex:1;padding:11px 14px;font-size:14px;font-weight:600;font-family:Noto Sans Khmer,sans-serif">
      </div>
    </div>
    ${einp('diagnosis','🩺 Diagnosis','text',r.diagnosis)}
    ${einp('hb','🔬 Hb','number',r.hb)}
    ${einp('ht','🔬 Ht','number',r.ht)}
  </div>

  ${secDiv('🩸','ព័ត៌មានសាកឈាម','var(--red)')}
  ${bagRowsHtml}

  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:14px">
    <div class="fld">
      <label style="color:var(--red);font-size:13px;font-weight:900;letter-spacing:.5px">⚗️ X-MATCH (BAG)</label>
      <div style="display:flex;border:2.5px solid var(--red);border-radius:10px;overflow:hidden;background:#FFF5F5">
        <input type="number" data-key="xmatch" value="${eH(String(r.xmatch??''))}" 
          oninput="editCalc()"
          style="border:none;outline:none;flex:1;padding:11px 14px;font-size:18px;font-weight:900;color:var(--red);font-family:JetBrains Mono,monospace;background:transparent">
        <span style="background:#FECACA;border-left:2px solid var(--red);padding:11px 14px;font-size:14px;font-weight:900;color:var(--red);display:flex;align-items:center">Bag</span>
      </div>
    </div>
    ${einp('xmatch_staff','🧑‍⚕️ បុគ្គលិកធ្វើ X-Match','text',r.xmatch_staff)}
    <div class="fld">
      <label>🕐 ថ្ងៃ ម៉ោង ធ្វើ X-Match</label>
      <div style="display:flex;gap:6px">
        <input type="date" data-key="xmatch_date" value="${eH(String(r.xmatch_dt||'').split(' ')[0])}"
          style="flex:1.2;border:2px solid var(--border);border-radius:9px;padding:11px 10px;font-size:13px;font-family:Noto Sans Khmer,sans-serif;outline:none"
          onfocus="this.style.borderColor='var(--red)'" onblur="this.style.borderColor='var(--border)'">
        <input type="time" data-key="xmatch_time" value="${eH(String(r.xmatch_dt||'').split(' ')[1]||'')}"
          style="flex:1;border:2px solid var(--border);border-radius:9px;padding:11px 10px;font-size:13px;font-family:JetBrains Mono,monospace;outline:none"
          onfocus="this.style.borderColor='var(--red)'" onblur="this.style.borderColor='var(--border)'">
      </div>
    </div>
    <div class="fld">
      <label style="color:var(--blue)">🏥 ករណីឈាម NBTC (PL)</label>
      <div style="display:flex;border:2px solid ${r.nbtc?'var(--blue)':'var(--border)'};border-radius:9px;padding:10px 14px;gap:8px;align-items:center;cursor:pointer;background:${r.nbtc?'var(--blue2)':'white'}" onclick="this.querySelector('input').click()">
        <input type="checkbox" data-key="nbtc" ${r.nbtc?'checked':''} style="accent-color:var(--blue);width:17px;height:17px">
        <span style="font-size:13px;font-weight:700;color:${r.nbtc?'var(--blue)':'inherit'}">${r.nbtc?'✅ ឈាមមកពី NBTC (PL)':'ឈាមមកពី NBTC (PL)'}</span>
      </div>
    </div>
    <div class="fld"><label>🔬 Saline 25C</label>
      <div style="display:flex;border:2px solid var(--border);border-radius:9px;padding:10px 14px;gap:8px;align-items:center;cursor:pointer;background:${r.s25?'var(--green2)':'white'}" onclick="this.querySelector('input').click()">
        <input type="checkbox" data-key="s25" ${r.s25?'checked':''} style="accent-color:var(--green);width:16px;height:16px">
        <span style="font-size:13px;font-weight:700">${r.s25?'✓ ok':'ok?'}</span>
      </div>
    </div>
    <div class="fld"><label>🔬 Saline 37C</label>
      <div style="display:flex;border:2px solid var(--border);border-radius:9px;padding:10px 14px;gap:8px;align-items:center;cursor:pointer;background:${r.s37?'var(--green2)':'white'}" onclick="this.querySelector('input').click()">
        <input type="checkbox" data-key="s37" ${r.s37?'checked':''} style="accent-color:var(--green);width:16px;height:16px">
        <span style="font-size:13px;font-weight:700">${r.s37?'✓ ok':'ok?'}</span>
      </div>
    </div>
    <div class="fld"><label>🔬 Anti.IGG</label>
      <div style="display:flex;border:2px solid var(--border);border-radius:9px;padding:10px 14px;gap:8px;align-items:center;cursor:pointer;background:${r.anti?'var(--green2)':'white'}" onclick="this.querySelector('input').click()">
        <input type="checkbox" data-key="anti" ${r.anti?'checked':''} style="accent-color:var(--green);width:16px;height:16px">
        <span style="font-size:13px;font-weight:700">${r.anti?'✓ ok':'ok?'}</span>
      </div>
    </div>
    <div class="fld"><label>🔬 Come Check</label>
      <div style="display:flex;border:2px solid var(--border);border-radius:9px;padding:10px 14px;gap:8px;align-items:center;cursor:pointer;background:${r.come?'var(--green2)':'white'}" onclick="this.querySelector('input').click()">
        <input type="checkbox" data-key="come" ${r.come?'checked':''} style="accent-color:var(--green);width:16px;height:16px">
        <span style="font-size:13px;font-weight:700">${r.come?'✓ ok':'ok?'}</span>
      </div>
    </div>
  </div>

  ${secDiv('💊','ការប្រើប្រាស់សាកឈាម','var(--gold)')}
  <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:12px">
    ${einp('qty_new','🆕 ថ្មី','number',r.qty_new)}
    ${einp('qty_borrow','🔄 ខ្ចី','number',r.qty_borrow)}
    ${einp('qty_return','↩️ សង','number',r.qty_return,'oninput="editCalc()"')}
    ${autoField('stock_sent','📦 ស្តុកផ្ញើ','var(--gold)',r.stock_sent)}
    ${einp('qty_used','✅ យកប្រើ','number',r.qty_used,'oninput="editCalc()"')}
    ${autoField('given_count','⏳ នៅជំពាក់','#EA580C',r.given_count)}
  </div>
  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
    <div class="fld">
      <label style="color:var(--red);font-size:13px;font-weight:900;letter-spacing:.5px">🔙 វិលចូលស្តុក</label>
      <div style="display:flex;border:2.5px solid var(--red);border-radius:10px;overflow:hidden;background:var(--red3)">
        <input type="number" data-key="back_stock" value="${eH(String(r.back_stock??''))}"
          oninput="editCalc()"
          style="border:none;outline:none;flex:1;padding:11px 14px;font-size:18px;font-weight:900;color:var(--red);font-family:JetBrains Mono,monospace;background:transparent">
        <span style="background:#FECACA;border-left:2px solid var(--red);padding:11px 14px;font-size:14px;font-weight:900;color:var(--red);display:flex;align-items:center">Bag</span>
      </div>
    </div>
  </div>

  ${secDiv('🔄','ព័ត៌មានត្រលប់ / ផ្នែក','var(--green)')}
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px">
    ${autoField('not_returned','❗ មិនទាន់សង','var(--red)',r.not_returned)}
    <div class="fld"><label>⛔ ពុំមានលទ្ធភាព</label>
      <div id="edit_cannot_wrap" style="display:flex;border:2px solid ${r.cannot_return?'var(--red)':'var(--border)'};border-radius:9px;padding:10px 14px;gap:8px;align-items:center;cursor:pointer;background:${r.cannot_return?'var(--red3)':'white'};transition:all .2s" onclick="this.querySelector('input').click()">
        <input type="checkbox" id="edit_cannot_return_cb" data-key="cannot_return" ${r.cannot_return?'checked':''} style="accent-color:var(--red);width:16px;height:16px" onchange="cannotReturnChange(this)">
        <span id="edit_cannot_span" style="font-size:13px;font-weight:700;color:${r.cannot_return?'var(--red)':'inherit'}">${r.cannot_return?'⛔ ពុំអាចសង':'ពុំអាចសង'}</span>
      </div>
    </div>
    ${einp('given_back','📦 ចំនួនផ្តល់','number',r.given_back)}
    ${einp('info_time','⏰ ម៉ោង ព័ត៌មាន','time',r.info_time)}
    ${einp('info_recv','👤 អ្នកទទួល','text',r.info_recv)}
  </div>
  <div style="margin-top:12px">
    <div class="fld">
      <label id="edit_reason_label" style="color:${r.cannot_return?'var(--red)':'var(--muted)'}">📝 មូលហេតុ ${r.cannot_return?'<span style=\"color:var(--red);font-weight:900\">* (ត្រូវបំពេញ)</span>':''}</label>
      <input type="text" data-key="reason" id="edit_reason_input" value="${eH(String(r.reason??''))}"
        style="border:2px solid ${r.cannot_return?'var(--red)':'var(--border)'};border-radius:9px;padding:11px 14px;font-size:14px;font-weight:500;width:100%;font-family:Noto Sans Khmer,sans-serif;outline:none;transition:all .2s"
        placeholder="${r.cannot_return?'* សូមបំពេញមូលហេតុ...':'មូលហេតុ...'}"
        onfocus="this.style.borderColor='var(--red)'" onblur="this.style.borderColor=document.getElementById('edit_cannot_return_cb')?.checked?'var(--red)':'var(--border)'">
    </div>
  </div>`;
}
// Edit modal bag used change
function editBagUsedChange(chk, sfx) {
  const lbl  = document.getElementById('edit_lbl_used'  + sfx);
  const span = document.getElementById('edit_span_used' + sfx);
  const row  = document.getElementById('edit_bagrow'    + sfx);
  if (chk.checked) {
    if (lbl)  { lbl.style.borderColor='var(--green)'; lbl.style.background='var(--green2)'; }
    if (span) span.textContent = '✅ យកប្រើរួច';
    if (row)  { row.style.background='#F0FDF4'; row.style.borderRadius='10px'; row.style.padding='12px'; }
  } else {
    if (lbl)  { lbl.style.borderColor='var(--border)'; lbl.style.background='white'; }
    if (span) span.textContent = 'យកប្រើ';
    if (row)  { row.style.background=''; row.style.padding=''; }
  }
  // Count checked → update qty_used
  const sfxList = ['','_2','_3','_4','_5','_6','_7'];
  let cnt = 0;
  sfxList.forEach(s => {
    const el = document.getElementById('edit_bag_used' + s);
    if (el && el.checked) cnt++;
  });
  const usedEl = document.querySelector('#editBody [data-key="qty_used"]');
  if (usedEl) { usedEl.value = cnt; }
  editCalc();
}

// ── Cannot Return Change ──
function cannotReturnChange(chk) {
  const wrap    = document.getElementById('edit_cannot_wrap');
  const span    = document.getElementById('edit_cannot_span');
  const notRet  = document.getElementById('edit_not_returned');
  const givCnt  = document.getElementById('edit_given_count');
  const reasonEl= document.getElementById('edit_reason_input');
  const reasonLbl= document.getElementById('edit_reason_label');

  if (chk.checked) {
    // ពុំអាចសង → zero out both fields
    if (wrap)    { wrap.style.borderColor='var(--red)'; wrap.style.background='var(--red3)'; }
    if (span)    { span.textContent='⛔ ពុំអាចសង'; span.style.color='var(--red)'; }
    if (notRet)  { notRet.value = 0; notRet.style.color='var(--muted)'; }
    if (givCnt)  { givCnt.value = 0; givCnt.style.color='var(--muted)'; }
    // Also zero given_count auto field in edit modal
    const gcEdit = document.getElementById('edit_given_count');
    const nrEdit = document.getElementById('edit_not_returned');
    if (gcEdit) { gcEdit.value = 0; }
    if (nrEdit) { nrEdit.value = 0; }
    // Recalc to enforce 0
    editCalc();
    // Highlight reason field as required
    if (reasonEl)  { reasonEl.style.borderColor='var(--red)'; reasonEl.placeholder='* សូមបំពេញមូលហេតុ...'; reasonEl.focus(); }
    if (reasonLbl) { reasonLbl.innerHTML='📝 មូលហេតុ <span style="color:var(--red);font-weight:900">* (ត្រូវបំពេញ)</span>'; reasonLbl.style.color='var(--red)'; }
  } else {
    // Unchecked → restore
    if (wrap)    { wrap.style.borderColor='var(--border)'; wrap.style.background='white'; }
    if (span)    { span.textContent='ពុំអាចសង'; span.style.color='inherit'; }
    if (notRet)  { notRet.style.color=''; }
    if (givCnt)  { givCnt.style.color=''; }
    // Recalc
    editCalc();
    if (reasonEl)  { reasonEl.style.borderColor='var(--border)'; reasonEl.placeholder='មូលហេតុ...'; }
    if (reasonLbl) { reasonLbl.innerHTML='📝 មូលហេតុ'; reasonLbl.style.color='var(--muted)'; }
  }
}

// Edit modal: add bag row dynamically
let editBagCount = 1;
function editAddBag() {
  const container = document.getElementById('editBagContainer');
  if (!container) return;
  const existing = container.querySelectorAll('.bag-row').length;
  if (existing >= 7) return;
  const n   = existing + 1;
  const sfxList = ['','_2','_3','_4','_5','_6','_7'];
  const sfx = sfxList[existing];
  const div = document.createElement('div');
  div.className = 'bag-row';
  div.id = 'edit_bagrow' + sfx;
  div.style.marginTop = '10px';
  div.innerHTML =
    '<div class="bag-row-title">' +
      '<span style="background:var(--red);color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;flex-shrink:0">' + n + '</span>' +
      'Bag ' + n +
      '<button type="button" onclick="editRemoveBag(\'' + sfx + '\')" style="margin-left:auto;padding:3px 10px;border:1.5px solid var(--border);border-radius:6px;background:white;color:var(--muted);font-size:12px;cursor:pointer;font-weight:600">✕ លុប</button>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1.8fr 140px 140px 1fr 1fr 1fr 1fr 1fr 1fr;gap:12px;align-items:end">' +
      '<div class="fld"><label>📋 លេខកូដ</label>' +
        '<input type="text" data-key="blood_code' + sfx + '" style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:15px;font-weight:800;width:100%;font-family:JetBrains Mono,monospace;outline:none;letter-spacing:.5px" placeholder="e.g. 2026...">' +
      '</div>' +
      '<div class="fld"><label style="color:var(--green)">✅ យកប្រើរួច</label>' +
        '<label id="edit_lbl_used' + sfx + '" style="display:flex;align-items:center;gap:8px;border:2px solid var(--border);border-radius:9px;padding:10px 14px;cursor:pointer;background:white;transition:all .15s;font-size:14px;font-weight:700" onmouseenter="this.style.borderColor=\'var(--green)\'" onmouseleave="if(!document.getElementById(\'edit_bag_used' + sfx + '\').checked)this.style.borderColor=\'var(--border)\'">' +
          '<input type="checkbox" id="edit_bag_used' + sfx + '" data-key="bag_used' + sfx + '" style="accent-color:var(--green);width:17px;height:17px" onchange="editBagUsedChange(this,\'' + sfx + '\')">' +
          '<span id="edit_span_used' + sfx + '" style="font-size:14px;font-weight:700">យកប្រើ</span>' +
        '</label>' +
      '</div>' +
      '<div class="fld"><label style="color:var(--red)">🔄 វិលចូលស្តុក</label>' +
        '<label id="edit_lbl_back' + sfx + '" style="display:flex;align-items:center;gap:8px;border:2px solid var(--border);border-radius:9px;padding:10px 14px;cursor:pointer;background:white;transition:all .15s;font-size:14px;font-weight:700" onmouseenter="this.style.borderColor=\'var(--red)\'" onmouseleave="if(!document.getElementById(\'edit_bag_back' + sfx + '\').checked)this.style.borderColor=\'var(--border)\'">' +
          '<input type="checkbox" id="edit_bag_back' + sfx + '" data-key="bag_back' + sfx + '" style="accent-color:var(--red);width:17px;height:17px" onchange="editBagBackChange(this,\'' + sfx + '\')">' +
          '<span id="edit_span_back' + sfx + '" style="font-size:14px;font-weight:700">វិលស្តុក</span>' +
        '</label>' +
      '</div>' +
      '<div class="fld"><label>🩸 Group / Rh</label>' +
        '<select data-key="grp' + sfx + '" style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;width:100%;font-family:Noto Sans Khmer,sans-serif;cursor:pointer;outline:none"><option value="">-- ជ្រើស --</option><option>A Pos</option><option>A Neg</option><option>B Pos</option><option>B Neg</option><option>O Pos</option><option>O Neg</option><option>AB Pos</option><option>AB Neg</option></select>' +
      '</div>' +
      '<div class="fld"><label>💉 ប្រភេទ</label>' +
        '<select data-key="blood_type' + sfx + '" style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;width:100%;font-family:Noto Sans Khmer,sans-serif;cursor:pointer;outline:none"><option value="">-- ជ្រើស --</option><option value="WB">WB</option><option value="RC">RC</option><option value="PL">PL</option><option value="FFP">FFP</option></select>' +
      '</div>' +
      '<div class="fld"><label>📅 ថ្ងៃផុត</label>' +
        '<input type="date" data-key="blood_exp' + sfx + '" style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;width:100%;font-family:Noto Sans Khmer,sans-serif;outline:none">' +
      '</div>' +
      '<div class="fld"><label>👤 អ្នកយកប្រើ</label>' +
        '<input type="text" data-key="bag_taker' + sfx + '" placeholder="ឈ្មោះ..." style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;width:100%;font-family:Noto Sans Khmer,sans-serif;outline:none">' +
      '</div>' +
      '<div class="fld"><label>🕐 ថ្ងៃ ម៉ោង យក</label>' +
        '<input type="datetime-local" data-key="bag_taken_dt' + sfx + '" style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;width:100%;font-family:Noto Sans Khmer,sans-serif;outline:none">' +
      '</div>' +
      '<div class="fld"><label>🧑‍⚕️ បុគ្គលិក-LAB</label>' +
        '<select data-key="bag_lab_staff' + sfx + '" style="border:2px solid var(--border);border-radius:9px;padding:11px 14px;font-size:14px;width:100%;font-family:JetBrains Mono,monospace;font-weight:600;cursor:pointer;outline:none"><option value="">-- ជ្រើស --</option><option value="SMH">SMH</option><option value="SLS">SLS</option><option value="NBT">NBT</option><option value="SPT">SPT</option><option value="SSD">SSD</option><option value="HSN">HSN</option><option value="CCT">CCT</option><option value="HSC">HSC</option><option value="KRN">KRN</option><option value="TSP">TSP</option><option value="HSP">HSP</option><option value="SSN">SSN</option><option value="EKP">EKP</option><option value="VVK">VVK</option><option value="SCL">SCL</option><option value="PVN">PVN</option><option value="YMR">YMR</option><option value="NSM">NSM</option><option value="THL">THL</option><option value="CSI">CSI</option><option value="DOD">DOD</option><option value="HCY">HCY</option><option value="LST">LST</option><option value="DSP">DSP</option><option value="VCN">VCN</option><option value="LSN">LSN</option><option value="KNT">KNT</option><option value="YKN">YKN</option><option value="TEL">TEL</option><option value="CSR">CSR</option><option value="SML">SML</option><option value="ECP">ECP</option></select>' +
      '</div>' +
    '</div>';
  container.appendChild(div);
  const lbl = document.getElementById('editBagCountLabel');
  if (lbl) lbl.textContent = 'Bag ' + (existing+1) + ' / 7';
  const btn = document.getElementById('editBtnAddBag');
  if (btn && existing+1 >= 7) btn.style.opacity = '0.4';
}

function editRemoveBag(sfx) {
  const el = document.getElementById('edit_bagrow' + sfx);
  if (el) {
    el.remove();
    // Recount used
    editBagUsedChange({checked:false}, sfx);
    const container = document.getElementById('editBagContainer');
    const cnt = container ? container.querySelectorAll('.bag-row').length : 1;
    const lbl = document.getElementById('editBagCountLabel');
    if (lbl) lbl.textContent = 'Bag ' + cnt + ' / 7';
    const btn = document.getElementById('editBtnAddBag');
    if (btn) btn.style.opacity = '1';
  }
}

// Edit modal: bag back change
function editBagBackChange(chk, sfx) {
  const lbl  = document.getElementById('edit_lbl_back'  + sfx);
  const span = document.getElementById('edit_span_back' + sfx);
  const row  = document.getElementById('edit_bagrow'    + sfx);
  const bfId = 'edit_back_fields' + sfx;
  let   bf   = document.getElementById(bfId);

  if (chk.checked) {
    if (lbl)  { lbl.style.borderColor='var(--red)'; lbl.style.background='var(--red3)'; }
    if (span) { span.textContent='🔄 វិលរួច'; span.style.color='var(--red)'; }
    if (row)  { row.style.borderColor='var(--red)'; }
    // Uncheck used
    const usedCb = document.getElementById('edit_bag_used' + sfx);
    if (usedCb && usedCb.checked) { usedCb.checked=false; editBagUsedChange(usedCb, sfx); }
    // Auto +1 to back_stock in edit modal
    const bkEl = document.querySelector('#editBody [data-key="back_stock"]');
    if (bkEl) { bkEl.value = (parseFloat(bkEl.value)||0) + 1; editCalc(); }
    // Show back fields - create if not exists
    if (!bf) {
      bf = document.createElement('div');
      bf.id = bfId;
      bf.style.cssText = 'margin-top:12px;padding:14px;background:var(--red3);border:1.5px solid var(--red);border-radius:12px;animation:slideDown .2s ease';
      bf.innerHTML = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
        <div class="fld"><label style="color:var(--red)">👤 អ្នកអោយកាត់</label>
          <input type="text" data-key="bag_back_giver${sfx}" style="border:2px solid var(--red);border-radius:9px;padding:10px 13px;font-size:14px;width:100%;font-family:Noto Sans Khmer,sans-serif;outline:none;background:white" placeholder="ឈ្មោះ..."></div>
        <div class="fld"><label style="color:var(--red)">🕐 ថ្ងៃ ម៉ោង វិល</label>
          <div style="display:flex;gap:6px">
            <input type="date" data-key="bag_back_date${sfx}" style="flex:1.2;border:2px solid var(--red);border-radius:9px;padding:10px 8px;font-size:12px;outline:none;background:white">
            <input type="time" data-key="bag_back_time${sfx}" style="flex:1;border:2px solid var(--red);border-radius:9px;padding:10px 8px;font-size:12px;font-family:JetBrains Mono,monospace;outline:none;background:white">
          </div></div>
        <div class="fld"><label style="color:var(--red)">🧑‍⚕️ បុគ្គលិក Lab</label>
          <select data-key="bag_back_lab${sfx}" style="border:2px solid var(--red);border-radius:9px;padding:10px 8px;font-size:13px;font-family:JetBrains Mono,monospace;font-weight:600;width:100%;outline:none;cursor:pointer;background:white"><option value="">-- ជ្រើស --</option><option value="SMH">SMH</option><option value="SLS">SLS</option><option value="NBT">NBT</option><option value="SPT">SPT</option><option value="SSD">SSD</option><option value="HSN">HSN</option><option value="CCT">CCT</option><option value="HSC">HSC</option><option value="KRN">KRN</option><option value="TSP">TSP</option><option value="HSP">HSP</option><option value="SSN">SSN</option><option value="EKP">EKP</option><option value="VVK">VVK</option><option value="SCL">SCL</option><option value="PVN">PVN</option><option value="YMR">YMR</option><option value="NSM">NSM</option><option value="THL">THL</option><option value="CSI">CSI</option><option value="DOD">DOD</option><option value="HCY">HCY</option><option value="LST">LST</option><option value="DSP">DSP</option><option value="VCN">VCN</option><option value="LSN">LSN</option><option value="KNT">KNT</option><option value="YKN">YKN</option><option value="TEL">TEL</option><option value="CSR">CSR</option><option value="SML">SML</option><option value="ECP">ECP</option></select></div>
        <div class="fld"><label style="color:var(--red)">📝 មូលហេតុ</label>
          <input type="text" data-key="bag_back_reason${sfx}" style="border:2px solid var(--red);border-radius:9px;padding:10px 13px;font-size:14px;width:100%;font-family:Noto Sans Khmer,sans-serif;outline:none;background:white" placeholder="មូលហេតុ..."></div>
      </div>`;
      const rowEl = document.getElementById('edit_bagrow' + sfx);
      if (rowEl) rowEl.appendChild(bf);
    }
    if (bf) bf.style.display = 'block';
  } else {
    if (lbl)  { lbl.style.borderColor='var(--border)'; lbl.style.background='white'; }
    if (span) { span.textContent='វិលស្តុក'; span.style.color='inherit'; }
    if (row)  { row.style.borderColor='var(--border)'; }
    if (bf)   bf.style.display = 'none';
    // Auto -1 from back_stock
    const bkEl2 = document.querySelector('#editBody [data-key="back_stock"]');
    if (bkEl2) { bkEl2.value = Math.max(0,(parseFloat(bkEl2.value)||0) - 1); editCalc(); }
  }
}

// Edit modal auto calc
function editCalc() {
  const g = key => {
    const el = document.querySelector('#editBody [data-key="'+key+'"]');
    return el ? parseFloat(el.value)||0 : 0;
  };
  const s = (key, val) => {
    const el = document.getElementById('edit_'+key);
    if (el) el.value = Math.max(0, val);
  };
  const xm  = g('xmatch');
  const us  = g('qty_used');
  const bk  = g('back_stock');
  const ret = g('qty_return');
  // ស្តុកផ្ញើ = X-Match − យកប្រើ − វិលចូលស្តុក
  s('stock_sent',   xm - us - bk);
  // ពុំអាចសង → zero
  const cannotCb = document.getElementById('edit_cannot_return_cb');
  if (cannotCb && cannotCb.checked) {
    s('given_count',  0);
    s('not_returned', 0);
  } else {
    // នៅជំពាក់ = X-Match − វិលចូលស្តុក − សង
    s('given_count',  xm - bk - ret);
    // មិនទាន់សង = X-Match − វិលចូលស្តុក − សង
    s('not_returned', xm - bk - ret);
  }
}

async function saveEdit() {
  // Validate: if cannot_return checked, reason must be filled
  const cannotCb = document.getElementById('edit_cannot_return_cb');
  const reasonEl = document.getElementById('edit_reason_input');
  if (cannotCb && cannotCb.checked && reasonEl && !reasonEl.value.trim()) {
    reasonEl.style.borderColor = 'var(--red)';
    reasonEl.style.boxShadow   = '0 0 0 3px rgba(185,28,28,.15)';
    reasonEl.focus();
    showToast('⚠️ សូមបំពេញ មូលហេតុ ព្រោះ tick ពុំអាចសង!', 'err');
    return;
  }
  const row = {};
  document.querySelectorAll('#editBody [data-key]').forEach(el => {
    if (el.type === 'checkbox') {
      const k = el.dataset.key;
      if (k && k.startsWith('bag_used')) row[k] = el.checked ? 'yes' : '';
      else if (k === 'cannot_return') row[k] = el.checked ? 'ពុំអាច' : '';
      else row[k] = el.checked ? 'ok' : '';
    } else if (el.dataset.key === 'sn_code') {
      const raw = el.value.trim().replace(/^SN-/i, '');
      row['sn_code'] = raw ? 'SN-' + raw : null;
    } else if (el.dataset.key === 'doctor_req') {
      const raw = el.value.trim().replace(/^វេជ្ជ[- \s]*/u, '');
      row['doctor_req'] = raw ? 'វេជ្ជ-' + raw : null;
    } else if (el.dataset.key === 'checkin_time' || el.dataset.key === 'out_time') {
      // Skip - combined below
    } else if (el.dataset.key === 'checkin_date') {
      const t = document.querySelector('#editBody [data-key="checkin_time"]')?.value || '';
      const d = el.value || '';
      row['checkin_dt'] = d && t ? d + ' ' + t : (d || t || null);
    } else if (el.dataset.key === 'out_date') {
      const t = document.querySelector('#editBody [data-key="out_time"]')?.value || '';
      const d = el.value || '';
      row['out_date'] = d && t ? d + ' ' + t : (d || t || null);
    } else if (el.dataset.key === 'xmatch_date') {
      const t = document.querySelector('#editBody [data-key="xmatch_time"]')?.value || '';
      const d = el.value || '';
      row['xmatch_dt'] = d && t ? d + ' ' + t : (d || t || null);
    } else if (el.dataset.key === 'xmatch_time') {
      // handled above
    } else if (el.dataset.key === 'nbtc') {
      row['nbtc'] = el.checked ? 'yes' : '';
    } else if (el.dataset.key && el.dataset.key.startsWith('bag_back') && el.type === 'checkbox') {
      row[el.dataset.key] = el.checked ? 'yes' : '';
    } else {
      row[el.dataset.key] = el.value || null;
    }
  });
  const xm  = parseFloat(row.xmatch)||0;
  const us  = parseFloat(row.qty_used)||0;
  const bk  = parseFloat(row.back_stock)||0;
  const ret = parseFloat(row.qty_return)||0;
  row.stock_sent   = Math.max(0, xm - us - bk);
  const cannotRet  = document.getElementById('edit_cannot_return_cb')?.checked;
  row.given_count  = cannotRet ? 0 : Math.max(0, xm - bk - ret);
  row.not_returned = cannotRet ? 0 : Math.max(0, xm - bk - ret);

  const btn = document.getElementById('btnEditSave');
  btn._orig = btn.innerHTML; btn.innerHTML = '<span class="spinner"></span> Saving...'; btn.disabled = true;
  try {
    await sbUpdate(editId, row);
    closeModal(); showToast('✅ Updated in Supabase!', 'ok');
    await loadRecords();
  } catch(e) { showToast('❌ ' + e.message, 'err'); }
  finally { btn.innerHTML = btn._orig; btn.disabled = false; }
}

function closeModal() { document.getElementById('editModal').classList.remove('open'); editId = null; }
