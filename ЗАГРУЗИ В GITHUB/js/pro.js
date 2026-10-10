// RAP DJ SET — подписка PRO: страница тарифа, оплата через ЮMoney, экспорт сета,
// график энергии, запись микса, темы. Загружается после auth.js.
// Оплату подтверждает сервер (api/yoomoney.js): он продлевает profiles.pro_until. С сайта тариф не меняется.

TABS.push(['pro','PRO']);
TIPS.pro='PRO за 200 ₽: анализы и сеты без лимита, облако, экспорт, запись микса';
EN.unshift(['PRO за 200 ₽: анализы и сеты без лимита, облако, экспорт, запись микса','PRO for 200 ₽: unlimited analyses and sets, cloud, export, mix recording']);
ST.skin=db.get('rds_skin','');

const PI={ // line icons, 24×24
  inf:'<path d="M7.5 15.5c-2 0-3.5-1.6-3.5-3.5s1.5-3.5 3.5-3.5c3.5 0 5.5 7 9 7 2 0 3.5-1.6 3.5-3.5S18.5 8.5 16.5 8.5c-3.5 0-5.5 7-9 7z"/>',
  stack:'<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  cloud:'<path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.1 9.6 4.2 4.2 0 0 0 7 18z"/><path d="M12 11v5M9.5 13.5L12 11l2.5 2.5"/>',
  down:'<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5"/><path d="M5 19h14"/>',
  chart:'<path d="M4 19V5M4 19h16"/><path d="M7 15l4-5 3 3 5-7"/>',
  rec:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/>',
  pal:'<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.4-1.9-.5-1.1.2-2.1 1.4-2.1H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7.2" r="1.2"/><circle cx="15" cy="7.8" r="1.2"/>',
  badge:'<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>'};
const pico=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PI[k]}</svg>`;

const PROF=()=>[
  ['inf',tt('Анализ без лимита','Unlimited analysis'),tt('Сколько угодно анализов переходов каждый день.','As many transition analyses as you want, every day.'),tt('15 в день','15 a day'),tt('Без лимита','Unlimited')],
  ['stack',tt('Сеты без лимита','Unlimited sets'),tt('Сохраняй сколько угодно сетов, до 50 треков в каждом.','Save as many sets as you like, up to 50 tracks each.'),tt('3 сета · 20 треков','3 sets · 20 tracks'),tt('∞ сетов · 50 треков','∞ sets · 50 tracks')],
  ['cloud',tt('Сеты в облаке','Sets in the cloud'),tt('Сеты хранятся в аккаунте: собрал на компьютере — открыл на телефоне.','Sets live in your account: build on a laptop, open on your phone.'),tt('Только в браузере','This browser only'),tt('Все устройства','All devices')],
  ['down',tt('Экспорт сета','Set export'),tt('Скачай сет в TXT или CSV с BPM, тональностями и переходами.','Download a set as TXT or CSV with BPM, keys and transitions.'),'—','TXT · CSV'],
  ['chart',tt('График энергии','Energy graph'),tt('BPM и качество каждого перехода по всему сету на одном графике.','BPM and every transition’s quality across the whole set on one chart.'),'—',tt('Есть','Included')],
  ['rec',tt('Запись микса','Mix recording'),tt('Своди на деках A/B в «Моих файлах» и скачивай готовый микс файлом.','Mix on decks A/B in My Files and download the result as a file.'),'—',tt('Есть','Included')],
  ['pal',tt('Темы оформления','Colour themes'),tt('Четыре цветовые схемы для всего сайта.','Four colour schemes for the whole site.'),'—',tt('4 темы','4 themes')],
  ['badge',tt('Значок PRO','PRO badge'),tt('Значок PRO рядом с аватаркой в шапке.','A PRO badge next to your avatar.'),'—',tt('Есть','Included')]];

const fmtDate=t=>new Date(t).toLocaleDateString(ST.lang==='en'?'en-GB':'ru-RU',{day:'numeric',month:'long',year:'numeric'});
function proBuy(){const w=((window.RDS_CONFIG||{}).yoomoneyWallet||'').trim();
  if(!AUTH.user)return authIn();
  if(!w)return toast(tt('Оплата ещё не подключена: впиши номер кошелька ЮMoney в js/config.js','Payments are not set up yet: add the YooMoney wallet number to js/config.js'));
  const f=document.createElement('form');f.method='POST';f.action='https://yoomoney.ru/quickpay/confirm';f.style.display='none';
  const add=(n,v)=>{const i=document.createElement('input');i.type='hidden';i.name=n;i.value=v;f.appendChild(i)};
  add('receiver',w);add('quickpay-form','button');add('sum',String(PRO_PRICE));add('label',AUTH.user.id);add('paymentType',ST.payT||'AC');
  add('successURL',location.origin+location.pathname+'?paid=1#pro');document.body.appendChild(f);f.submit()}

function proStatus(){
  if(PAY.wait&&!isPro())return`<div class="pro-wait" role="status"><span class="dot"></span>${tt('Проверяем оплату. Обычно это занимает до минуты, страницу можно не обновлять.','Checking your payment. It usually takes up to a minute; no need to reload.')}</div>`;
  if(isPro())return`<p class="pro-on">${tt('PRO активен до ','PRO is active until ')}<b>${fmtDate(AUTH.until)}</b> · ${tt('осталось дней: ','days left: ')+proDays()}</p><button class="big" onclick="proBuy()">${tt('Продлить на 30 дней — ','Extend by 30 days — ')+PRO_PRICE+' ₽'}</button>`;
  if(!AUTH.user)return`<button class="big" onclick="authIn()">${tt('Войти через Google, чтобы купить','Sign in with Google to buy')}</button><p class="k">${tt('PRO привязывается к аккаунту, поэтому сначала нужен вход.','PRO is tied to your account, so sign in first.')}</p>`;
  return`<div class="pay-t" role="radiogroup" aria-label="${tt('Способ оплаты','Payment method')}">${[['AC',tt('Банковская карта','Bank card')],['PC',tt('Кошелёк ЮMoney','YooMoney wallet')]].map(([k,n])=>`<button class="sm${(ST.payT||'AC')===k?' on':''}" role="radio" aria-checked="${(ST.payT||'AC')===k}" onclick="ST.payT='${k}';render()">${n}</button>`).join('')}</div><button class="big" onclick="proBuy()">${tt('Оплатить ','Pay ')+PRO_PRICE+tt(' ₽ и открыть PRO',' ₽ and unlock PRO')}</button>`}

V.pro=()=>{const sk=Object.entries(SKINS).map(([k,v])=>`<button class="skin${isPro()&&ST.skin===k?' on':''}" onclick="setSkin('${k}')" aria-pressed="${isPro()&&ST.skin===k}" style="--s1:${v[2]};--s2:${v[3]}"><i aria-hidden="true"></i><span>${tt(v[0],v[1])}</span></button>`).join('');
  return`<div class="card pro-hero"><div class="pro-mark">PRO</div><h2>RAP DJ SET PRO</h2><p class="pro-price"><b>${PRO_PRICE} ₽</b> <span>/ ${tt('30 дней','30 days')}</span></p>
  <p class="k">${tt('Без автосписаний: платишь, когда удобно, и 30 дней добавляются к текущему сроку.','No auto-renewal: pay whenever you like and 30 days are added to your current term.')}</p>
  <div class="pro-cta">${proStatus()}</div></div>
  <h2 style="margin:30px 0 12px;font-size:20px">${tt('Что входит в PRO','What PRO includes')}</h2>
  <div class="g pro-grid">${PROF().map(([i,t,d,f,p])=>`<div class="card pro-f"><div class="pro-ic">${pico(i)}</div><h3>${t}</h3><p class="k">${d}</p><div class="pro-cmp"><span>FREE: ${f}</span><b>PRO: ${p}</b></div></div>`).join('')}</div>
  <h2 style="margin:30px 0 12px;font-size:20px">${tt('Темы оформления','Colour themes')}</h2>
  <div class="card"><div class="skins">${sk}</div><p class="k" style="margin:12px 0 0">${isPro()?tt('Тема применяется ко всему сайту. На странице артиста остаются его цвета.','The theme applies to the whole site. Artist pages keep their own colours.'):tt('Темы доступны в PRO.','Themes are a PRO feature.')}</p></div>
  <p class="k" style="margin-top:22px">${tt('Оплата проходит на стороне ЮMoney, данные карты сайт не видит. PRO включается автоматически после оплаты. Вопросы по оплате — на адрес поддержки из окна входа Google.','Payment is handled by YooMoney; the site never sees your card details. PRO turns on automatically after payment. Payment questions: use the support address shown on the Google sign-in screen.')}</p>`};

function setSkin(k){if(!isPro())return proNeed(tt('Темы оформления доступны в PRO.','Colour themes are a PRO feature.'));ST.skin=ST.skin===k?'':k;db.set('rds_skin',ST.skin);if(ST.art!=='all')ST.art='all';render()}

/* ---------- оплата: ждём подтверждения от сервера ---------- */
const PAY={wait:/[?&]paid=1/.test(location.search),t:0,n:0};
if(PAY.wait){try{const u=new URL(location.href);u.searchParams.delete('paid');history.replaceState(null,'',u.pathname+u.search+u.hash)}catch(e){}}
function proAfterProfile(){
  if(PAY.wait){if(isPro()){PAY.wait=false;clearTimeout(PAY.t);toast(tt('Оплата прошла, PRO включён','Payment received, PRO is on'));render()}
    else if(PAY.n++<30){clearTimeout(PAY.t);PAY.t=setTimeout(authProfile,4000)}
    else{PAY.wait=false;toast(tt('Оплата пока не подтвердилась. Если деньги списались, PRO включится чуть позже.','Payment is not confirmed yet. If you were charged, PRO will turn on a bit later.'));render()}}
  if(isPro()&&proDays()<=3){try{if(!sessionStorage.getItem('rds_rem')){sessionStorage.setItem('rds_rem','1');toast(tt('PRO заканчивается через ','PRO ends in ')+proDays()+tt(' дн. Продлить можно на вкладке PRO.',' days. You can extend it on the PRO tab.'))}}catch(e){}}}

/* ---------- Set Builder: график энергии и экспорт ---------- */
function energy(L){const n=L.length,I=L.map(info),b=I.map(x=>x.bpm),lo=Math.min(...b)-4,hi=Math.max(...b)+4,W=600,H=190,x=i=>36+i*(W-60)/(n-1),y=v=>H-28-(v-lo)/(hi-lo)*(H-56);
  const pts=b.map((v,i)=>x(i).toFixed(1)+','+y(v).toFixed(1)).join(' '),col={good:'var(--ok)',ok:'var(--warn)',risky:'var(--bad)'};
  let tr='';for(let i=0;i<n-1;i++){const a=an(L[i],L[i+1]),mx=(x(i)+x(i+1))/2;tr+=`<rect x="${(mx-9).toFixed(1)}" y="${H-14}" width="18" height="6" rx="3" fill="${col[a.cl]}"><title>${a.score}% · ${a.ty}</title></rect>`}
  const lab=n<=24?b.map((v,i)=>`<text x="${x(i).toFixed(1)}" y="${(y(v)-10).toFixed(1)}" text-anchor="middle">${v}</text>`).join(''):'';
  return`<svg class="nrg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${tt('График BPM по трекам сета','BPM by track across the set')}"><defs><linearGradient id="ngf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ac)" stop-opacity=".35"/><stop offset="1" stop-color="var(--ac)" stop-opacity="0"/></linearGradient></defs>
  <g stroke="#2a2638" stroke-width="1"><path d="M36 ${H-28}H${W-24}M36 28H${W-24}"/></g><text x="6" y="32" class="ax">${hi-4}</text><text x="6" y="${H-24}" class="ax">${lo+4}</text>
  <polygon points="${x(0).toFixed(1)},${H-28} ${pts} ${x(n-1).toFixed(1)},${H-28}" fill="url(#ngf)"/><polyline points="${pts}" fill="none" stroke="var(--ac)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
  ${b.map((v,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="4" fill="var(--bg)" stroke="var(--hot)" stroke-width="2"><title>${i+1}. ${esc(L[i])} · ${v} BPM</title></circle>`).join('')}${lab}${tr}</svg>
  <div class="lg"><span><i class="a"></i>BPM</span><span><i style="background:var(--ok)"></i>${tt('переход отлично','great transition')}</span><span><i style="background:var(--warn)"></i>${tt('нормально','okay')}</span><span><i style="background:var(--bad)"></i>${tt('рискованно','risky')}</span></div>`}
function proBuild(){if(ST.set.length<2)return'';const P=isPro();
  return`<div class="card pro-tools" style="margin-top:14px"><div class="row"><h3 class="sp" style="font-size:17px">${tt('График энергии сета','Set energy graph')}</h3>${P?'':'<span class="pro-tag">PRO</span>'}</div>
  <div class="nrg-w${P?'':' locked'}">${energy(ST.set)}${P?'':`<div class="lock"><button class="on" onclick="go('pro')">${tt('Открыть в PRO за ','Unlock in PRO for ')+PRO_PRICE+' ₽'}</button></div>`}</div>
  <div class="row" style="margin-top:12px"><span class="k sp">${tt('Экспорт сета с BPM, тональностями и переходами','Export the set with BPM, keys and transitions')}</span><button class="sm" onclick="exportSet('txt')">TXT${P?'':' · PRO'}</button><button class="sm" onclick="exportSet('csv')">CSV${P?'':' · PRO'}</button></div></div>`}
function saveFile(name,text,type){const a=document.createElement('a'),u=URL.createObjectURL(new Blob([text],{type}));a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}
function exportSet(f){if(!isPro())return proNeed(tt('Экспорт сета доступен в PRO.','Set export is a PRO feature.'));const S=ST.set;if(!S.length)return toast('Сет пуст');
  const nm=(ST.name||'RAP DJ SET').replace(/[\\/:*?"<>|]+/g,' ').trim()||'RAP DJ SET';
  if(f==='csv'){const q=v=>'"'+String(v).replace(/"/g,'""')+'"';const rows=[['#','Artist','Title','BPM','Key','Next transition','Score %']];
    S.forEach((l,i)=>{const I=info(l),p=l.split(' — '),x=i<S.length-1?an(l,S[i+1]):null;rows.push([i+1,p.length>1?p[0]:'',p.length>1?p.slice(1).join(' — '):l,I.bpm,ks(I),x?x.ty:'',x?x.score:''])});
    return saveFile(nm+'.csv','﻿'+rows.map(r=>r.map(q).join(',')).join('\r\n'),'text/csv;charset=utf-8')}
  const t=nm+'\n'+S.map((l,i)=>{const I=info(l),x=i<S.length-1?an(l,S[i+1]):null;return(i+1)+'. '+l+' · '+I.bpm+' BPM · '+ks(I)+(x?'\n   → '+x.ty+' · '+x.pt+' · '+x.score+'%':'')}).join('\n')+'\n\nRAP DJ SET · BPM/key: demo';
  saveFile(nm+'.txt',t,'text/plain;charset=utf-8')}

/* ---------- запись микса с дек A/B ---------- */
let REC=null;
function recUI(){return`<button class="sm${REC?' rec':''}" id="recb" onclick="recToggle()" aria-pressed="${!!REC}"><i class="rdot" aria-hidden="true"></i>${REC?tt('Остановить и скачать','Stop and download'):tt('Запись микса','Record mix')}${isPro()?'':' · PRO'}</button><span class="k" id="rect" aria-live="polite">${REC?mmss((Date.now()-REC.t0)/1000):''}</span>`}
function recToggle(){if(!isPro())return proNeed(tt('Запись микса доступна в PRO.','Mix recording is a PRO feature.'));
  if(REC){REC.r.stop();return}
  if(!window.MediaRecorder||!acx())return toast(tt('Этот браузер не умеет записывать звук. Попробуй Chrome.','This browser can’t record audio. Try Chrome.'));
  if(!MX.master)return toast(tt('Сначала поставь трек на деку A или B.','Load a track on deck A or B first.'));
  const dest=AC1.createMediaStreamDestination();MX.master.connect(dest);
  const mt=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(m=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(m))||'';
  let r;try{r=mt?new MediaRecorder(dest.stream,{mimeType:mt}):new MediaRecorder(dest.stream)}catch(e){MX.master.disconnect(dest);return toast(tt('Не удалось начать запись','Could not start recording'))}
  const ch=[];r.ondataavailable=e=>{if(e.data&&e.data.size)ch.push(e.data)};
  r.onstop=()=>{try{MX.master.disconnect(dest)}catch(e){}clearInterval(REC.iv);const type=r.mimeType||mt||'audio/webm',ext=/mp4/.test(type)?'m4a':'webm',d=new Date(),p=n=>String(n).padStart(2,'0');
    const b=new Blob(ch,{type}),a=document.createElement('a'),u=URL.createObjectURL(b);a.href=u;a.download=`rap-dj-set-mix-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.${ext}`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);
    REC=null;toast(tt('Микс сохранён в «Загрузки»','Mix saved to Downloads'));if(ST.tab==='mine')render()};
  r.start(1000);REC={r,t0:Date.now(),iv:setInterval(()=>{const t=$('#rect');if(t)t.textContent=mmss((Date.now()-REC.t0)/1000)},500)};
  if(ST.tab==='mine')render();
  toast(tt('Запись пошла. Своди на деках, потом нажми «Остановить и скачать».','Recording. Mix on the decks, then press “Stop and download”.'))}

// открыт сразу #pro (вкладка появилась только сейчас)
try{if(location.hash==='#pro'){ST.tab='pro';render()}else render()}catch(e){}
