if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
const CATS=[{id:'food',icon:'🍜',label:'Ăn uống'},{id:'coffee',icon:'☕',label:'Cà phê'},{id:'transport',icon:'🚕',label:'Di chuyển'},{id:'fuel',icon:'⛽',label:'Xăng xe'},{id:'market',icon:'🛒',label:'Đi chợ'},{id:'electric',icon:'💡',label:'Điện/Nước'},{id:'phone',icon:'📱',label:'ĐT/Mạng'},{id:'health',icon:'💊',label:'Sức khỏe'},{id:'kids',icon:'👶',label:'Con cái'},{id:'shopping',icon:'🛍️',label:'Mua sắm'},{id:'fun',icon:'🎮',label:'Giải trí'},{id:'other',icon:'📌',label:'Khác'}];
const ICATS=[{id:'salary',icon:'💼',label:'Lương'},{id:'bonus',icon:'🎁',label:'Thưởng'},{id:'invest',icon:'📈',label:'Đầu tư'},{id:'rent',icon:'🏠',label:'Cho thuê'},{id:'side',icon:'💻',label:'Làm thêm'},{id:'iother',icon:'💰',label:'Thu khác'}];
const DQUICK=[{icon:'🍜',label:'Ăn sáng',on:true},{icon:'🍚',label:'Ăn trưa',on:true},{icon:'🍲',label:'Ăn tối',on:true},{icon:'☕',label:'Cà phê',on:true},{icon:'⛽',label:'Xăng',on:true},{icon:'🛒',label:'Đi chợ',on:true}];
let selCat='food',editId=null,editDate=null,editType=null,addMode='expense',qIcon='',qLabel='';
function tk(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function mp(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function gid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function fm(n){return Math.abs(n).toLocaleString('vi-VN')+' đ'}
function fk(n){return n>=1000?Math.round(n/1000)+'k':n+'đ'}
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
window.addEventListener('DOMContentLoaded',()=>{const n=new Date(),dn=['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];document.getElementById('date-display').textContent=`${dn[n.getDay()]}, ${n.getDate()}/${n.getMonth()+1}/${n.getFullYear()}`;renderQuick();renderToday();updateHero();hide('loading-screen');show('app')});
function renderQuick(){const q=gq().filter(b=>b.on!==false),el=document.getElementById('quick-grid');el.innerHTML=q.map(b=>`<button class="quick-btn" onclick="openQuickAdd('${b.icon}','${b.label}')"><span>${b.icon}</span>${b.label}</button>`).join('')}
function openQuickAdd(i,l){qIcon=i;qLabel=l;document.getElementById('quick-icon').textContent=i;document.getElementById('quick-label').textContent=l;document.getElementById('quick-amount').value='';document.getElementById('quick-note').value='';show('quick-modal');setTimeout(()=>document.getElementById('quick-amount').focus(),300)}
function closeQuickModal(){hide('quick-modal')}
function confirmQuickAdd(){const a=parseInt(document.getElementById('quick-amount').value);if(!a||a<=0){toast('⚠️ Nhập số tiền!');return}const c=CATS.find(x=>x.icon===qIcon)?.id||'other';const n=document.getElementById('quick-note').value.trim();sv(tk(),gid(),{category:c,amount:a,note:n||qLabel,createdAt:Date.now()},'expenses');closeQuickModal();snd();renderToday();updateHero();toast(`💸 ${qLabel}: −${fm(a)}`)}

function renderToday(){const exp=gd(tk(),'expenses'),inc=gd(tk(),'income');const all=[...Object.entries(exp).map(([id,e])=>({id,...e,type:'expense'})),...Object.entries(inc).map(([id,e])=>({id,...e,type:'income'}))].sort((a,b)=>b.createdAt-a.createdAt);const el=document.getElementById('today-list');if(!all.length){el.innerHTML='<div class="empty-msg">Chưa có giao dịch nào 🎉</div>';return}el.innerHTML=all.map(e=>{const cats=e.type==='expense'?CATS:ICATS;const c=cats.find(x=>x.id===e.category)||cats[cats.length-1];const cls=e.type==='expense'?'exp-val red-txt':'exp-val green-txt';const sign=e.type==='expense'?'−':'+';return `<div class="expense-row" onclick="openEditModal('${e.id}','${tk()}','${e.type}')"><div class="exp-icon">${c.icon}</div><div class="exp-info"><div class="exp-name">${e.note||c.label}</div><div class="exp-note">${c.label} · ${ts(e.createdAt)}</div></div><div class="${cls}">${sign}${fm(e.amount)}</div></div>`}).join('')}
function updateHero(){const ex=ga('expenses'),ic=ga('income'),td=tk(),pf=mp();let tExp=0,tInc=0,wExp=0,wInc=0,mExp=0,mInc=0;Object.values(ex[td]||{}).forEach(e=>tExp+=e.amount);Object.values(ic[td]||{}).forEach(e=>tInc+=e.amount);const now=new Date(),dow=now.getDay(),mon=new Date(now);mon.setDate(now.getDate()-(dow===0?6:dow-1));for(let i=0;i<7;i++){const d=new Date(mon);d.setDate(mon.getDate()+i);const dk=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;Object.values(ex[dk]||{}).forEach(e=>wExp+=e.amount);Object.values(ic[dk]||{}).forEach(e=>wInc+=e.amount)}Object.entries(ex).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>mExp+=e.amount)});Object.entries(ic).forEach(([k,v])=>{if(k.startsWith(pf))Object.values(v).forEach(e=>mInc+=e.amount)});document.getElementById('hero-expense').textContent=fm(tExp);document.getElementById('hero-income').textContent=fm(tInc);const bal=mInc-mExp;const bEl=document.getElementById('hero-balance');bEl.textContent=(bal>=0?'+':'−')+fm(bal);bEl.className=bal>=0?'green-txt':'red-txt';document.getElementById('week-expense').textContent=fm(wExp);document.getElementById('week-income').textContent=fm(wInc);document.getElementById('month-expense').textContent=fm(mExp)}
function openAddModal(mode){addMode=mode;selCat=mode==='expense'?'food':'salary';document.getElementById('add-title').textContent=mode==='expense'?'💸 Thêm chi tiêu':'💰 Thêm thu nhập';const btn=document.getElementById('add-submit-btn');btn.textContent=mode==='expense'?'💸 Lưu chi tiêu':'💰 Lưu thu nhập';btn.className=mode==='expense'?'btn-submit':'btn-submit green-submit';const cats=mode==='expense'?CATS:ICATS;document.getElementById('cat-grid').innerHTML=cats.map(c=>`<button class="cat-btn${c.id===selCat?' active':''}" onclick="selCat='${c.id}';document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')"><span>${c.icon}</span>${c.label}</button>`).join('');document.getElementById('add-amount').value='';document.getElementById('add-note').value='';show('add-modal')}
function closeAddModal(){hide('add-modal')}
function submitEntry(){const a=parseInt(document.getElementById('add-amount').value);if(!a||a<=0){toast('⚠️ Nhập số tiền!');return}const n=document.getElementById('add-note').value.trim();const cats=addMode==='expense'?CATS:ICATS;const c=cats.find(x=>x.id===selCat);const store=addMode==='expense'?'expenses':'income';sv(tk(),gid(),{category:selCat,amount:a,note:n||c.label,createdAt:Date.now()},store);closeAddModal();snd();renderToday();updateHero();toast(addMode==='expense'?`💸 ${n||c.label}: −${fm(a)}`:`💰 ${n||c.label}: +${fm(a)}`)}
function openEditModal(id,dk,type){editId=id;editDate=dk;editType=type;const e=gd(dk,type==='expense'?'expenses':'income')[id];if(!e)return;document.getElementById('edit-amount').value=e.amount;document.getElementById('edit-note').value=e.note||'';show('edit-modal')}
function closeEditModal(){hide('edit-modal');editId=null}
function saveEdit(){if(!editId)return;const a=parseInt(document.getElementById('edit-amount').value);if(!a||a<=0){toast('⚠️ Nhập số tiền!');return}const n=document.getElementById('edit-note').value.trim();const store=editType==='expense'?'expenses':'income';const ex=gd(editDate,store)[editId];sv(editDate,editId,{...ex,amount:a,note:n},store);closeEditModal();renderToday();updateHero();toast('✅ Đã cập nhật!')}
function deleteEntry(){if(!editId||!confirm('Xóa giao dịch này?'))return;dl(editDate,editId,editType==='expense'?'expenses':'income');closeEditModal();renderToday();updateHero();toast('🗑️ Đã xóa!')}


// QUICK SETTINGS - pick from ALL categories
function openQuickSettings(){tmpQuick=JSON.parse(JSON.stringify(gq()));renderQConfig();show('quick-settings-modal')}
function renderQConfig(){
const allCats=[...CATS,...ICATS];
const avail=allCats.filter(c=>!tmpQuick.find(q=>q.icon===c.icon&&q.label===c.label));
let h=tmpQuick.map((b,i)=>`<div class="qs-row"><span class="qs-drag">${b.icon} ${b.label}</span><div class="qs-btns"><button class="qs-btn" onclick="moveQ(${i},-1)">▲</button><button class="qs-btn" onclick="moveQ(${i},1)">▼</button><button class="qs-btn ${b.on!==false?'qs-on':'qs-off'}" onclick="toggleQ(${i})">${b.on!==false?'✅':'❌'}</button><button class="qs-btn qs-del" onclick="delQ(${i})">🗑️</button></div></div>`).join('');
if(avail.length){h+=`<div class="qs-label">Thêm từ danh mục:</div><div class="qs-pick-grid">${avail.map(c=>`<button class="qs-pick-btn" data-icon="${c.icon}" data-label="${c.label}" onclick="pickQuick('${c.icon}','${c.label}')">${c.icon}<br><small>${c.label}</small></button>`).join('')}</div>`}
document.getElementById('quick-config-list').innerHTML=h}
function pickQuick(icon,label){tmpQuick.push({icon,label,on:true});renderQConfig()}
function moveQ(i,d){const j=i+d;if(j<0||j>=tmpQuick.length)return;[tmpQuick[i],tmpQuick[j]]=[tmpQuick[j],tmpQuick[i]];renderQConfig()}
function toggleQ(i){tmpQuick[i].on=tmpQuick[i].on===false?true:false;renderQConfig()}
function delQ(i){tmpQuick.splice(i,1);renderQConfig()}
function addCustomQuick(){const ic=document.getElementById('qs-new-icon').value.trim(),lb=document.getElementById('qs-new-label').value.trim();if(!ic||!lb){toast('⚠️ Nhập icon và tên!');return}tmpQuick.push({icon:ic,label:lb,on:true});document.getElementById('qs-new-icon').value='';document.getElementById('qs-new-label').value='';renderQConfig()}
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
function showCalDet(dk){const ex=gd(dk,'expenses'),ic=gd(dk,'income');const[y,m,d]=dk.split('-');document.getElementById('cal-detail-title').textContent=`📋 Ngày ${parseInt(d)}/${parseInt(m)}`;const all=[...Object.values(ex).map(e=>({...e,type:'expense'})),...Object.values(ic).map(e=>({...e,type:'income'}))];if(!all.length){document.getElementById('cal-detail-list').innerHTML='<div class="empty-msg">Không có giao dịch</div>'}else{let te=0,ti=0;const rows=all.sort((a,b)=>b.amount-a.amount).map(e=>{const cats=e.type==='expense'?CATS:ICATS,c=cats.find(x=>x.id===e.category)||cats[cats.length-1];if(e.type==='expense')te+=e.amount;else ti+=e.amount;const cls=e.type==='expense'?'red-txt':'green-txt',sg=e.type==='expense'?'−':'+';return `<div class="cal-det-row"><span>${c.icon} ${e.note||c.label}</span><span class="${cls} fw">${sg}${fm(e.amount)}</span></div>`}).join('');document.getElementById('cal-detail-list').innerHTML=rows+`<div class="cal-det-total"><span>Chi: <b class="red-txt">−${fm(te)}</b></span><span>Thu: <b class="green-txt">+${fm(ti)}</b></span><span>Dư: <b class="${ti-te>=0?'green-txt':'red-txt'}">${ti-te>=0?'+':'−'}${fm(ti-te)}</b></span></div>`}show('cal-detail')}

// AI ADVISOR
function openAiModal(){runAiAnalysis();show('ai-modal')}
function closeAiModal(){hide('ai-modal')}
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

// DRAG & DROP SYSTEM
let dragSrcIdx=null,dragFromPick=null;
function initDrag(){
const list=document.getElementById('quick-config-list');if(!list)return;
// List items drag
list.querySelectorAll('.qs-row').forEach((r,i)=>{r.setAttribute('draggable','true');r.dataset.idx=i;
r.addEventListener('dragstart',e=>{dragSrcIdx=i;dragFromPick=null;r.style.opacity='0.4';e.dataTransfer.effectAllowed='move'});
r.addEventListener('dragend',()=>{r.style.opacity='1';dragSrcIdx=null;list.querySelectorAll('.qs-row').forEach(x=>x.classList.remove('qs-drag-over'))});
r.addEventListener('dragover',e=>{e.preventDefault();r.classList.add('qs-drag-over')});
r.addEventListener('dragleave',()=>r.classList.remove('qs-drag-over'));
r.addEventListener('drop',e=>{e.preventDefault();r.classList.remove('qs-drag-over');const to=parseInt(r.dataset.idx);
if(dragFromPick){tmpQuick.splice(to,0,{icon:dragFromPick.icon,label:dragFromPick.label,on:true});dragFromPick=null;renderQConfig();return}
if(dragSrcIdx!==null&&dragSrcIdx!==to){const item=tmpQuick.splice(dragSrcIdx,1)[0];tmpQuick.splice(to,0,item);renderQConfig()}})});
// Picker items drag
list.querySelectorAll('.qs-pick-btn').forEach(b=>{b.setAttribute('draggable','true');
b.addEventListener('dragstart',e=>{dragFromPick={icon:b.dataset.icon,label:b.dataset.label};b.style.opacity='0.4';e.dataTransfer.effectAllowed='copy'});
b.addEventListener('dragend',()=>{b.style.opacity='1';dragFromPick=null})})}
const origRQ=renderQConfig;
renderQConfig=function(){origRQ();setTimeout(initDrag,50)}
// HOME SCREEN quick buttons drag
let homeIdx=null;
function initHomeDrag(){const grid=document.getElementById('quick-grid');if(!grid)return;const btns=grid.querySelectorAll('.quick-btn');
btns.forEach((b,i)=>{b.setAttribute('draggable','true');b.dataset.idx=i;
b.addEventListener('dragstart',e=>{homeIdx=i;b.style.opacity='0.4';e.dataTransfer.effectAllowed='move'});
b.addEventListener('dragend',()=>{b.style.opacity='1';homeIdx=null;grid.querySelectorAll('.quick-btn').forEach(x=>x.classList.remove('qs-drag-over'))});
b.addEventListener('dragover',e=>{e.preventDefault();b.classList.add('qs-drag-over')});
b.addEventListener('dragleave',()=>b.classList.remove('qs-drag-over'));
b.addEventListener('drop',e=>{e.preventDefault();b.classList.remove('qs-drag-over');const to=parseInt(b.dataset.idx);
if(homeIdx!==null&&homeIdx!==to){const q=gq();const item=q.splice(homeIdx,1)[0];q.splice(to,0,item);sq(q);renderQuick();snd()}})})}
const origRQuick=renderQuick;
renderQuick=function(){origRQuick();setTimeout(initHomeDrag,50)}
