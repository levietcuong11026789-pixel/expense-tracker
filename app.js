// =============================================
// SỔ CHI TIÊU — app.js (LOCAL STORAGE — BẢO MẬT)
// Dữ liệu chỉ lưu trên máy, không gửi lên mạng
// =============================================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

const CATEGORIES = [
  { id: 'food',      icon: '🍜', label: 'Ăn uống' },
  { id: 'coffee',    icon: '☕', label: 'Cà phê' },
  { id: 'transport', icon: '🚕', label: 'Di chuyển' },
  { id: 'fuel',      icon: '⛽', label: 'Xăng xe' },
  { id: 'market',    icon: '🛒', label: 'Đi chợ' },
  { id: 'electric',  icon: '💡', label: 'Điện/Nước' },
  { id: 'phone',     icon: '📱', label: 'ĐT/Mạng' },
  { id: 'health',    icon: '💊', label: 'Sức khỏe' },
  { id: 'kids',      icon: '👶', label: 'Con cái' },
  { id: 'shopping',  icon: '🛍️', label: 'Mua sắm' },
  { id: 'fun',       icon: '🎮', label: 'Giải trí' },
  { id: 'other',     icon: '📌', label: 'Khác' }
];

let selectedCat = 'food', editingId = null, editingDate = null;

// ── LOCAL STORAGE HELPERS ──────────────────────
function getExpenses(dateKey) {
  const data = JSON.parse(localStorage.getItem('expenses') || '{}');
  return data[dateKey] || {};
}
function getAllExpenses() {
  return JSON.parse(localStorage.getItem('expenses') || '{}');
}
function saveExpense(dateKey, id, expense) {
  const data = getAllExpenses();
  if (!data[dateKey]) data[dateKey] = {};
  data[dateKey][id] = expense;
  localStorage.setItem('expenses', JSON.stringify(data));
}
function deleteExpenseData(dateKey, id) {
  const data = getAllExpenses();
  if (data[dateKey]) {
    delete data[dateKey][id];
    if (Object.keys(data[dateKey]).length === 0) delete data[dateKey];
  }
  localStorage.setItem('expenses', JSON.stringify(data));
}
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

// ── HELPERS ────────────────────────────────────
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function monthPrefix() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function fmtMoney(n) { return Math.abs(n).toLocaleString('vi-VN') + ' đ'; }
function fmtK(n) { return n >= 1000 ? Math.round(n/1000) + 'k' : n + 'đ'; }
function timeStr(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// ── INIT ───────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  const days = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
  document.getElementById('date-display').textContent =
    `${days[now.getDay()]}, ${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
  buildCatGrid();
  renderToday();
  updateHeroTotals();
  hide('loading-screen'); show('app');
});

function buildCatGrid() {
  const el = document.getElementById('cat-grid');
  el.innerHTML = CATEGORIES.map(c =>
    `<button class="cat-btn${c.id===selectedCat?' active':''}" data-id="${c.id}" onclick="selectCat('${c.id}',this)">
      <span>${c.icon}</span>${c.label}
    </button>`
  ).join('');
}
function selectCat(id, el) {
  selectedCat = id;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}

// ── RENDER TODAY ────────────────────────────────
function renderToday() {
  const todayExpenses = getExpenses(todayKey());
  const entries = Object.entries(todayExpenses)
    .map(([id, e]) => ({ id, ...e }))
    .sort((a, b) => b.createdAt - a.createdAt);

  const el = document.getElementById('today-list');
  if (!entries.length) {
    el.innerHTML = '<div class="empty-msg">Chưa có khoản chi nào hôm nay 🎉</div>';
    return;
  }

  el.innerHTML = entries.map(e => {
    const cat = CATEGORIES.find(c => c.id === e.category) || CATEGORIES[11];
    return `<div class="expense-row" onclick="openEditModal('${e.id}','${todayKey()}')">
      <div class="exp-icon">${cat.icon}</div>
      <div class="exp-info">
        <div class="exp-name">${e.note || cat.label}</div>
        <div class="exp-note">${cat.label} · ${timeStr(e.createdAt)}</div>
      </div>
      <div class="exp-val">−${fmtMoney(e.amount)}</div>
    </div>`;
  }).join('');
}

// ── HERO TOTALS ────────────────────────────────
function updateHeroTotals() {
  const allData = getAllExpenses();

  // Today
  const todayData = allData[todayKey()] || {};
  const todayTotal = Object.values(todayData).reduce((s, e) => s + e.amount, 0);
  document.getElementById('today-total').textContent = fmtMoney(todayTotal);

  // Week
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now); monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  let weekTotal = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    const dk = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (allData[dk]) Object.values(allData[dk]).forEach(e => weekTotal += e.amount);
  }
  document.getElementById('week-total').textContent = fmtMoney(weekTotal);

  // Month
  const prefix = monthPrefix();
  let monthTotal = 0;
  Object.entries(allData).forEach(([dk, dayData]) => {
    if (dk.startsWith(prefix)) Object.values(dayData).forEach(e => monthTotal += e.amount);
  });
  document.getElementById('month-total').textContent = fmtMoney(monthTotal);
}

// ── QUICK ADD ──────────────────────────────────
let quickIcon = '', quickLabel = '';
function openQuickAdd(icon, label) {
  quickIcon = icon; quickLabel = label;
  document.getElementById('quick-icon').textContent = icon;
  document.getElementById('quick-label').textContent = label;
  document.getElementById('quick-amount').value = '';
  show('quick-modal');
  setTimeout(() => document.getElementById('quick-amount').focus(), 300);
}
function closeQuickModal() { hide('quick-modal'); }

function confirmQuickAdd() {
  const amount = parseInt(document.getElementById('quick-amount').value);
  if (!amount || amount <= 0) { showToast('⚠️ Nhập số tiền!'); return; }
  const catId = CATEGORIES.find(c => c.icon === quickIcon)?.id || 'other';
  saveExpense(todayKey(), genId(), {
    category: catId, amount, note: quickLabel, createdAt: Date.now()
  });
  closeQuickModal(); playSound(); renderToday(); updateHeroTotals();
  showToast(`💸 ${quickLabel}: −${fmtMoney(amount)}`);
}

// ── ADD MODAL ──────────────────────────────────
function openAddModal() {
  selectedCat = 'food'; buildCatGrid();
  document.getElementById('add-amount').value = '';
  document.getElementById('add-note').value = '';
  show('add-modal');
}
function closeAddModal() { hide('add-modal'); }

function submitExpense() {
  const amount = parseInt(document.getElementById('add-amount').value);
  if (!amount || amount <= 0) { showToast('⚠️ Nhập số tiền!'); return; }
  const note = document.getElementById('add-note').value.trim();
  const cat = CATEGORIES.find(c => c.id === selectedCat);
  saveExpense(todayKey(), genId(), {
    category: selectedCat, amount, note: note || cat.label, createdAt: Date.now()
  });
  closeAddModal(); playSound(); renderToday(); updateHeroTotals();
  showToast(`💸 ${note || cat.label}: −${fmtMoney(amount)}`);
}

// ── EDIT MODAL ─────────────────────────────────
function openEditModal(id, dateKey) {
  editingId = id; editingDate = dateKey || todayKey();
  const e = getExpenses(editingDate)[id]; if (!e) return;
  document.getElementById('edit-amount').value = e.amount;
  document.getElementById('edit-note').value = e.note || '';
  show('edit-modal');
}
function closeEditModal() { hide('edit-modal'); editingId = null; }

function saveEdit() {
  if (!editingId) return;
  const amount = parseInt(document.getElementById('edit-amount').value);
  if (!amount || amount <= 0) { showToast('⚠️ Nhập số tiền!'); return; }
  const note = document.getElementById('edit-note').value.trim();
  const existing = getExpenses(editingDate)[editingId];
  saveExpense(editingDate, editingId, { ...existing, amount, note });
  closeEditModal(); renderToday(); updateHeroTotals();
  showToast('✅ Đã cập nhật!');
}

function deleteExpense() {
  if (!editingId) return;
  if (!confirm('Xóa khoản chi này?')) return;
  deleteExpenseData(editingDate, editingId);
  closeEditModal(); renderToday(); updateHeroTotals();
  showToast('🗑️ Đã xóa!');
}

// ── STATS MODAL ────────────────────────────────
function openStatsModal() { switchTab('day'); show('stats-modal'); }
function closeStatsModal() { hide('stats-modal'); }

function switchTab(tab) {
  ['day','week','month','cat'].forEach(t => {
    document.getElementById(`stab-${t}`)?.classList.remove('active');
    document.getElementById(`spanel-${t}`)?.classList.add('hidden');
  });
  document.getElementById(`stab-${tab}`).classList.add('active');
  document.getElementById(`spanel-${tab}`).classList.remove('hidden');
  if (tab === 'day')   loadDayStats();
  if (tab === 'week')  loadWeekStats();
  if (tab === 'month') loadMonthStats();
  if (tab === 'cat')   loadCatStats();
}

function loadDayStats() {
  const entries = Object.values(getExpenses(todayKey())).sort((a,b) => b.amount - a.amount);
  const total = entries.reduce((s,e) => s+e.amount, 0);
  document.getElementById('sd-total').textContent = fmtMoney(total);
  if (!entries.length) {
    document.getElementById('sd-list').innerHTML = '<div class="empty-msg">Chưa có chi tiêu hôm nay</div>';
    return;
  }
  document.getElementById('sd-list').innerHTML = entries.map(e => {
    const cat = CATEGORIES.find(c => c.id === e.category) || CATEGORIES[11];
    return `<div class="stat-row">
      <span>${cat.icon} ${e.note || cat.label} <small class="dim">${timeStr(e.createdAt)}</small></span>
      <span class="red-txt fw">−${fmtMoney(e.amount)}</span>
    </div>`;
  }).join('');
}

function loadWeekStats() {
  const allData = getAllExpenses();
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now); monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  const dayNames = ['CN','T2','T3','T4','T5','T6','T7'];
  const dayKeys = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    dayKeys.push({
      key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
      label: `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}`, date: d
    });
  }

  let weekTotal = 0, maxDay = '', maxVal = 0;
  const rows = dayKeys.map(({key, label, date}) => {
    const dayData = allData[key] || {};
    const val = Object.values(dayData).reduce((s,e) => s+e.amount, 0);
    const cnt = Object.keys(dayData).length;
    if (val > maxVal) { maxVal = val; maxDay = label; }
    weekTotal += val;
    const isFuture = date > now, isToday = key === todayKey();
    return `<div class="stat-row${isToday?' stat-today':''}">
      <span>${label}${isToday?' 👈':''}</span>
      <span>${isFuture ? '<span class="dim">—</span>' : `<span class="red-txt fw">−${fmtMoney(val)}</span>`}
        ${cnt ? `<small class="dim">(${cnt})</small>` : ''}
      </span>
    </div>`;
  }).join('');

  document.getElementById('sw-total').textContent = fmtMoney(weekTotal);
  document.getElementById('sw-list').innerHTML = rows;
  document.getElementById('sw-best').innerHTML = maxDay && maxVal > 0
    ? `📛 <b>Ngày chi nhiều nhất:</b> ${maxDay} — <span class="red-txt fw">−${fmtMoney(maxVal)}</span>` : '';
}

function loadMonthStats() {
  const allData = getAllExpenses();
  const prefix = monthPrefix();
  let monthTotal = 0, totalItems = 0, activeDays = 0;
  const weekMap = {};

  Object.entries(allData).forEach(([dateKey, dayData]) => {
    if (!dateKey.startsWith(prefix)) return;
    const entries = Object.values(dayData);
    const dayVal = entries.reduce((s,e) => s+e.amount, 0);
    totalItems += entries.length; activeDays++; monthTotal += dayVal;
    const weekNum = Math.ceil(new Date(dateKey).getDate() / 7);
    weekMap[weekNum] = (weekMap[weekNum] || 0) + dayVal;
  });

  document.getElementById('sm-total').textContent = fmtMoney(monthTotal);
  document.getElementById('sm-summary').innerHTML = `
    <div class="mini-card"><div class="mc-val">${totalItems}</div><div class="mc-lbl">Khoản chi</div></div>
    <div class="mini-card"><div class="mc-val">${activeDays}</div><div class="mc-lbl">Ngày có chi</div></div>
    <div class="mini-card"><div class="mc-val red">${activeDays>0?fmtMoney(Math.round(monthTotal/activeDays)):'0đ'}</div><div class="mc-lbl">TB/ngày</div></div>
  `;
  document.getElementById('sm-weeks').innerHTML = Object.entries(weekMap).sort(([a],[b])=>a-b).map(([w, val]) =>
    `<div class="stat-row"><span>📅 Tuần ${w}</span><span class="red-txt fw">−${fmtMoney(val)}</span></div>`
  ).join('') || '<div class="empty-msg">Chưa có dữ liệu</div>';
}

function loadCatStats() {
  const allData = getAllExpenses();
  const prefix = monthPrefix();
  const catMap = {};

  Object.entries(allData).forEach(([dk, dayData]) => {
    if (!dk.startsWith(prefix)) return;
    Object.values(dayData).forEach(e => {
      if (!catMap[e.category]) catMap[e.category] = { total: 0, count: 0 };
      catMap[e.category].total += e.amount;
      catMap[e.category].count++;
    });
  });

  const ranked = Object.entries(catMap)
    .map(([id, d]) => {
      const cat = CATEGORIES.find(c => c.id === id) || CATEGORIES[11];
      return { ...cat, ...d };
    })
    .sort((a,b) => b.total - a.total);

  if (!ranked.length) {
    document.getElementById('sc-list').innerHTML = '<div class="empty-msg">Chưa có dữ liệu tháng này</div>';
    return;
  }

  const medals = ['🥇','🥈','🥉'];
  document.getElementById('sc-list').innerHTML = ranked.map((item, i) => {
    const bar = Math.max(4, Math.round(item.total / ranked[0].total * 100));
    return `<div class="rank-row">
      <div class="rank-medal">${medals[i] || `${i+1}.`}</div>
      <div class="rank-info">
        <div class="rank-name">${item.icon} ${item.label}</div>
        <div class="rank-bar-wrap"><div class="rank-bar red-bar" style="width:${bar}%"></div></div>
        <div class="rank-meta">${item.count} lần · <span class="red-txt fw">−${fmtMoney(item.total)}</span></div>
      </div>
    </div>`;
  }).join('');
}

// ── CALENDAR ───────────────────────────────────
let calYear, calMonth;
function openCalModal() {
  const now = new Date(); calYear = now.getFullYear(); calMonth = now.getMonth();
  renderCal(); hide('cal-detail'); show('cal-modal');
}
function closeCalModal() { hide('cal-modal'); }
function calPrev() { calMonth--; if(calMonth<0){calMonth=11;calYear--;} renderCal(); hide('cal-detail'); }
function calNext() { calMonth++; if(calMonth>11){calMonth=0;calYear++;} renderCal(); hide('cal-detail'); }

function renderCal() {
  const mNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                   'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  document.getElementById('cal-label').textContent = `${mNames[calMonth]} / ${calYear}`;

  const allData = getAllExpenses();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const now = new Date();
  const todayStr = todayKey();

  let html = '';
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-cell empty"></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const dk = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayData = allData[dk] || null;
    const isToday = dk === todayStr ? ' cal-today' : '';
    const isFuture = new Date(calYear, calMonth, d) > now;
    let amountHtml = '';
    if (!isFuture && dayData) {
      const total = Object.values(dayData).reduce((s,e) => s+e.amount, 0);
      amountHtml = `<div class="cal-amount">${fmtK(total)}</div>`;
    }
    html += `<div class="cal-cell${isToday}" onclick="showCalDetail('${dk}')">
      <span class="cal-day-num">${d}</span>${amountHtml}
    </div>`;
  }
  document.getElementById('cal-grid').innerHTML = html;
}

function showCalDetail(dk) {
  const dayData = getExpenses(dk);
  const [y,m,d] = dk.split('-');
  document.getElementById('cal-detail-title').textContent = `📋 Ngày ${parseInt(d)}/${parseInt(m)}`;

  const entries = Object.values(dayData);
  if (!entries.length) {
    document.getElementById('cal-detail-list').innerHTML = '<div class="empty-msg">Không có chi tiêu</div>';
  } else {
    let total = 0;
    const rows = entries.sort((a,b)=>b.amount-a.amount).map(e => {
      const cat = CATEGORIES.find(c => c.id === e.category) || CATEGORIES[11];
      total += e.amount;
      return `<div class="cal-det-row"><span>${cat.icon} ${e.note||cat.label}</span><span class="red-txt fw">−${fmtMoney(e.amount)}</span></div>`;
    }).join('');
    document.getElementById('cal-detail-list').innerHTML =
      rows + `<div class="cal-det-total"><b>Tổng ngày:</b> <b class="red-txt">−${fmtMoney(total)}</b></div>`;
  }
  show('cal-detail');
}

// ── UI HELPERS ─────────────────────────────────
function show(id) { document.getElementById(id)?.classList.remove('hidden'); }
function hide(id) { document.getElementById(id)?.classList.add('hidden'); }
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.remove('hidden');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.add('hidden'), 3000);
}
function playSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(); osc.stop(ctx.currentTime + 0.22);
  } catch(e) {}
}
