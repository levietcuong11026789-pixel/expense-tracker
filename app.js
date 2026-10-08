// SERVICE WORKER
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(reg => {
    // Kiểm tra update ngay khi load và mỗi 30 giây
    reg.update();
    setInterval(() => reg.update(), 30000);
    // Phát hiện SW mới được tải về (installing)
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (!newWorker) return;
      newWorker.addEventListener('statechange', () => {
        // SW mới đã installed (waiting) → báo người dùng
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateBanner('');
        }
      });
    });
  }).catch(() => {});
  // Khi SW đổi (sau skipWaiting) → reload để áp dụng
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) { refreshing = true; window.location.reload(); }
  });
}

// AUTO-UPDATE: Poll version.json mỗi 60 giây
let _currentVersion = null;
async function checkForUpdate() {
  try {
    const res = await fetch('./version.json?_=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    if (!_currentVersion) {
      _currentVersion = data.t; // Lần đầu: lưu version hiện tại
    } else if (data.t !== _currentVersion) {
      showUpdateBanner(data.v); // Có bản mới!
    }
  } catch (e) {}
}
// Kiểm tra ngay khi load + mỗi 60 giây
window.addEventListener('load', () => {
  checkForUpdate();
  setInterval(checkForUpdate, 60000);
});

function showUpdateBanner(version) {
  if (document.getElementById('update-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.className = 'update-banner';
  banner.innerHTML = `
    <div class="update-banner-content">
      <span>🆕 Có bản cập nhật mới${version ? ' (' + version + ')' : ''}!</span>
      <div class="update-banner-btns">
        <button class="update-btn-ok" onclick="applyUpdate()">⬆️ Cập nhật ngay</button>
        <button class="update-btn-skip" onclick="document.getElementById('update-banner').remove()">Bỏ qua</button>
      </div>
    </div>`;
  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add('update-banner-show'));

}
function applyUpdate() {
  // Gửi lệnh SKIP_WAITING đến SW đang chờ → kích hoạt controllerchange → tự reload
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg && reg.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // Fallback nếu SW đã activate rồi
      window.location.reload();
    }
  });
}

const CATS=[{id:'food',icon:'🍜',label:'Ăn uống'},{id:'coffee',icon:'☕',label:'Cà phê'},{id:'transport',icon:'🚕',label:'Di chuyển'},{id:'fuel',icon:'⛽',label:'Xăng xe'},{id:'market',icon:'🛒',label:'Đi chợ'},{id:'electric',icon:'💡',label:'Điện/Nước'},{id:'phone',icon:'📱',label:'ĐT/Mạng'},{id:'health',icon:'💊',label:'Sức khỏe'},{id:'kids',icon:'👶',label:'Con cái'},{id:'shopping',icon:'🛍️',label:'Mua sắm'},{id:'fun',icon:'🎮',label:'Giải trí'},{id:'debt',icon:'💳',label:'Trả nợ'},{id:'other',icon:'📌',label:'Khác'}];
const ICATS=[{id:'salary',icon:'💼',label:'Lương'},{id:'bonus',icon:'🎁',label:'Thưởng'},{id:'invest',icon:'📈',label:'Đầu tư'},{id:'rent',icon:'🏠',label:'Cho thuê'},{id:'side',icon:'💻',label:'Làm thêm'},{id:'iother',icon:'💰',label:'Thu khác'}];
const DQUICK=[{icon:'🍜',label:'Ăn sáng',on:true},{icon:'🍚',label:'Ăn trưa',on:true},{icon:'🍲',label:'Ăn tối',on:true},{icon:'☕',label:'Cà phê',on:true},{icon:'⛽',label:'Xăng',on:true},{icon:'🛒',label:'Đi chợ',on:true},{icon:'💸',label:'Lương vợ',on:true},{icon:'🍻',label:'Ăn bạn bè',on:true},{icon:'🎖️',label:'Đảng phí',on:true},{icon:'🤖',label:'Tài khoản AI',on:true},{icon:'💳',label:'Trả nợ',on:true},{icon:'🎓',label:'Luận án TS',on:true,subItems:[
  {icon:'🖨️',label:'In ấn'},{icon:'📚',label:'Rải quyển'},{icon:'🧑‍🏫',label:'Xin ý kiến CG'},{icon:'📬',label:'Gửi quyển HĐ'},{icon:'🏢',label:'Công tác TC'},{icon:'🚗',label:'Cảm ơn lái xe'},
  {icon:'📊',label:'Tích lũy CS'},{icon:'🏦',label:'Tích lũy HV'},{icon:'📝',label:'Tích lũy XN'},{icon:'🏠',label:'Chi cơ sở'},{icon:'🗣️',label:'Chi xemina'},{icon:'🎓',label:'Chi học viện'}
]}];
// ICON SUGGESTIONS for custom items
const ICON_SUGGESTIONS=[
  {icon:'💸',label:'Chi tiêu'},  {icon:'🍜',label:'Ăn uống'},  {icon:'☕',label:'Cà phê'},  {icon:'⛽',label:'Xăng xe'},
  {icon:'🛒',label:'Đi chợ'},   {icon:'💊',label:'Thuốc'},     {icon:'🏥',label:'Bệnh viện'}, {icon:'🚕',label:'Grab/Taxi'},
  {icon:'✈️',label:'Du lịch'},  {icon:'🏠',label:'Nhà cửa'},  {icon:'📱',label:'Điện thoại'},{icon:'💡',label:'Điện/Nước'},
  {icon:'👶',label:'Con cái'},   {icon:'🎮',label:'Giải trí'}, {icon:'🛍️',label:'Mua sắm'},  {icon:'🎁',label:'Quà tặng'},
  {icon:'📚',label:'Sách vở'},  {icon:'🏋️',label:'Gym/Thể thao'},{icon:'💈',label:'Cắt tóc'},  {icon:'🧴',label:'Mỹ phẩm'},
  {icon:'🍻',label:'Nhậu/Bạn bè'},{icon:'🎖️',label:'Đảng phí'},{icon:'🤖',label:'AI/Tech'},  {icon:'🎓',label:'Học tập/TS'},
  {icon:'🖨️',label:'In ấn'},    {icon:'📬',label:'Bưu điện'}, {icon:'🏢',label:'Công tác'},  {icon:'🚗',label:'Xe cộ'},
  {icon:'💰',label:'Đưa tiền'}, {icon:'🏦',label:'Ngân hàng'},{icon:'📌',label:'Khác'},      {icon:'🎯',label:'Mục tiêu'}
];
// AMOUNT SUGGESTIONS
const AMT_SUGGESTIONS=[20000,30000,50000,100000,150000,200000,300000,500000,1000000,2000000,5000000,10000000];
let selCat='food',selQuickCat='other',editId=null,editDate=null,editType=null,addMode='expense',qIcon='',qLabel='',pendingCalDate=null;
function tk(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function mp(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function gid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function fm(n){return Math.abs(n).toLocaleString('vi-VN')+' đ'}
function fmInput(n){return Math.abs(n).toLocaleString('vi-VN')}
function fk(n){if(n>=1000000)return (n/1000000).toFixed(n%1000000===0?0:1)+'M';if(n>=1000)return Math.round(n/1000)+'k';return n+'đ'}
function parseAmt(s){return parseInt(String(s).replace(/[^0-9]/g,''))||0}
function ts(t){const d=new Date(t);return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}
function gd(k,t){return(JSON.parse(localStorage.getItem(t)||'{}')[k])||{}}
function ga(t){return JSON.parse(localStorage.getItem(t)||'{}')}
function sv(k,id,e,t){const d=ga(t);if(!d[k])d[k]={};d[k][id]=e;localStorage.setItem(t,JSON.stringify(d))}
function dl(k,id,t){const d=ga(t);if(d[k]){delete d[k][id];if(!Object.keys(d[k]).length)delete d[k]}localStorage.setItem(t,JSON.stringify(d))}
function gq(){return JSON.parse(localStorage.getItem('quickBtns')||'null')||DQUICK}
function sq(v){localStorage.setItem('quickBtns',JSON.stringify(v))}
function show(id){document.getElementById(id)?.classList.remove('hidden')}
function hide(id){document.getElementById(id)?.classList.add('hidden')}
function toast(m){const e=document.getElementById('toast');e.textContent=m;e.classList.remove('hidden');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.add('hidden'),3000)}
function snd(){try{const c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sine';o.frequency.setValueAtTime(660,c.currentTime);o.frequency.exponentialRampToValueAtTime(440,c.currentTime+.15);g.gain.setValueAtTime(.2,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.2);o.start();o.stop(c.currentTime+.22)}catch(e){}}
window.addEventListener('DOMContentLoaded',()=>{
  migrateQuickBtns();
  const n=new Date(),dn=['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
  document.getElementById('date-display').textContent=`${dn[n.getDay()]}, ${n.getDate()}/${n.getMonth()+1}/${n.getFullYear()}`;
  renderQuick();renderToday();updateHero();
  setupAmtInput('quick-amount');setupAmtInput('add-amount');setupAmtInput('edit-amount');
  hide('loading-screen');show('app');
});
function migrateQuickBtns(){
  const saved=JSON.parse(localStorage.getItem('quickBtns')||'null');
  if(!saved)return;
  // Cập nhật sub-items mới cho Luận án TS
  const newSubItems=DQUICK.find(b=>b.label==='Luận án TS')?.subItems||[];
  let changed=false;
  saved.forEach(b=>{
    if(b.label==='Luận án TS'){
      const existingLabels=(b.subItems||[]).map(s=>s.label);
      const toAdd=newSubItems.filter(s=>!existingLabels.includes(s.label));
      if(toAdd.length){b.subItems=[...(b.subItems||[]),...toAdd];changed=true;}
    }
  });
  if(changed)localStorage.setItem('quickBtns',JSON.stringify(saved));
}
function renderQuick(){const q=gq().filter(b=>b.on!==false),el=document.getElementById('quick-grid');el.innerHTML=q.map(b=>{const subStr=b.subItems?`,'${JSON.stringify(b.subItems).replace(/'/g,"\\'")}'`:'';return `<button class="quick-btn" onclick="openQuickAdd('${b.icon}','${b.label}',${b.subItems?'JSON.parse(decodeURIComponent(\''+encodeURIComponent(JSON.stringify(b.subItems))+'\'))':'null'})"><span>${b.icon}</span>${b.label}</button>`}).join('')}
function openQuickAdd(i,l,subItems){
  qIcon=i;qLabel=l;
  document.getElementById('quick-icon').textContent=i;
  document.getElementById('quick-label').textContent=l;
  document.getElementById('quick-amount').value='';
  document.getElementById('quick-note').value='';
  const t=tk();
  const qd=document.getElementById('quick-date');
  if(qd){qd.value=t;qd.removeAttribute('max');}
  // Sub-items
  const subEl=document.getElementById('quick-subitems');
  if(subEl){if(subItems&&subItems.length){subEl.innerHTML='<div class="modal-label">Chọn đầu việc:</div><div class="sub-item-grid">'+subItems.map(s=>`<button class="sub-item-btn" onclick="selectSubItem('${s.icon}','${s.label}',this)">${s.icon}<br><small>${s.label}</small></button>`).join('')+'</div>';subEl.classList.remove('hidden')}else{subEl.innerHTML='';subEl.classList.add('hidden');}}
  // Hiện danh mục nếu icon không khớp category
  const matchedCat=CATS.find(x=>x.icon===i);
  selQuickCat=matchedCat?matchedCat.id:'other';
  const catSec=document.getElementById('quick-cat-section');
  const catGrid=document.getElementById('quick-cat-grid');
  if(catSec&&catGrid){
    catGrid.innerHTML=CATS.map(c=>`<button class="qcat-btn${c.id===selQuickCat?' active':''}" onclick="selQuickCat='${c.id}';document.querySelectorAll('.qcat-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')"><span>${c.icon}</span><small>${c.label}</small></button>`).join('');
    catSec.classList.remove('hidden');
  }
  // Amount suggestions
  renderAmtSuggestions('quick-amt-suggestions','quick-amount');
  show('quick-modal');
  setTimeout(()=>document.getElementById('quick-amount').focus(),300);
}
function selectSubItem(icon,label,btn){document.querySelectorAll('.sub-item-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.getElementById('quick-note').value=label;qIcon=icon;document.getElementById('quick-icon').textContent=icon;}
function closeQuickModal(){hide('quick-modal')}
function confirmQuickAdd(){const a=parseAmt(document.getElementById('quick-amount').value);if(!a||a<=0){toast('⚠️ Nhập số tiền!');return}const c=selQuickCat||CATS.find(x=>x.icon===qIcon)?.id||'other';const n=document.getElementById('quick-note').value.trim();const dk=(document.getElementById('quick-date')?.value)||tk();sv(dk,gid(),{category:c,amount:a,note:n||qLabel,createdAt:Date.now()},'expenses');closeQuickModal();snd();if(dk===tk())renderToday();updateHero();const pcd=pendingCalDate;if(pcd){renderCal();showCalDet(pcd);}const label=dk!==tk()?` (${dk.split('-').reverse().slice(0,2).join('/')})`:'' ;toast(`💸 ${n||qLabel}: −${fm(a)}${label}`)}

function renderToday(){const exp=gd(tk(),'expenses'),inc=gd(tk(),'income');const all=[...Object.entries(exp).map(([id,e])=>({id,...e,type:'expense'})),...Object.entries(inc).map(([id,e])=>({id,...e,type:'income'}))].sort((a,b)=>b.createdAt-a.createdAt);const el=document.getElementById('today-list');if(!all.length){el.innerHTML='<div class="empty-msg">Chưa có giao dịch nào 🎉</div>';return}el.innerHTML=all.map(e=>{const cats=e.type==='expense'?CATS:ICATS;const c=cats.find(x=>x.id===e.category)||cats[cats.length-1];const cls=e.type==='expense'?'exp-val red-txt':'exp-val green-txt';const sign=e.type==='expense'?'−':'+';return `<div class="expense-row type-${e.type}" onclick="openEditModal('${e.id}','${tk()}','${e.type}')"><div class="exp-icon">${c.icon}</div><div class="exp-info"><div class="exp-name">${e.note||c.label}</div><div class="exp-note">${c.label} · ${ts(e.createdAt)}</div></div><div class="${cls}">${sign}${fm(e.amount)}</div></div>`}).join('')}
function updateHero(){const ex=ga('expenses'),ic=ga('income'),td=tk(),pf=mp();let tExp=0,tInc=0,wExp=0,wInc=0,mExp=0,mInc=0;Object.values(ex[td]||{}).forEach(e=>tExp+=e.amount);Object.values(ic[td]||{}).forEach(e=>tInc+=e.amount);const now=new Date(),dow=now.getDay(),mon=new Date(now);mon.setDate(now.getDate()-(dow===0?6:dow-1));for(let i=0;i<7;i++){const d=new Date(mon);d.setDate(mon.getDate()+i);const dk=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;Object.values(ex[dk]||{}).forEach(e=>wExp+=e.amount);Object.values(ic[dk]||{}).forEach(e=>wInc+=e.amount)}Object.entries(ex).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>mExp+=e.amount)});Object.entries(ic).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>mInc+=e.amount)});document.getElementById('hero-expense').textContent=fm(tExp);document.getElementById('hero-income').textContent=fm(tInc);const bal=mInc-mExp;const bEl=document.getElementById('hero-balance');bEl.textContent=(bal>=0?'+':'−')+fm(bal);bEl.className=bal>=0?'green-txt bc-amount':'red-txt bc-amount';document.getElementById('week-expense').textContent=fm(wExp);document.getElementById('week-income').textContent=fm(wInc);document.getElementById('month-expense').textContent=fm(mExp);
}

function openAddModal(mode,preDate=null){
  addMode=mode;
  selCat=mode==='expense'?'food':'salary';
  document.getElementById('add-title').textContent=mode==='expense'?'💸 Thêm chi tiêu':'💰 Thêm thu nhập';
  const btn=document.getElementById('add-submit-btn');
  btn.textContent=mode==='expense'?'💸 Lưu chi tiêu':'💰 Lưu thu nhập';
  btn.className=mode==='expense'?'btn-submit':'btn-submit green-submit';
  const cats=mode==='expense'?CATS:ICATS;
  document.getElementById('cat-grid').innerHTML=cats.map(c=>`<button class="cat-btn${c.id===selCat?' active':''}" onclick="selectCat('${c.id}',this,'${mode}')"><span>${c.icon}</span>${c.label}</button>`).join('');
  document.getElementById('add-amount').value='';
  document.getElementById('add-note').value='';
  const sec=document.getElementById('add-subitems-section');
  if(sec)sec.classList.add('hidden');
  const today=tk();
  const ad=document.getElementById('add-date');
  if(ad){ad.value=preDate||today;}
  renderAmtSuggestions('add-amt-suggestions','add-amount');
  setupAmtInput('add-amount');
  show('add-modal');
}
function selectCat(id,btn,mode){
  selCat=id;
  document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const sec=document.getElementById('add-subitems-section');
  const grid=document.getElementById('add-subitems-grid');
  if(!sec||!grid)return;
  if(id==='other'){
    // Lấy các nút quick tùy chỉnh (không khớp danh mục chuẩn)
    const allQ=gq();
    const customItems=allQ.filter(q=>!CATS.slice(0,-1).find(c=>c.icon===q.icon&&c.id!=='other'));
    if(customItems.length){
      grid.innerHTML=customItems.map(q=>{
        if(q.subItems&&q.subItems.length){
          // Mục có đầu việc con: hiện sub-items nhỏ
          return `<div class="sub-choice-group"><div class="sub-choice-label">${q.icon} ${q.label}</div><div class="sub-choice-row">${q.subItems.map(s=>`<button class="sub-choice-btn" onclick="pickAddSubItem('${s.icon}','${s.label}',this)">${s.icon}<br><small>${s.label}</small></button>`).join('')}</div></div>`;
        }
        return `<button class="sub-choice-btn wide" onclick="pickAddSubItem('${q.icon}','${q.label}',this)">${q.icon} ${q.label}</button>`;
      }).join('');
      sec.classList.remove('hidden');
    } else {
      sec.classList.add('hidden');
    }
  } else {
    sec.classList.add('hidden');
    // Xoá ghi chú khi đổi sang danh mục khác
    const noteEl=document.getElementById('add-note');
    if(noteEl&&noteEl.dataset.fromSub==='1'){noteEl.value='';noteEl.dataset.fromSub='0';}
  }
}
function pickAddSubItem(icon,label,btn){
  document.querySelectorAll('.sub-choice-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const noteEl=document.getElementById('add-note');
  if(noteEl){noteEl.value=label;noteEl.dataset.fromSub='1';}
}
function closeAddModal(){document.getElementById('add-modal').classList.remove('above-cal');hide('add-modal');pendingCalDate=null}
function submitEntry(){const a=parseAmt(document.getElementById('add-amount').value);if(!a||a<=0){toast('⚠️ Nhập số tiền!');return}const dk=(document.getElementById('add-date')?.value)||tk();const pcd=pendingCalDate;const n=document.getElementById('add-note').value.trim();const cats=addMode==='expense'?CATS:ICATS;const c=cats.find(x=>x.id===selCat);const store=addMode==='expense'?'expenses':'income';sv(dk,gid(),{category:selCat,amount:a,note:n||c.label,createdAt:Date.now()},store);document.getElementById('add-modal').classList.remove('above-cal');hide('add-modal');pendingCalDate=null;snd();if(dk===tk())renderToday();updateHero();if(pcd){show('cal-modal');renderCal();showCalDet(pcd);}if(!document.getElementById('history-modal')?.classList.contains('hidden'))renderHistory();if(!document.getElementById('report-modal')?.classList.contains('hidden'))renderReport();const label=dk!==tk()?` (${dk.split('-').reverse().slice(0,2).join('/')})`:'' ;toast(addMode==='expense'?`💸 ${n||c.label}: −${fm(a)}${label}`:`💰 ${n||c.label}: +${fm(a)}${label}`)}
function openEditModal(id,dk,type){editId=id;editDate=dk;editType=type;const e=gd(dk,type==='expense'?'expenses':'income')[id];if(!e)return;document.getElementById('edit-amount').value=e.amount;document.getElementById('edit-note').value=e.note||'';show('edit-modal')}
function closeEditModal(){hide('edit-modal');editId=null}
function saveEdit(){if(!editId)return;const a=parseAmt(document.getElementById('edit-amount').value);if(!a||a<=0){toast('⚠️ Nhập số tiền!');return}const n=document.getElementById('edit-note').value.trim();const store=editType==='expense'?'expenses':'income';const ex=gd(editDate,store)[editId];sv(editDate,editId,{...ex,amount:a,note:n},store);closeEditModal();renderToday();updateHero();if(!document.getElementById('history-modal')?.classList.contains('hidden'))renderHistory();if(!document.getElementById('report-modal')?.classList.contains('hidden'))renderReport();toast('✅ Đã cập nhật!')}
function deleteEntry(){if(!editId||!confirm('Xóa giao dịch này?'))return;dl(editDate,editId,editType==='expense'?'expenses':'income');closeEditModal();renderToday();updateHero();if(!document.getElementById('history-modal')?.classList.contains('hidden'))renderHistory();if(!document.getElementById('report-modal')?.classList.contains('hidden'))renderReport();toast('🗑️ Đã xóa!')}


// QUICK SETTINGS - pick from ALL categories
function openQuickSettings(){tmpQuick=JSON.parse(JSON.stringify(gq()));renderQConfig();show('quick-settings-modal')}
function renderQConfig(){
const allCats=[...CATS,...ICATS];
const avail=allCats.filter(c=>!tmpQuick.find(q=>q.icon===c.icon&&q.label===c.label));
let h=tmpQuick.map((b,i)=>`<div class="qs-row"><span class="qs-drag">${b.icon} ${b.label}${b.subItems?` <small class="dim">(${b.subItems.length} đầu việc)</small>`:''}</span><div class="qs-btns"><button class="qs-btn" onclick="moveQ(${i},-1)">▲</button><button class="qs-btn" onclick="moveQ(${i},1)">▼</button><button class="qs-btn ${b.on!==false?'qs-on':'qs-off'}" onclick="toggleQ(${i})">${b.on!==false?'✅':'❌'}</button><button class="qs-btn qs-del" onclick="delQ(${i})">🗑️</button></div></div>`).join('');
if(avail.length){h+=`<div class="qs-label">Thêm từ danh mục:</div><div class="qs-pick-grid">${avail.map(c=>`<button class="qs-pick-btn" data-icon="${c.icon}" data-label="${c.label}" onclick="pickQuick('${c.icon}','${c.label}')">${c.icon}<br><small>${c.label}</small></button>`).join('')}</div>`}
// Icon suggestions
h+=`<div class="qs-label">🎨 Gợi ý icons khi thêm mục mới:</div><div class="icon-sug-grid">${ICON_SUGGESTIONS.map(s=>`<button class="icon-sug-btn" onclick="pickIconSuggestion('${s.icon}')" title="${s.label}">${s.icon}</button>`).join('')}</div>`;
document.getElementById('quick-config-list').innerHTML=h}
function pickQuick(icon,label){tmpQuick.push({icon,label,on:true});renderQConfig()}
function moveQ(i,d){const j=i+d;if(j<0||j>=tmpQuick.length)return;[tmpQuick[i],tmpQuick[j]]=[tmpQuick[j],tmpQuick[i]];renderQConfig()}
function toggleQ(i){tmpQuick[i].on=tmpQuick[i].on===false?true:false;renderQConfig()}
function delQ(i){tmpQuick.splice(i,1);renderQConfig()}
function addCustomQuick(){const ic=document.getElementById('qs-new-icon').value.trim(),lb=document.getElementById('qs-new-label').value.trim();if(!ic||!lb){toast('⚠️ Nhập icon và tên!');return}tmpQuick.push({icon:ic,label:lb,on:true});document.getElementById('qs-new-icon').value='';document.getElementById('qs-new-label').value='';renderQConfig()}
function pickIconSuggestion(icon){document.getElementById('qs-new-icon').value=icon;document.querySelectorAll('.icon-sug-btn').forEach(b=>b.classList.remove('active'));event.target.closest('.icon-sug-btn').classList.add('active');}
function renderAmtSuggestions(containerId,inputId){const el=document.getElementById(containerId);if(!el)return;el.innerHTML=AMT_SUGGESTIONS.map(v=>`<button class="amt-sug-btn" onclick="setAmtSuggestion('${inputId}',${v},this)">${fk(v)}</button>`).join('')}
function setAmtSuggestion(inputId,val,btn){document.getElementById(inputId).value=fmInput(val);document.querySelectorAll('.amt-sug-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');formatAmountDisplay(inputId);}
function formatAmountDisplay(inputId){const el=document.getElementById(inputId);if(!el)return;const raw=parseAmt(el.value);if(raw>0){const pos=el.selectionStart;el.value=fmInput(raw);}}
function setupAmtInput(inputId){const el=document.getElementById(inputId);if(!el)return;el.addEventListener('input',()=>{const v=parseAmt(el.value);if(v>0)el.value=fmInput(v);else if(el.value==='')el.value='';});el.addEventListener('focus',()=>{const v=parseAmt(el.value);if(v>0)el.value=fmInput(v);});el.addEventListener('blur',()=>{const v=parseAmt(el.value);if(v>0)el.value=fmInput(v);else el.value='';})}
function updateDateBtn(inputId,btnId,spanId){
  const inp=document.getElementById(inputId);
  const btn=document.getElementById(btnId);
  const spanEl=spanId?document.getElementById(spanId):btn?.querySelector('span');
  if(!inp||!spanEl)return;
  if(!inp.value){spanEl.textContent='Hôm nay';return;}
  const[y,m,d]=inp.value.split('-');
  const dn=['CN','T2','T3','T4','T5','T6','T7'];
  const dt=new Date(parseInt(y),parseInt(m)-1,parseInt(d));
  const isToday=inp.value===tk();
  spanEl.textContent=isToday?'Hôm nay ✓':`${dn[dt.getDay()]} ${parseInt(d)}/${parseInt(m)}/${y}`;
}
function saveQuickSettings(){sq(tmpQuick);closeQuickSettings();renderQuick();toast('✅ Đã lưu cài đặt!')}
// STATS
function openStatsModal(){switchTab('day');show('stats-modal')}
function closeStatsModal(){hide('stats-modal')}
function switchTab(t){['day','week','month','compare','cat'].forEach(x=>{document.getElementById('stab-'+x)?.classList.remove('active');document.getElementById('spanel-'+x)?.classList.add('hidden')});document.getElementById('stab-'+t).classList.add('active');document.getElementById('spanel-'+t).classList.remove('hidden');if(t==='day')loadDay();if(t==='week')loadWeek();if(t==='month')loadMonth();if(t==='compare')loadCompare();if(t==='cat')loadCatStats()}
function loadDay(){const e=Object.values(gd(tk(),'expenses')).sort((a,b)=>b.amount-a.amount),t=e.reduce((s,x)=>s+x.amount,0);document.getElementById('sd-total').textContent=fm(t);document.getElementById('sd-list').innerHTML=e.length?e.map(x=>{const c=CATS.find(z=>z.id===x.category)||CATS[11];return `<div class="stat-row"><span>${c.icon} ${x.note||c.label} <small class="dim">${ts(x.createdAt)}</small></span><span class="red-txt fw">−${fm(x.amount)}</span></div>`}).join(''):'<div class="empty-msg">Chưa có chi tiêu</div>'}
function loadWeek(){const ex=ga('expenses'),now=new Date(),dow=now.getDay(),mon=new Date(now);mon.setDate(now.getDate()-(dow===0?6:dow-1));const dn=['CN','T2','T3','T4','T5','T6','T7'];let wt=0,mx='',mv=0;const rows=Array.from({length:7},(_,i)=>{const d=new Date(mon);d.setDate(mon.getDate()+i);const dk=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;const dd=ex[dk]||{},v=Object.values(dd).reduce((s,e)=>s+e.amount,0),n=Object.keys(dd).length;if(v>mv){mv=v;mx=`${dn[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}`}wt+=v;const f=d>now,td=dk===tk();return `<div class="stat-row${td?' stat-today':''}"><span>${dn[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}${td?' 👈':''}</span><span>${f?'—':`<span class="red-txt fw">−${fm(v)}</span>`}${n?` <small class="dim">(${n})</small>`:''}</span></div>`}).join('');document.getElementById('sw-total').textContent=fm(wt);document.getElementById('sw-list').innerHTML=rows;document.getElementById('sw-best').innerHTML=mx&&mv>0?`📛 <b>Chi nhiều nhất:</b> ${mx} — <span class="red-txt fw">−${fm(mv)}</span>`:''}
function loadMonth(){const ex=ga('expenses'),pf=mp();let mt=0,ti=0,ad=0;const wm={};Object.entries(ex).forEach(([k,v])=>{if(!k.startsWith(pf))return;const es=Object.values(v),dv=es.reduce((s,e)=>s+e.amount,0);ti+=es.length;ad++;mt+=dv;const w=Math.ceil(new Date(k).getDate()/7);wm[w]=(wm[w]||0)+dv});document.getElementById('sm-total').textContent=fm(mt);document.getElementById('sm-summary').innerHTML=`<div class="mini-card"><div class="mc-val">${ti}</div><div class="mc-lbl">Khoản chi</div></div><div class="mini-card"><div class="mc-val">${ad}</div><div class="mc-lbl">Ngày có chi</div></div><div class="mini-card"><div class="mc-val red">${ad>0?fm(Math.round(mt/ad)):'0đ'}</div><div class="mc-lbl">TB/ngày</div></div>`;document.getElementById('sm-weeks').innerHTML=Object.entries(wm).sort(([a],[b])=>a-b).map(([w,v])=>`<div class="stat-row"><span>📅 Tuần ${w}</span><span class="red-txt fw">−${fm(v)}</span></div>`).join('')||'<div class="empty-msg">Chưa có</div>'}

function loadCompare(){const ex=ga('expenses'),ic=ga('income'),pf=mp();let mExp=0,mInc=0,eCnt=0,iCnt=0;Object.entries(ex).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>{mExp+=e.amount;eCnt++})});Object.entries(ic).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>{mInc+=e.amount;iCnt++})});const bal=mInc-mExp,rate=mInc>0?Math.round((mInc-mExp)/mInc*100):0;document.getElementById('sc-compare').innerHTML=`<div class="cmp-hero"><div class="cmp-card green-card"><div class="cmp-icon">💰</div><div class="cmp-val green-txt">${fm(mInc)}</div><div class="cmp-lbl">Thu nhập (${iCnt} khoản)</div></div><div class="cmp-vs">VS</div><div class="cmp-card red-card"><div class="cmp-icon">💸</div><div class="cmp-val red-txt">${fm(mExp)}</div><div class="cmp-lbl">Chi tiêu (${eCnt} khoản)</div></div></div><div class="cmp-result ${bal>=0?'cmp-pos':'cmp-neg'}"><div class="cmp-result-label">${bal>=0?'🎉 Tiết kiệm được':'⚠️ Chi vượt thu'}</div><div class="cmp-result-val">${bal>=0?'+':'−'}${fm(bal)}</div>${mInc>0?`<div class="cmp-rate">Tỷ lệ tiết kiệm: <b>${rate}%</b></div>`:''}</div><div class="cmp-bar-wrap"><div class="cmp-bar-label"><span class="green-txt">Thu</span><span class="red-txt">Chi</span></div><div class="cmp-bar"><div class="cmp-bar-green" style="width:${mInc+mExp>0?Math.round(mInc/(mInc+mExp)*100):50}%"></div><div class="cmp-bar-red" style="width:${mInc+mExp>0?Math.round(mExp/(mInc+mExp)*100):50}%"></div></div></div>`}
function loadCatStats(){const ex=ga('expenses'),pf=mp(),cm={};Object.entries(ex).forEach(([k,v])=>{if(!k.startsWith(pf))return;Object.values(v).forEach(e=>{if(!cm[e.category])cm[e.category]={total:0,count:0};cm[e.category].total+=e.amount;cm[e.category].count++})});const r=Object.entries(cm).map(([id,d])=>{const c=CATS.find(x=>x.id===id)||CATS[11];return{...c,...d}}).sort((a,b)=>b.total-a.total);if(!r.length){document.getElementById('sc-cat-list').innerHTML='<div class="empty-msg">Chưa có dữ liệu</div>';return}const md=['🥇','🥈','🥉'];document.getElementById('sc-cat-list').innerHTML=r.map((it,i)=>{const b=Math.max(4,Math.round(it.total/r[0].total*100));return `<div class="rank-row"><div class="rank-medal">${md[i]||`${i+1}.`}</div><div class="rank-info"><div class="rank-name">${it.icon} ${it.label}</div><div class="rank-bar-wrap"><div class="rank-bar red-bar" style="width:${b}%"></div></div><div class="rank-meta">${it.count} lần · <span class="red-txt fw">−${fm(it.total)}</span></div></div></div>`}).join('')}
// CALENDAR
let calY,calM;
function openCalModal(){const n=new Date();calY=n.getFullYear();calM=n.getMonth();renderCal();hide('cal-detail');show('cal-modal')}
function closeCalModal(){hide('cal-modal')}
function calPrev(){calM--;if(calM<0){calM=11;calY--}renderCal();hide('cal-detail')}
function calNext(){calM++;if(calM>11){calM=0;calY++}renderCal();hide('cal-detail')}
function renderCal(){const mn=['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];document.getElementById('cal-label').textContent=`${mn[calM]} / ${calY}`;const ex=ga('expenses'),ic=ga('income'),fd=new Date(calY,calM,1).getDay(),dm=new Date(calY,calM+1,0).getDate(),now=new Date(),ts2=tk();let h='';for(let i=0;i<fd;i++)h+='<div class="cal-cell empty"></div>';for(let d=1;d<=dm;d++){const dk=`${calY}-${String(calM+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;const td=dk===ts2?' cal-today':'',fu=new Date(calY,calM,d)>now;let am='';if(!fu){const ev=Object.values(ex[dk]||{}).reduce((s,e)=>s+e.amount,0),iv=Object.values(ic[dk]||{}).reduce((s,e)=>s+e.amount,0);if(ev||iv)am=`<div class="cal-amount ${iv>ev?'green-txt':'red-txt'}">${ev?'-'+fk(ev):''}${iv&&ev?' ':''}${iv?'+'+fk(iv):''}</div>`}h+=`<div class="cal-cell${td}" onclick="showCalDet('${dk}')"><span class="cal-day-num">${d}</span>${am}</div>`}document.getElementById('cal-grid').innerHTML=h}
function showCalDet(dk){pendingCalDate=dk;const ex=gd(dk,'expenses'),ic=gd(dk,'income');const[y,m,d]=dk.split('-');document.getElementById('cal-detail-title').textContent=`📋 Ngày ${parseInt(d)}/${parseInt(m)}`;const all=[...Object.values(ex).map(e=>({...e,type:'expense'})),...Object.values(ic).map(e=>({...e,type:'income'}))];if(!all.length){document.getElementById('cal-detail-list').innerHTML='<div class="empty-msg">Chưa có giao dịch</div>'}else{let te=0,ti=0;const rows=all.sort((a,b)=>b.amount-a.amount).map(e=>{const cats=e.type==='expense'?CATS:ICATS,c=cats.find(x=>x.id===e.category)||cats[cats.length-1];if(e.type==='expense')te+=e.amount;else ti+=e.amount;const cls=e.type==='expense'?'red-txt':'green-txt',sg=e.type==='expense'?'−':'+';return `<div class="cal-det-row"><span>${c.icon} ${e.note||c.label}</span><span class="${cls} fw">${sg}${fm(e.amount)}</span></div>`}).join('');document.getElementById('cal-detail-list').innerHTML=rows+`<div class="cal-det-total"><span>Chi: <b class="red-txt">−${fm(te)}</b></span><span>Thu: <b class="green-txt">+${fm(ti)}</b></span><span>Dư: <b class="${ti-te>=0?'green-txt':'red-txt'}">${ti-te>=0?'+':'−'}${fm(ti-te)}</b></span></div>`}const actEl=document.getElementById('cal-detail-actions');if(actEl){actEl.innerHTML=`<button class="fab fab-red" style="flex:1;padding:10px;font-size:13px" onclick="openAddFromCal('${dk}','expense')">＋ Thêm chi</button><button class="fab fab-green" style="flex:1;padding:10px;font-size:13px" onclick="openAddFromCal('${dk}','income')">＋ Thêm thu</button>`;}show('cal-detail')}
function openAddFromCal(dk,mode){pendingCalDate=dk;document.getElementById('cal-modal').classList.add('hidden');document.getElementById('add-modal').classList.remove('above-cal');openAddModal(mode,dk);}




function runAiAnalysis(){const ex=ga('expenses'),ic=ga('income'),pf=mp();let mExp=0,mInc=0,catTotals={},days=0,prevPf=(() => {const d=new Date();d.setMonth(d.getMonth()-1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`})();let prevExp=0;
Object.entries(ex).forEach(([k,v])=>{if(k.startsWith(pf)){days++;Object.values(v).forEach(e=>{mExp+=e.amount;catTotals[e.category]=(catTotals[e.category]||0)+e.amount})}if(k.startsWith(prevPf))Object.values(v).forEach(e=>prevExp+=e.amount)});
Object.entries(ic).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>mInc+=e.amount)});
const bal=mInc-mExp,rate=mInc>0?Math.round((mInc-mExp)/mInc*100):0;
const topCats=Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id,v])=>{const c=CATS.find(x=>x.id===id)||{icon:'📌',label:'Khác'};return{...c,total:v}});
const avgDay=days>0?Math.round(mExp/days):0;
const daysLeft=new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate()-new Date().getDate();
const projected=mExp+avgDay*daysLeft;
const change=prevExp>0?Math.round((mExp-prevExp)/prevExp*100):0;
let tips=[];
if(rate<10&&mInc>0)tips.push('⚠️ Tỷ lệ tiết kiệm thấp (<10%). Cố gắng cắt giảm chi tiêu không cần thiết.');
if(rate>=30)tips.push('🌟 Tuyệt vời! Tỷ lệ tiết kiệm trên 30%. Hãy duy trì!');
if(topCats[0]&&topCats[0].total>mExp*0.4)tips.push(`📛 "${topCats[0].label}" chiếm ${Math.round(topCats[0].total/mExp*100)}% tổng chi. Cân nhắc giảm mục này.`);
if(change>20)tips.push(`📈 Chi tiêu tháng này tăng ${change}% so với tháng trước.`);
if(change<-10)tips.push(`📉 Tốt! Chi tiêu giảm ${Math.abs(change)}% so với tháng trước.`);
if(bal<0)tips.push('🔴 Chi vượt thu! Cần kiểm soát chi tiêu ngay.');
if(daysLeft>0&&projected>mInc&&mInc>0)tips.push(`⚡ Dự kiến chi ${fm(projected)} cuối tháng, vượt thu nhập ${fm(mInc)}.`);
if(!tips.length)tips.push('✅ Tài chính ổn định. Tiếp tục theo dõi hàng ngày!');
document.getElementById('ai-content').innerHTML=`
<div class="ai-section"><div class="ai-title">📊 Tổng quan tháng</div>
<div class="ai-grid"><div class="ai-item"><span class="green-txt fw">${fm(mInc)}</span><small>Thu nhập</small></div><div class="ai-item"><span class="red-txt fw">${fm(mExp)}</span><small>Chi tiêu</small></div><div class="ai-item"><span class="${bal>=0?'green-txt':'red-txt'} fw">${bal>=0?'+':'−'}${fm(bal)}</span><small>Số dư</small></div></div></div>
<div class="ai-section"><div class="ai-title">🏆 Top chi tiêu</div>${topCats.map((c,i)=>`<div class="ai-cat-row"><span>${['🥇','🥈','🥉'][i]} ${c.icon} ${c.label}</span><span class="red-txt fw">${fm(c.total)} (${Math.round(c.total/mExp*100)}%)</span></div>`).join('')||'<span class="dim">Chưa có dữ liệu</span>'}</div>
<div class="ai-section"><div class="ai-title">📈 Phân tích</div>
<div class="ai-stat">TB/ngày: <b>${fm(avgDay)}</b></div>
<div class="ai-stat">Dự kiến cuối tháng: <b class="red-txt">${fm(projected)}</b></div>
${mInc>0?`<div class="ai-stat">Tỷ lệ tiết kiệm: <b class="${rate>=20?'green-txt':'red-txt'}">${rate}%</b></div>`:''}
${prevExp>0?`<div class="ai-stat">So tháng trước: <b class="${change<=0?'green-txt':'red-txt'}">${change>=0?'+':''}${change}%</b></div>`:''}</div>
<div class="ai-section"><div class="ai-title">💡 Lời khuyên</div>${tips.map(t=>`<div class="ai-tip">${t}</div>`).join('')}</div>`}

// MULTI AI PROVIDER
let aiProvider='gemini';
const AI_URLS={gemini:'https://aistudio.google.com/apikey',gpt:'https://platform.openai.com/api-keys',claude:'https://console.anthropic.com/settings/keys'};
const AI_NAMES={gemini:'✨ Gemini',gpt:'🧠 GPT',claude:'🟠 Claude'};
function selectProvider(p){aiProvider=p;['gemini','gpt','claude'].forEach(x=>{document.getElementById('ptab-'+x).classList.remove('active')});document.getElementById('ptab-'+p).classList.add('active');const k=localStorage.getItem('aiKey_'+p)||'';document.getElementById('ai-api-key').value=k;document.getElementById('ai-key-hint').innerHTML=`Lấy key tại <a href="${AI_URLS[p]}" target="_blank" style="color:var(--primary)">${AI_URLS[p].replace('https://','')}</a>`}
function saveAiKey(){const k=document.getElementById('ai-api-key').value.trim();if(k){localStorage.setItem('aiKey_'+aiProvider,k);snd();toast(`✅ Đã lưu key ${AI_NAMES[aiProvider]}!`)}else{localStorage.removeItem('aiKey_'+aiProvider);toast('🗑️ Đã xóa key')}}
function openAiModal(){const k=localStorage.getItem('aiKey_'+aiProvider)||'';document.getElementById('ai-api-key').value=k;runAiAnalysis();show('ai-modal')}
function closeAiModal(){hide('ai-modal')}
function buildCtx(){const ex=ga('expenses'),ic=ga('income'),pf=mp();let mE=0,mI=0,cats={};Object.entries(ex).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>{mE+=e.amount;cats[e.category]=(cats[e.category]||0)+e.amount})});Object.entries(ic).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>mI+=e.amount)});const top=Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([id,v])=>{const c=CATS.find(x=>x.id===id)||{label:'Khac'};return `${c.label}: ${fm(v)}`}).join(', ');return `Thu nhap thang: ${fm(mI)}. Chi tieu thang: ${fm(mE)}. So du: ${fm(mI-mE)}. Top chi tieu: ${top}.`}
async function askAi(){const q=document.getElementById('ai-question').value.trim();if(!q){toast('⚠️ Nhập câu hỏi!');return}const key=localStorage.getItem('aiKey_'+aiProvider);if(!key){toast('⚠️ Nhập API Key trước!');return}snd();const el=document.getElementById('ai-reply');el.innerHTML='<div class="ai-gemini-msg">⏳ Đang hỏi AI...</div>';const ctx=buildCtx();const prompt=`Ban la chuyen gia tu van tai chinh ca nhan. Du lieu: ${ctx}\n\nCau hoi: ${q}\n\nTra loi ngan gon bang tieng Viet.`;try{let txt='';if(aiProvider==='gemini'){const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})});const d=await r.json();txt=d.candidates?.[0]?.content?.parts?.[0]?.text||'Khong nhan duoc phan hoi.'}else if(aiProvider==='gpt'){const r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model:'gpt-4o-mini',messages:[{role:'user',content:prompt}]})});const d=await r.json();txt=d.choices?.[0]?.message?.content||'Khong nhan duoc phan hoi.'}else if(aiProvider==='claude'){const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1024,messages:[{role:'user',content:prompt}]})});const d=await r.json();txt=d.content?.[0]?.text||'Khong nhan duoc phan hoi.'}el.innerHTML=`<div class="ai-gemini-msg">🤖 <b>${AI_NAMES[aiProvider]}:</b>\n${txt}</div>`;snd()}catch(e){el.innerHTML=`<div class="ai-gemini-msg" style="border-color:var(--red)">❌ Loi: ${e.message}</div>`}document.getElementById('ai-question').value=''}

function closeQuickSettings(){hide('quick-settings-modal')}

function buildFullCtx(){const ex=ga('expenses'),ic=ga('income'),pf=mp();let mE=0,mI=0,cats={},items=[];Object.entries(ex).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>{mE+=e.amount;cats[e.category]=(cats[e.category]||0)+e.amount;items.push(`${e.note||e.category}: -${fm(e.amount)}`)})});Object.entries(ic).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>{mI+=e.amount})});const top=Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([id,v])=>{const c=CATS.find(x=>x.id===id)||{label:'Khac'};return `${c.label}: ${fm(v)}`}).join('\n');return `Toi can tu van tai chinh. Day la du lieu thang nay:\n\nThu nhap: ${fm(mI)}\nChi tieu: ${fm(mE)}\nSo du: ${fm(mI-mE)}\n\nTop danh muc chi tieu:\n${top}\n\nHay phan tich va cho loi khuyen tai chinh cu the.`}
function copyContext(){const txt=buildFullCtx();navigator.clipboard.writeText(txt).then(()=>{snd();toast('📋 Đã copy dữ liệu! Dán vào AI chat.')}).catch(()=>toast('❌ Không copy được'))}
function openAiWeb(p){const txt=buildFullCtx();navigator.clipboard.writeText(txt).then(()=>{snd();toast('📋 Đã copy! Dán vào chat AI.')}).catch(()=>{});const urls={gemini:'https://gemini.google.com/',gpt:'https://chat.openai.com/',claude:'https://claude.ai/'};window.open(urls[p],'_blank')}

// TOUCH DRAG SYSTEM (works on iPhone + desktop)
function makeSortable(container, items, onReorder) {
  let srcIdx = null, clone = null, startY = 0, longPress = null;
  items.forEach((el, i) => {
    el.dataset.idx = i;
    // Desktop drag
    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', e => { srcIdx = i; el.style.opacity = '0.4'; });
    el.addEventListener('dragend', () => { el.style.opacity = '1'; srcIdx = null; items.forEach(x => x.classList.remove('qs-drag-over')); });
    el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('qs-drag-over'); });
    el.addEventListener('dragleave', () => el.classList.remove('qs-drag-over'));
    el.addEventListener('drop', e => { e.preventDefault(); el.classList.remove('qs-drag-over'); if (srcIdx !== null && srcIdx !== i) onReorder(srcIdx, i); });
    // Mobile touch
    el.addEventListener('touchstart', e => {
      startY = e.touches[0].clientY;
      longPress = setTimeout(() => {
        srcIdx = i; el.style.opacity = '0.4'; el.style.background = 'rgba(96,165,250,0.2)';
        snd();
      }, 400);
    }, { passive: true });
    el.addEventListener('touchmove', e => {
      if (Math.abs(e.touches[0].clientY - startY) > 10 && longPress) { clearTimeout(longPress); longPress = null; }
      if (srcIdx === null) return;
      e.preventDefault();
      const t = e.touches[0];
      items.forEach(x => x.classList.remove('qs-drag-over'));
      const target = document.elementFromPoint(t.clientX, t.clientY);
      if (target) { const row = target.closest('[data-idx]'); if (row) row.classList.add('qs-drag-over'); }
    }, { passive: false });
    el.addEventListener('touchend', e => {
      clearTimeout(longPress); longPress = null;
      el.style.opacity = '1'; el.style.background = '';
      if (srcIdx === null) return;
      const t = e.changedTouches[0];
      const target = document.elementFromPoint(t.clientX, t.clientY);
      items.forEach(x => x.classList.remove('qs-drag-over'));
      if (target) {
        const row = target.closest('[data-idx]');
        if (row) { const to = parseInt(row.dataset.idx); if (srcIdx !== to) onReorder(srcIdx, to); }
      }
      srcIdx = null;
    });
  });
}

function initDrag() {
  const list = document.getElementById('quick-config-list'); if (!list) return;
  const rows = Array.from(list.querySelectorAll('.qs-row'));
  if (rows.length) makeSortable(list, rows, (from, to) => {
    const item = tmpQuick.splice(from, 1)[0]; tmpQuick.splice(to, 0, item); renderQConfig();
  });
  // Picker: tap to add (touch drag from picker to list is unreliable on mobile)
  list.querySelectorAll('.qs-pick-btn').forEach(b => {
    b.setAttribute('draggable', 'true');
    b.addEventListener('dragstart', e => { b._drag = { icon: b.dataset.icon, label: b.dataset.label }; b.style.opacity = '0.4'; });
    b.addEventListener('dragend', () => { b.style.opacity = '1'; });
  });
  rows.forEach(r => {
    r.addEventListener('drop', e => {
      const picks = list.querySelectorAll('.qs-pick-btn');
      picks.forEach(p => { if (p._drag) { const to = parseInt(r.dataset.idx); tmpQuick.splice(to, 0, { icon: p._drag.icon, label: p._drag.label, on: true }); p._drag = null; renderQConfig(); } });
    });
  });
}
const origRQ = renderQConfig;
renderQConfig = function() { origRQ(); setTimeout(initDrag, 50); };

function initHomeDrag() {
  const grid = document.getElementById('quick-grid'); if (!grid) return;
  const btns = Array.from(grid.querySelectorAll('.quick-btn'));
  if (btns.length) makeSortable(grid, btns, (from, to) => {
    const q = gq(); const item = q.splice(from, 1)[0]; q.splice(to, 0, item); sq(q); renderQuick(); snd();
  });
}
const origRQuick = renderQuick;
renderQuick = function() { origRQuick(); setTimeout(initHomeDrag, 50); };

// ============================================================
// CURRENCY MODULE - 2-WAY FLEXIBLE
// ============================================================
const FX_ALL=[
  {code:'VND',flag:'🇻🇳',name:'Đồng Việt Nam',sym:'₫'},
  {code:'USD',flag:'🇺🇸',name:'Đô la Mỹ',sym:'$'},
  {code:'EUR',flag:'🇪🇺',name:'Euro',sym:'€'},
  {code:'GBP',flag:'🇬🇧',name:'Bảng Anh',sym:'£'},
  {code:'JPY',flag:'🇯🇵',name:'Yên Nhật',sym:'¥'},
  {code:'CNY',flag:'🇨🇳',name:'Nhân dân tệ',sym:'¥'},
  {code:'KRW',flag:'🇰🇷',name:'Won Hàn Quốc',sym:'₩'},
  {code:'SGD',flag:'🇸🇬',name:'Đô la Singapore',sym:'S$'},
  {code:'THB',flag:'🇹🇭',name:'Baht Thái',sym:'฿'},
  {code:'AUD',flag:'🇦🇺',name:'Đô la Úc',sym:'A$'},
  {code:'HKD',flag:'🇭🇰',name:'Đô la Hồng Kông',sym:'HK$'},
];
const FX_FALLBACK_VND={USD:0.0000390,EUR:0.0000360,GBP:0.0000305,JPY:0.00610,CNY:0.000283,KRW:0.0540,SGD:0.0000526,THB:0.00136,AUD:0.0000600,HKD:0.000305};
let _fxRatesVnd=null,_fxFetched=0,_fxFrom='VND',_fxTo='USD',_fxInitVnd=0;

function getCachedRates(){
  if(_fxRatesVnd&&Date.now()-_fxFetched<600000)return _fxRatesVnd;
  try{const c=sessionStorage.getItem('fxRates2');if(c){const p=JSON.parse(c);if(Date.now()-p.t<600000){_fxRatesVnd=p.r;_fxFetched=p.t;return _fxRatesVnd;}}}catch(e){}
  return null;
}
async function fetchRates(){
  const cached=getCachedRates();if(cached)return cached;
  try{
    const codes=FX_ALL.filter(c=>c.code!=='VND').map(c=>c.code).join(',');
    const r=await fetch(`https://api.frankfurter.app/latest?from=VND&to=${codes}`,{cache:'no-store'});
    if(!r.ok)throw new Error();
    const d=await r.json();
    _fxRatesVnd=d.rates;_fxFetched=Date.now();
    sessionStorage.setItem('fxRates2',JSON.stringify({r:_fxRatesVnd,t:_fxFetched}));
    return _fxRatesVnd;
  }catch(e){_fxRatesVnd={...FX_FALLBACK_VND};_fxFetched=Date.now();return _fxRatesVnd;}
}
function toVnd(a,f){if(f==='VND')return a;const r=(_fxRatesVnd||FX_FALLBACK_VND)[f];return r?a/r:a;}
function fromVnd(v,t){if(t==='VND')return v;const r=(_fxRatesVnd||FX_FALLBACK_VND)[t];return r?v*r:v;}
function fxConvert(a,f,t){return fromVnd(toVnd(a,f),t);}
function fxNumFmt(v,c){
  if(c==='JPY'||c==='KRW'||c==='VND')return v.toLocaleString('vi-VN',{maximumFractionDigits:0});
  if(v>=1000)return v.toLocaleString('vi-VN',{maximumFractionDigits:0});
  if(v>=1)return v.toFixed(2);return v.toFixed(4);
}
function buildFxSelects(){
  const fe=document.getElementById('fx-from'),te=document.getElementById('fx-to');if(!fe||!te)return;
  const opts=FX_ALL.map(c=>`<option value="${c.code}">${c.flag} ${c.code} — ${c.name}</option>`).join('');
  fe.innerHTML=opts;te.innerHTML=opts;fe.value=_fxFrom;te.value=_fxTo;
}
function onFxPairChange(){
  _fxFrom=document.getElementById('fx-from')?.value||'VND';
  _fxTo=document.getElementById('fx-to')?.value||'USD';
  const fi=FX_ALL.find(c=>c.code===_fxFrom);
  const pfx=document.getElementById('fx-input-prefix');if(pfx)pfx.textContent=fi?.sym||_fxFrom;
  const pe=document.getElementById('fx-presets'),ge=document.getElementById('fx-grid-section');
  if(pe)pe.style.display=_fxFrom==='VND'?'flex':'none';
  if(ge)ge.style.display=_fxFrom==='VND'?'block':'none';
  computeFxResult();
  if(_fxFrom==='VND')renderFxGrid(parseAmt(document.getElementById('fx-amount')?.value||'0'));
}
function computeFxResult(){
  const ae=document.getElementById('fx-amount'),rv=document.getElementById('fx-result-value'),rl=document.getElementById('fx-result-label'),rr=document.getElementById('fx-result-rate');
  if(!ae||!rv)return;
  const amt=parseAmt(ae.value)||0,result=fxConvert(amt,_fxFrom,_fxTo);
  const ti=FX_ALL.find(c=>c.code===_fxTo),fi=FX_ALL.find(c=>c.code===_fxFrom);
  rv.textContent=`${ti?.sym||''}${fxNumFmt(result,_fxTo)} ${_fxTo}`;
  rl.textContent=`${fxNumFmt(amt,_fxFrom)} ${_fxFrom} ${fi?.flag||''} → ${ti?.flag||''}`;
  rr.textContent=`1 ${_fxFrom} = ${fxNumFmt(fxConvert(1,_fxFrom,_fxTo),_fxTo)} ${_fxTo}`;
}
function swapFxPair(){
  const t=_fxFrom;_fxFrom=_fxTo;_fxTo=t;
  document.getElementById('fx-from').value=_fxFrom;document.getElementById('fx-to').value=_fxTo;onFxPairChange();
}
function renderFxGrid(vnd){
  const rates=_fxRatesVnd||FX_FALLBACK_VND,el=document.getElementById('fx-grid');if(!el)return;
  el.innerHTML=FX_ALL.filter(c=>c.code!=='VND'&&c.code!==_fxTo).map(c=>{
    const val=vnd>0?fxNumFmt(vnd*(rates[c.code]||0),c.code):'—';
    return `<div class="fx-row" onclick="navigator.clipboard.writeText('${val}').then(()=>toast('📋 ${val} ${c.code}'))"><div class="fx-left"><span class="fx-flag">${c.flag}</span><div class="fx-currency-info"><div class="fx-code">${c.code}</div><div class="fx-name">${c.name}</div></div></div><div class="fx-value">${val}</div></div>`;
  }).join('');
}
function setFxPreset(type){
  const ex=ga('expenses'),ic=ga('income'),td=tk(),pf=mp();let t=0;
  if(type==='today-expense')Object.values(ex[td]||{}).forEach(e=>t+=e.amount);
  else if(type==='month-expense')Object.entries(ex).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>t+=e.amount)});
  else if(type==='balance'){let mE=0,mI=0;Object.entries(ex).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>mE+=e.amount)});Object.entries(ic).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>mI+=e.amount)});t=Math.abs(mI-mE);}
  const el=document.getElementById('fx-amount');if(el){el.value=fmInput(t);computeFxResult();renderFxGrid(t);}
}
async function openCurrencyModal(){
  show('currency-modal');buildFxSelects();onFxPairChange();
  const el=document.getElementById('fx-amount');
  if(el){el.value=_fxInitVnd>0?fmInput(_fxInitVnd):'';el.oninput=()=>{computeFxResult();if(_fxFrom==='VND')renderFxGrid(parseAmt(el.value)||0);};}
  computeFxResult();if(_fxFrom==='VND')renderFxGrid(_fxInitVnd);
  const se=document.getElementById('fx-rate-status');if(se)se.textContent='🔄 Đang tải tỷ giá...';
  await fetchRates();
  if(se){se.textContent='✅ Tỷ giá thật thời gian thực';se.style.color='var(--green)';}
  const ue=document.getElementById('fx-updated');const n=new Date();
  if(ue)ue.textContent=`Cập nhật ${n.getHours()}:${String(n.getMinutes()).padStart(2,'0')} · frankfurter.app`;
  computeFxResult();if(_fxFrom==='VND')renderFxGrid(parseAmt(el?.value||'0'));
}
function openCurrencyModalWith(type){
  _fxFrom='VND';_fxTo='USD';_fxInitVnd=0;
  const ex=ga('expenses'),ic=ga('income'),td=tk(),pf=mp();
  if(type==='expense')Object.values(ex[td]||{}).forEach(e=>_fxInitVnd+=e.amount);
  else if(type==='income')Object.values(ic[td]||{}).forEach(e=>_fxInitVnd+=e.amount);
  else if(type==='balance'){let mE=0,mI=0;Object.entries(ex).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>mE+=e.amount)});Object.entries(ic).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>mI+=e.amount)});_fxInitVnd=Math.abs(mI-mE);}
  openCurrencyModal();
}
function closeCurrencyModal(){hide('currency-modal');}
function updateHeroFx(tExp,tInc,bal){
  const rates=getCachedRates();if(!rates)return;const r=rates['USD']||FX_FALLBACK_VND['USD'];
  const fmt=n=>n>=1?`≈ $${n.toFixed(2)}`:'';
  const eEl=document.getElementById('hero-expense-fx');if(eEl&&tExp>0)eEl.textContent=fmt(tExp*r);
  const iEl=document.getElementById('hero-income-fx');if(iEl&&tInc>0)iEl.textContent=fmt(tInc*r);
  const bEl=document.getElementById('hero-balance-fx');if(bEl&&bal!==0)bEl.textContent=fmt(Math.abs(bal)*r);
}

// ============================================================
// NEWS MODULE
// ============================================================
const NEWS_SOURCES={
  vnexpress:{name:'VnExpress',badge:'VnE',feeds:{hot:'https://vnexpress.net/rss/tin-moi-nhat.rss',business:'https://vnexpress.net/rss/kinh-doanh.rss',world:'https://vnexpress.net/rss/the-gioi.rss',sport:'https://vnexpress.net/rss/the-thao.rss'}},
  tuoitre:{name:'Tuổi Trẻ',badge:'TT',feeds:{hot:'https://tuoitre.vn/rss/tin-moi-nhat.rss',business:'https://tuoitre.vn/rss/kinh-doanh.rss',world:'https://tuoitre.vn/rss/the-gioi.rss',sport:'https://tuoitre.vn/rss/the-thao.rss'}},
  thanhnien:{name:'Thanh Niên',badge:'TN',feeds:{hot:'https://thanhnien.vn/rss/home.rss',business:'https://thanhnien.vn/rss/tai-chinh-kinh-doanh.rss',world:'https://thanhnien.vn/rss/the-gioi.rss',sport:'https://thanhnien.vn/rss/the-thao.rss'}},
  dantri:{name:'Dân Trí',badge:'DT',feeds:{hot:'https://dantri.com.vn/rss/home.rss',business:'https://dantri.com.vn/rss/kinh-doanh.rss',world:'https://dantri.com.vn/rss/the-gioi.rss',sport:'https://dantri.com.vn/rss/the-thao.rss'}},
};
let _newsSource='vnexpress',_newsCat='hot';
const RSS2JSON='https://api.rss2json.com/v1/api.json?rss_url=';
function openNewsModal(){show('news-modal');loadNews();}
function closeNewsModal(){hide('news-modal');}
function switchNews(src){_newsSource=src;document.querySelectorAll('.nstab').forEach(b=>b.classList.remove('active'));document.getElementById('nstab-'+src)?.classList.add('active');loadNews();}
function switchNewsCat(cat){_newsCat=cat;document.querySelectorAll('.nctab').forEach(b=>b.classList.remove('active'));document.getElementById('nctab-'+cat)?.classList.add('active');loadNews();}
function newsTimeAgo(pubDate){const d=new Date(pubDate),now=new Date(),diff=Math.floor((now-d)/60000);if(diff<1)return 'Vừa xong';if(diff<60)return `${diff} phút trước`;if(diff<1440)return `${Math.floor(diff/60)} giờ trước`;return `${Math.floor(diff/1440)} ngày trước`;}
async function loadNews(){
  const listEl=document.getElementById('news-list'),footerEl=document.getElementById('news-footer');if(!listEl)return;
  listEl.innerHTML='<div class="news-loading">🔄 Đang tải tin tức...</div>';if(footerEl)footerEl.textContent='';
  const src=NEWS_SOURCES[_newsSource],feedUrl=src.feeds[_newsCat]||src.feeds.hot,cacheKey=`news_${_newsSource}_${_newsCat}`;
  try{const c=sessionStorage.getItem(cacheKey);if(c){const p=JSON.parse(c);if(Date.now()-p.t<900000){renderNews(p.items,src);return;}}}catch(e){}
  try{
    const r=await fetch(`${RSS2JSON}${encodeURIComponent(feedUrl)}&count=15`,{cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const d=await r.json();if(d.status!=='ok')throw new Error(d.message||'RSS error');
    const items=d.items||[];sessionStorage.setItem(cacheKey,JSON.stringify({items,t:Date.now()}));
    renderNews(items,src);if(footerEl)footerEl.textContent=`📡 ${src.name} · ${items.length} tin · Cache 15 phút`;
  }catch(e){
    listEl.innerHTML=`<div class="news-loading">❌ Không tải được tin<br><small>${e.message}</small><br><br><a href="${NEWS_SOURCES[_newsSource].feeds[_newsCat]}" target="_blank" style="color:var(--primary)">Mở trang ${NEWS_SOURCES[_newsSource].name} ↗</a></div>`;
  }
}
function renderNews(items,src){
  const listEl=document.getElementById('news-list');if(!listEl)return;
  if(!items.length){listEl.innerHTML='<div class="news-loading">Không có tin tức</div>';return;}
  listEl.innerHTML=items.map(item=>{
    const thumb=item.thumbnail||item.enclosure?.link||'';
    const thumbHtml=thumb?`<img class="news-thumb" src="${thumb}" alt="" onerror="this.outerHTML='<div class=news-thumb-placeholder>📰</div>'" loading="lazy">`:'<div class="news-thumb-placeholder">📰</div>';
    return `<a class="news-card" href="${item.link}" target="_blank" rel="noopener">${thumbHtml}<div class="news-content"><div class="news-title">${item.title||'(Không có tiêu đề)'}</div><div class="news-meta"><span class="news-source-badge">${src.badge}</span><span>${item.pubDate?newsTimeAgo(item.pubDate):''}</span></div></div></a>`;
  }).join('');
}

// ============================================================
// CHART MODULE (Chart.js)
// ============================================================
let _mainChart=null,_chartPeriod='14days';
function switchChartPeriod(p){
  _chartPeriod=p;document.querySelectorAll('.cptab').forEach(b=>b.classList.remove('active'));
  document.getElementById('cptab-'+p)?.classList.add('active');drawChart();
}
function loadChartPanel(){drawChart();}

function drawChart(){
  if(typeof Chart==='undefined'){const s=document.getElementById('chart-summary');if(s)s.innerHTML='<div class="news-loading">⚠️ Cần kết nối để tải Chart.js</div>';return;}
  const ex=ga('expenses'),ic=ga('income');let labels=[],expData=[],incData=[];
  if(_chartPeriod==='14days'){
    for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const dk=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;labels.push(`${d.getDate()}/${d.getMonth()+1}`);expData.push(Object.values(ex[dk]||{}).reduce((s,e)=>s+e.amount,0));incData.push(Object.values(ic[dk]||{}).reduce((s,e)=>s+e.amount,0));}
  }else if(_chartPeriod==='weeks'){
    for(let w=7;w>=0;w--){const start=new Date();start.setDate(start.getDate()-start.getDay()-(w)*7+1);let eS=0,iS=0;for(let d=0;d<7;d++){const day=new Date(start);day.setDate(start.getDate()+d);const dk=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;eS+=Object.values(ex[dk]||{}).reduce((s,e)=>s+e.amount,0);iS+=Object.values(ic[dk]||{}).reduce((s,e)=>s+e.amount,0);}labels.push(`T${8-w}`);expData.push(eS);incData.push(iS);}
  }else if(_chartPeriod==='months'){
    for(let m=11;m>=0;m--){const d=new Date();d.setMonth(d.getMonth()-m);const pf=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;let eS=0,iS=0;Object.entries(ex).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>eS+=e.amount)});Object.entries(ic).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>iS+=e.amount)});labels.push(`T${d.getMonth()+1}/${String(d.getFullYear()).slice(2)}`);expData.push(eS);incData.push(iS);}
  }else if(_chartPeriod==='years'){
    const allK=[...Object.keys(ex),...Object.keys(ic)],yrs=[...new Set(allK.map(k=>k.slice(0,4)))].sort();
    if(!yrs.length){labels=['(chưa có dữ liệu)'];expData=[0];incData=[0];}
    else yrs.forEach(y=>{let eS=0,iS=0;Object.entries(ex).forEach(([k,v])=>{if(k.startsWith(y))Object.values(v).forEach(e=>eS+=e.amount)});Object.entries(ic).forEach(([k,v])=>{if(k.startsWith(y))Object.values(v).forEach(e=>iS+=e.amount)});labels.push(y);expData.push(eS);incData.push(iS);});
  }
  if(_mainChart){_mainChart.destroy();_mainChart=null;}
  const canvas=document.getElementById('main-chart');if(!canvas)return;
  _mainChart=new Chart(canvas.getContext('2d'),{
    type:'bar',
    data:{labels,datasets:[
      {label:'Chi tiêu',data:expData,backgroundColor:'rgba(248,113,113,.75)',borderColor:'rgba(248,113,113,1)',borderWidth:1,borderRadius:5},
      {label:'Thu nhập',data:incData,backgroundColor:'rgba(52,211,153,.75)',borderColor:'rgba(52,211,153,1)',borderWidth:1,borderRadius:5},
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.raw.toLocaleString('vi-VN')}đ`}}},
      scales:{
        x:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'rgba(255,255,255,.5)',font:{size:10},maxRotation:45}},
        y:{grid:{color:'rgba(255,255,255,.07)'},ticks:{color:'rgba(255,255,255,.5)',font:{size:10},callback:v=>fk(v)+'đ'}}
      }
    }
  });
  const tE=expData.reduce((a,b)=>a+b,0),tI=incData.reduce((a,b)=>a+b,0),bl=tI-tE;
  const s=document.getElementById('chart-summary');
  if(s)s.innerHTML=`<div class="cs-card"><div class="cs-val red-txt">${fm(tE)}</div><div class="cs-lbl">Tổng chi</div></div><div class="cs-card"><div class="cs-val green-txt">${fm(tI)}</div><div class="cs-lbl">Tổng thu</div></div><div class="cs-card"><div class="cs-val ${bl>=0?'green-txt':'red-txt'}">${bl>=0?'+':''}${fm(Math.abs(bl))}</div><div class="cs-lbl">Chênh lệch</div></div>`;
}

// ============================================================
// MONTHLY HISTORY MODULE
// ============================================================
let histY, histM;
function openHistoryModal() {
  const n = new Date();
  histY = n.getFullYear();
  histM = n.getMonth();
  renderHistory();
  show('history-modal');
}
function closeHistoryModal() { hide('history-modal'); }
function histPrev() { histM--; if (histM < 0) { histM = 11; histY--; } renderHistory(); }
function histNext() { histM++; if (histM > 11) { histM = 0; histY++; } renderHistory(); }

function renderHistory() {
  const mn = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  const dn = ['CN','T2','T3','T4','T5','T6','T7'];
  document.getElementById('hist-month-label').textContent = `${mn[histM]} / ${histY}`;

  const pf = `${histY}-${String(histM + 1).padStart(2, '0')}`;
  const ex = ga('expenses'), ic = ga('income');

  // Collect all days in this month that have data
  let mExp = 0, mInc = 0, catTotals = {}, dayMap = {};
  const daysInMonth = new Date(histY, histM + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const dk = `${pf}-${String(d).padStart(2, '0')}`;
    const dayExpenses = ex[dk] ? Object.entries(ex[dk]) : [];
    const dayIncomes = ic[dk] ? Object.entries(ic[dk]) : [];
    let dExp = 0, dInc = 0;

    dayExpenses.forEach(([id, e]) => {
      dExp += e.amount;
      mExp += e.amount;
      catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    });
    dayIncomes.forEach(([id, e]) => {
      dInc += e.amount;
      mInc += e.amount;
    });

    if (dayExpenses.length || dayIncomes.length) {
      dayMap[dk] = { d, dExp, dInc, expenses: dayExpenses, incomes: dayIncomes };
    }
  }

  const bal = mInc - mExp;
  const dayCount = Object.keys(dayMap).length;
  const avgDay = dayCount > 0 ? Math.round(mExp / dayCount) : 0;

  // Summary cards
  document.getElementById('hist-summary').innerHTML = `
    <div class="hist-card hist-card-inc">
      <div class="hist-card-icon">💰</div>
      <div class="hist-card-val green-txt">${fm(mInc)}</div>
      <div class="hist-card-lbl">Thu nhập</div>
    </div>
    <div class="hist-card hist-card-exp">
      <div class="hist-card-icon">💸</div>
      <div class="hist-card-val red-txt">${fm(mExp)}</div>
      <div class="hist-card-lbl">Chi tiêu</div>
    </div>
    <div class="hist-card hist-card-bal">
      <div class="hist-card-icon">${bal >= 0 ? '🎉' : '⚠️'}</div>
      <div class="hist-card-val ${bal >= 0 ? 'green-txt' : 'red-txt'}">${bal >= 0 ? '+' : '−'}${fm(bal)}</div>
      <div class="hist-card-lbl">Số dư</div>
    </div>
    <div class="hist-card hist-card-info">
      <div class="hist-card-icon">📊</div>
      <div class="hist-card-val gold-txt">${fm(avgDay)}</div>
      <div class="hist-card-lbl">TB/ngày (${dayCount} ngày)</div>
    </div>
  `;

  // Category breakdown (top 5)
  const catSorted = Object.entries(catTotals).map(([id, total]) => {
    const c = CATS.find(x => x.id === id) || CATS[CATS.length - 1];
    return { ...c, total };
  }).sort((a, b) => b.total - a.total);

  const catEl = document.getElementById('hist-cat-breakdown');
  if (catSorted.length) {
    const maxCat = catSorted[0].total;
    catEl.innerHTML = `
      <div class="hist-section-title">📂 Danh mục chi tiêu</div>
      ${catSorted.slice(0, 6).map((c, i) => {
        const pct = mExp > 0 ? Math.round(c.total / mExp * 100) : 0;
        const barW = Math.max(4, Math.round(c.total / maxCat * 100));
        return `<div class="hist-cat-row">
          <div class="hist-cat-left">
            <span class="hist-cat-rank">${['🥇','🥈','🥉'][i] || `${i+1}.`}</span>
            <span>${c.icon} ${c.label}</span>
          </div>
          <div class="hist-cat-right">
            <div class="hist-cat-bar-wrap"><div class="hist-cat-bar" style="width:${barW}%"></div></div>
            <span class="red-txt fw">${fm(c.total)}</span>
            <span class="hist-cat-pct">${pct}%</span>
          </div>
        </div>`;
      }).join('')}
    `;
  } else {
    catEl.innerHTML = '';
  }

  // Day-by-day listing (newest first)
  const daysEl = document.getElementById('hist-days');
  const sortedDays = Object.entries(dayMap).sort((a, b) => b[0].localeCompare(a[0]));

  if (!sortedDays.length) {
    daysEl.innerHTML = '<div class="empty-msg">Chưa có giao dịch trong tháng này 📭</div>';
    return;
  }

  daysEl.innerHTML = `<div class="hist-section-title">📋 Chi tiết theo ngày</div>` +
    sortedDays.map(([dk, info]) => {
      const dateObj = new Date(histY, histM, info.d);
      const dayName = dn[dateObj.getDay()];
      const isToday = dk === tk();

      const allItems = [
        ...info.expenses.map(([id, e]) => ({ ...e, type: 'expense' })),
        ...info.incomes.map(([id, e]) => ({ ...e, type: 'income' }))
      ].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      const itemsHtml = allItems.map(e => {
        const cats = e.type === 'expense' ? CATS : ICATS;
        const c = cats.find(x => x.id === e.category) || cats[cats.length - 1];
        const cls = e.type === 'expense' ? 'red-txt' : 'green-txt';
        const sign = e.type === 'expense' ? '−' : '+';
        return `<div class="hist-item">
          <span class="hist-item-icon">${c.icon}</span>
          <span class="hist-item-name">${e.note || c.label}</span>
          <span class="hist-item-val ${cls} fw">${sign}${fm(e.amount)}</span>
        </div>`;
      }).join('');

      return `<div class="hist-day-block${isToday ? ' hist-day-today' : ''}">
        <div class="hist-day-header" onclick="this.parentElement.classList.toggle('expanded')">
          <div class="hist-day-left">
            <span class="hist-day-date">${dayName}, ${info.d}/${histM + 1}${isToday ? ' 👈' : ''}</span>
          </div>
          <div class="hist-day-right">
            ${info.dExp > 0 ? `<span class="red-txt fw">−${fm(info.dExp)}</span>` : ''}
            ${info.dInc > 0 ? `<span class="green-txt fw">+${fm(info.dInc)}</span>` : ''}
            <span class="hist-expand-icon">▼</span>
          </div>
        </div>
        <div class="hist-day-items">${itemsHtml}</div>
      </div>`;
    }).join('');
}

// ============================================================
// MONTHLY DETAILED REPORT MODULE
// ============================================================
let reportY, reportM, reportType = 'expense', reportQuery = '', reportExpanded = false;

function openReportModal() {
  const n = new Date();
  if (reportY === undefined) {
    reportY = n.getFullYear();
    reportM = n.getMonth();
  }
  reportQuery = '';
  const searchInput = document.getElementById('report-search-input');
  if (searchInput) searchInput.value = '';
  renderReport();
  show('report-modal');
}

function closeReportModal() {
  hide('report-modal');
}

function reportPrev() {
  reportM--;
  if (reportM < 0) { reportM = 11; reportY--; }
  renderReport();
}

function reportNext() {
  reportM++;
  if (reportM > 11) { reportM = 0; reportY++; }
  renderReport();
}

function switchReportType(t) {
  reportType = t;
  ['expense', 'income', 'all'].forEach(x => {
    document.getElementById('rpt-type-' + x)?.classList.toggle('active', x === t);
  });
  renderReport();
}

function onReportSearch(val) {
  reportQuery = (val || '').trim().toLowerCase();
  renderReport();
}

function toggleAllReportCats() {
  reportExpanded = !reportExpanded;
  const cards = document.querySelectorAll('.report-cat-card');
  cards.forEach(c => c.classList.toggle('expanded', reportExpanded));
  const btn = document.getElementById('report-toggle-all-btn');
  if (btn) btn.textContent = reportExpanded ? '📁 Thu gọn tất cả' : '📂 Mở tất cả';
}

function renderReport() {
  const mn = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
  const dn = ['CN','T2','T3','T4','T5','T6','T7'];
  const monthLabel = document.getElementById('report-month-label');
  if (monthLabel) monthLabel.textContent = `${mn[reportM]} / ${reportY}`;

  const pf = `${reportY}-${String(reportM + 1).padStart(2, '0')}`;
  const ex = ga('expenses'), ic = ga('income');
  const daysInMonth = new Date(reportY, reportM + 1, 0).getDate();

  let mExp = 0, mInc = 0, eCnt = 0, iCnt = 0;
  const catMap = {}; // key: `type_catId`

  for (let d = 1; d <= daysInMonth; d++) {
    const dk = `${pf}-${String(d).padStart(2, '0')}`;
    const dayExpenses = ex[dk] ? Object.entries(ex[dk]) : [];
    const dayIncomes = ic[dk] ? Object.entries(ic[dk]) : [];

    dayExpenses.forEach(([id, item]) => {
      mExp += item.amount;
      eCnt++;
      const catKey = `expense_${item.category}`;
      if (!catMap[catKey]) {
        const c = CATS.find(x => x.id === item.category) || CATS[CATS.length - 1];
        catMap[catKey] = {
          id: item.category,
          type: 'expense',
          icon: c.icon,
          label: c.label,
          total: 0,
          items: []
        };
      }
      catMap[catKey].total += item.amount;
      catMap[catKey].items.push({ id, dk, d, ...item, type: 'expense' });
    });

    dayIncomes.forEach(([id, item]) => {
      mInc += item.amount;
      iCnt++;
      const catKey = `income_${item.category}`;
      if (!catMap[catKey]) {
        const c = ICATS.find(x => x.id === item.category) || ICATS[ICATS.length - 1];
        catMap[catKey] = {
          id: item.category,
          type: 'income',
          icon: c.icon,
          label: c.label,
          total: 0,
          items: []
        };
      }
      catMap[catKey].total += item.amount;
      catMap[catKey].items.push({ id, dk, d, ...item, type: 'income' });
    });
  }

  const bal = mInc - mExp;

  // Render Summary
  const summaryEl = document.getElementById('report-summary');
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="rpt-card rpt-card-exp">
        <div class="rpt-card-val red-txt">${fm(mExp)}</div>
        <div class="rpt-card-lbl">💸 Tổng chi (${eCnt} khoản)</div>
      </div>
      <div class="rpt-card rpt-card-inc">
        <div class="rpt-card-val green-txt">${fm(mInc)}</div>
        <div class="rpt-card-lbl">💰 Tổng thu (${iCnt} khoản)</div>
      </div>
      <div class="rpt-card rpt-card-bal">
        <div class="rpt-card-val ${bal >= 0 ? 'green-txt' : 'red-txt'}">${bal >= 0 ? '+' : '−'}${fm(bal)}</div>
        <div class="rpt-card-lbl">📊 Số dư tháng</div>
      </div>
    `;
  }

  // Filter groups according to reportType
  let allGroups = Object.values(catMap);
  if (reportType === 'expense') {
    allGroups = allGroups.filter(g => g.type === 'expense');
  } else if (reportType === 'income') {
    allGroups = allGroups.filter(g => g.type === 'income');
  }

  // Filter groups and items by search query if present
  if (reportQuery) {
    allGroups = allGroups.map(g => {
      const matchCat = g.label.toLowerCase().includes(reportQuery);
      const filteredItems = g.items.filter(it => 
        matchCat || (it.note && it.note.toLowerCase().includes(reportQuery))
      );
      if (filteredItems.length > 0) {
        return {
          ...g,
          total: filteredItems.reduce((sum, x) => sum + x.amount, 0),
          items: filteredItems
        };
      }
      return null;
    }).filter(Boolean);
  }

  // Sort groups by total descending
  allGroups.sort((a, b) => b.total - a.total);

  const contentEl = document.getElementById('report-content');
  if (!contentEl) return;

  if (!allGroups.length) {
    contentEl.innerHTML = `<div class="empty-msg">${reportQuery ? 'Không tìm thấy khoản chi phù hợp 🔍' : 'Chưa có dữ liệu giao dịch trong tháng này 📭'}</div>`;
    return;
  }

  const totalBase = reportType === 'income' ? mInc : (reportType === 'expense' ? mExp : (mExp + mInc));
  const maxGroupTotal = allGroups[0]?.total || 1;
  const medals = ['🥇', '🥈', '🥉'];

  contentEl.innerHTML = allGroups.map((g, idx) => {
    const isExp = g.type === 'expense';
    const pct = totalBase > 0 ? Math.round(g.total / totalBase * 100) : 0;
    const barW = Math.max(4, Math.round(g.total / maxGroupTotal * 100));
    const barColor = isExp ? 'linear-gradient(90deg,var(--red-d),var(--red))' : 'linear-gradient(90deg,var(--green-d),var(--green))';
    const amountClass = isExp ? 'red-txt' : 'green-txt';
    const sign = isExp ? '−' : '+';

    // Sort items within group by date descending, then creation time
    const sortedItems = [...g.items].sort((a, b) => b.dk.localeCompare(a.dk) || (b.createdAt || 0) - (a.createdAt || 0));

    const rowsHtml = sortedItems.map(it => {
      const dateObj = new Date(reportY, reportM, it.d);
      const dayOfWeek = dn[dateObj.getDay()];
      const itemCls = it.type === 'expense' ? 'red-txt' : 'green-txt';
      const itemSign = it.type === 'expense' ? '−' : '+';
      return `
        <tr class="report-table-row" onclick="openEditModal('${it.id}','${it.dk}','${it.type}')" title="Bấm để sửa hoặc xóa khoản này">
          <td class="report-col-date">${dayOfWeek}, ${String(it.d).padStart(2,'0')}/${String(reportM+1).padStart(2,'0')}</td>
          <td class="report-col-note">${it.note || g.label}</td>
          <td class="report-col-amount ${itemCls}">${itemSign}${fm(it.amount)}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="report-cat-card${reportExpanded ? ' expanded' : ''}">
        <div class="report-cat-header" onclick="this.parentElement.classList.toggle('expanded')">
          <div class="report-cat-left">
            <span class="report-cat-rank">${medals[idx] || (idx + 1) + '.'}</span>
            <div class="report-cat-info">
              <span class="report-cat-name">${g.icon} ${g.label} ${reportType === 'all' ? `<small style="font-size:10px;padding:2px 6px;border-radius:6px;background:${isExp?'#fee2e2':'#d1fae5'};color:${isExp?'var(--red)':'var(--green)'}">${isExp?'Chi':'Thu'}</small>` : ''}</span>
              <span class="report-cat-count">${sortedItems.length} khoản (${pct}%)</span>
            </div>
          </div>
          <div class="report-cat-right">
            <div class="report-cat-figures">
              <span class="report-cat-amount ${amountClass}">${sign}${fm(g.total)}</span>
              <div class="report-cat-bar-wrap">
                <div class="report-cat-bar" style="width:${barW}%;background:${barColor}"></div>
              </div>
            </div>
            <span class="report-cat-chevron">▼</span>
          </div>
        </div>
        <div class="report-cat-body">
          <table class="report-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Nội dung chi tiết</th>
                <th style="text-align:right">Số tiền</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }).join('');
}

function exportReportCsv() {
  const pf = `${reportY}-${String(reportM + 1).padStart(2, '0')}`;
  const ex = ga('expenses'), ic = ga('income');
  const daysInMonth = new Date(reportY, reportM + 1, 0).getDate();
  const rows = [['STT', 'Ngày', 'Thứ', 'Loại', 'Danh mục', 'Nội dung chi tiết', 'Số tiền (VNĐ)']];
  const dn = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];

  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dk = `${pf}-${String(d).padStart(2, '0')}`;
    const dateObj = new Date(reportY, reportM, d);
    const dayStr = `${String(d).padStart(2, '0')}/${String(reportM + 1).padStart(2, '0')}/${reportY}`;
    const dow = dn[dateObj.getDay()];

    if (reportType === 'expense' || reportType === 'all') {
      const dayExpenses = ex[dk] ? Object.values(ex[dk]) : [];
      dayExpenses.forEach(it => {
        const c = CATS.find(x => x.id === it.category) || CATS[CATS.length - 1];
        if (reportQuery && !c.label.toLowerCase().includes(reportQuery) && (!it.note || !it.note.toLowerCase().includes(reportQuery))) return;
        count++;
        rows.push([
          count,
          dayStr,
          dow,
          'Chi tiêu',
          c.label,
          (it.note || c.label).replace(/"/g, '""'),
          it.amount
        ]);
      });
    }

    if (reportType === 'income' || reportType === 'all') {
      const dayIncomes = ic[dk] ? Object.values(ic[dk]) : [];
      dayIncomes.forEach(it => {
        const c = ICATS.find(x => x.id === it.category) || ICATS[ICATS.length - 1];
        if (reportQuery && !c.label.toLowerCase().includes(reportQuery) && (!it.note || !it.note.toLowerCase().includes(reportQuery))) return;
        count++;
        rows.push([
          count,
          dayStr,
          dow,
          'Thu nhập',
          c.label,
          (it.note || c.label).replace(/"/g, '""'),
          it.amount
        ]);
      });
    }
  }

  if (count === 0) {
    toast('⚠️ Không có dữ liệu để xuất file!');
    return;
  }

  const csvContent = '\uFEFF' + rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bang_ke_chi_tieu_Thang_${String(reportM + 1).padStart(2, '0')}_${reportY}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  snd();
  toast('📥 Đã tải file Excel bảng kê thành công!');
}

function printReport() {
  const cards = document.querySelectorAll('.report-cat-card');
  cards.forEach(c => c.classList.add('expanded'));
  setTimeout(() => {
    window.print();
  }, 200);
}


