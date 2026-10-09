// RAP DJ SET — motion and interactive pieces: hero rig + Play mode, live transition timeline,
// reveals, empty states, A/B mixer and visualizers. Loaded before app.js; everything here runs
// only after app.js has defined ST, $, L, LIB and the rest.

EN.unshift(
  ['Звук: выкл','Sound: off'],['Звук: вкл','Sound: on'],['Стоп','Stop'],
  ['Точка входа трека B','Track B entry point'],['Вход B: такт ','B enters: bar '],[' из 32',' of 32'],
  ['Перетащи линию на схеме или двигай ползунок — кривые пересчитаются.','Drag the line on the chart or move the slider and the curves update.'],
  
  ['Микшер A/B','A/B mixer'],['<b>Играет трек A</b>','<b>Track A is playing</b>'],
  ['Поставь треки на деки кнопками «Дека A» и «Дека B» в карточках ниже. Кроссфейдер и EQ смешивают звук прямо в браузере.','Load tracks with the “Deck A” and “Deck B” buttons in the cards below. The crossfader and EQ mix the sound right in your browser.'],
  ['Дека A','Deck A'],['Дека B','Deck B'],['Дека пуста','Deck is empty'],['Кроссфейдер','Crossfader'],['Громк.','Vol'],
  ['Читаю файл…','Reading file…'],
  ['Сет пока пуст','Your set is empty'],['Добавь треки выше, импортируй плейлист или возьми их из Rap Mode.','Add tracks above, import a playlist, or pick them in Rap Mode.'],
  ['Ничего не нашлось','Nothing found'],['Попробуй другое название или выбери «Все» артисты.','Try another title or pick “All” artists.'],
  ['Файлов пока нет','No files yet'],['Выбери аудио выше: mp3, m4a или wav. Файлы остаются на этом устройстве.','Pick audio above: mp3, m4a or wav. Files stay on this device.'],
  ['Сохранённых сетов нет','No saved sets'],['Собери сет в Set Builder и нажми «Сохранить».','Build a set in Set Builder and press “Save”.'],
  ['Включи бит','Start the beat'],['Звук бита','Beat sound']
);

/* ---------------- reveals ---------------- */
const SD=typeof CSS!=='undefined'&&CSS.supports&&CSS.supports('animation-timeline: view()');
function observe(intro){const app=$('#app');if(!app||!app.querySelectorAll)return;
  const els=[...app.querySelectorAll('h2,.card,.tile,.tour')].filter(e=>!e.closest('.pop')&&!e.parentElement.closest('.card,.tile'));
  if(RM()){els.forEach(e=>e.classList.add('rv','in'));return}
  const vh=innerHeight||800;let n=0;
  if(!observe.io&&typeof IntersectionObserver!=='undefined')observe.io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');observe.io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  els.forEach(e=>{const r=e.getBoundingClientRect(),top=r.top<vh;
    if(top&&!intro&&!e.classList.contains('rv'))return;                 // quiet re-render: leave visible blocks alone
    e.classList.add('rv');
    if(top){e.style.setProperty('--i',Math.min(n++,10));requestAnimationFrame(()=>requestAnimationFrame(()=>e.classList.add('in')));return}
    e.style.removeProperty('--i');
    if(SD){e.classList.add('sd');return}
    if(observe.io)observe.io.observe(e);else e.classList.add('in')})}

/* ---------------- hero rig ---------------- */
const RIG={on:0,snd:0,bpm:92,t0:0,at0:0,ns:0,raf:0,lastBeat:-1,timer:0,g:null,nb:null,drag:null};
function rigDeck(cx,i){const c=i?'var(--hot)':'var(--ac)',x0=cx-80;
  return`<g class="plat" data-d="${i}"><circle cx="${cx}" cy="135" r="82" fill="#0f0d17" stroke="#2a2638"/><g class="spin" style="--t:${i?6.4:5}s">${[74,66,58,50,42].map(r=>`<circle cx="${cx}" cy="135" r="${r}" stroke="#2a2638" stroke-width="1"/>`).join('')}<circle cx="${cx}" cy="135" r="24" fill="url(#rgLab${i})" stroke="none"/><circle cx="${cx}" cy="135" r="3" fill="#0c0b12" stroke="none"/><path d="M${cx} 111V61" stroke="${c}" stroke-width="2"/></g><circle class="glint" cx="${cx}" cy="135" r="78" fill="url(#rgSheen)" stroke="none"/><circle class="beat" cx="${cx}" cy="135" r="86" stroke="${c}" stroke-width="2"/></g>`+
  `<rect x="${cx+87}" y="60" width="6" height="140" rx="3" stroke="#2a2638"/><rect class="pit" x="${cx+83}" y="150" width="14" height="12" rx="3" fill="${c}" stroke="none"/>`+
  [0,1,2,3].map(p=>`<rect class="pad" data-p="${i*4+p}" x="${x0+p*38}" y="226" width="32" height="16" rx="3" fill="#1d1a2a" stroke="#2a2638"/><rect class="pad-l" data-l="${i*4+p}" x="${x0+p*38}" y="226" width="32" height="16" rx="3" fill="${c}" stroke="none" pointer-events="none"/>`).join('')}
function rigSVG(){const eq=[0,1,2,3,4,5,6,7,8].map(i=>{const x=226+i*12,c=i%2?'var(--hot)':'var(--ac)';return`<rect class="eqg" x="${x-2}" y="42" width="11" height="40" rx="3" fill="${c}" stroke="none" opacity=".35"/><rect class="eb" style="animation-delay:-${(i*.11).toFixed(2)}s" x="${x}" y="44" width="7" height="36" rx="2" fill="${c}" stroke="none"/>`}).join('');
  const kn=[[236,'-0s'],[236,'-1.1s'],[236,'-2.2s'],[324,'-0s'],[324,'-1.1s'],[324,'-2.2s']].map(([x,d],j)=>{const y=102+(j%3)*24;return`<g><circle cx="${x}" cy="${y}" r="7"/><path class="kb" style="--d:${d}" d="M${x} ${y}V${y-6}" stroke="var(--ac)" stroke-width="2"/></g>`}).join('');
  return`<svg viewBox="0 0 560 280" fill="none" stroke="#9a93b2" stroke-width="1.5"><defs><linearGradient id="rgSheen" x1="0" y1="0" x2="1" y2="1"><stop offset=".22" stop-color="#fff" stop-opacity="0"/><stop offset=".42" stop-color="#fff" stop-opacity=".13"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".68" stop-color="#fff" stop-opacity=".06"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/></linearGradient>${[0,1].map(i=>`<radialGradient id="rgLab${i}"><stop offset="0" stop-color="${i?'var(--hot)':'var(--ac)'}"/><stop offset="1" stop-color="#0c0b12"/></radialGradient>`).join('')}</defs>`+
  `<rect x="1" y="30" width="198" height="220" rx="14" stroke="#2a2638"/><rect x="361" y="30" width="198" height="220" rx="14" stroke="#2a2638"/><rect x="215" y="30" width="130" height="220" rx="12" stroke="#2a2638"/>`+
  rigDeck(100,0)+rigDeck(460,1).replace(/x="(\d+(?:\.\d+)?)" y="60" width="6"/,(m,x)=>`x="${x-180}" y="60" width="6"`).replace(/class="pit" x="(\d+(?:\.\d+)?)"/,(m,x)=>`class="pit" x="${x-180}"`)+
  eq+kn+`<rect x="259" y="96" width="4" height="80" rx="2" stroke="#2a2638"/><rect x="297" y="96" width="4" height="80" rx="2" stroke="#2a2638"/><rect class="fa1" x="254" y="146" width="14" height="10" rx="3" fill="#f1eef8" stroke="none"/><rect class="fa2" x="292" y="146" width="14" height="10" rx="3" fill="#f1eef8" stroke="none"/><rect x="240" y="214" width="80" height="6" rx="3" stroke="#2a2638"/><rect class="cfa" x="268" y="207" width="24" height="20" rx="4" fill="var(--hot)" stroke="none"/></svg>`}
const IC={play:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2l10 6-10 6z"/></svg>',stop:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3h10v10H3z"/></svg>',snd:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10L5 10H2z"/><path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.5 3.5a6 6 0 0 1 0 9" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',mute:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10L5 10H2z"/><path d="M11 6l4 4M15 6l-4 4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>'};
function rig(){return`<div><div class="rig${RIG.on?' play':''}" aria-hidden="true">${rigSVG()}</div><div class="rig-ui"><button class="sm${RIG.on?' on':''}" id="rgp" onclick="rigPlay()" aria-pressed="${!!RIG.on}">${RIG.on?IC.stop+'Стоп':IC.play+'Play'}</button><button class="sm" id="rgs" onclick="rigSnd()" aria-pressed="${!!RIG.snd}" aria-label="Звук бита">${RIG.snd?IC.snd+'Звук: вкл':IC.mute+'Звук: выкл'}</button></div></div>`}
function rigUI(){const p=$('#rgp'),s=$('#rgs'),r=$('.rig');if(p){p.className='sm'+(RIG.on?' on':'');p.setAttribute('aria-pressed',!!RIG.on);p.innerHTML=L(RIG.on?IC.stop+'Стоп':IC.play+'Play')}if(s){s.setAttribute('aria-pressed',!!RIG.snd);s.innerHTML=L(RIG.snd?IC.snd+'Звук: вкл':IC.mute+'Звук: выкл')}if(r&&r.classList)r.classList.toggle('play',!!RIG.on)}
const rigClock=()=>RIG.g?AC1.currentTime-RIG.at0:(performance.now()-RIG.t0)/1000;
function rigPlay(){RIG.on=!RIG.on;if(RIG.on){RIG.t0=performance.now();RIG.lastBeat=-1;if(RIG.snd)rigAudio();if(RIG.g){RIG.at0=AC1.currentTime+.05;RIG.ns=0}RIG.timer=setInterval(rigSched,25);if(!RIG.raf)RIG.raf=requestAnimationFrame(rigLoop)}else rigStop(1);rigUI()}
function rigStop(keep){RIG.on=0;clearInterval(RIG.timer);RIG.timer=0;cancelAnimationFrame(RIG.raf);RIG.raf=0;const r=$('.rig');if(r&&r.style){r.style.removeProperty('--b');r.querySelectorAll('.eb').forEach(e=>e.style.removeProperty('--h'))}if(!keep)rigUI()}
function rigSnd(){RIG.snd=!RIG.snd;if(RIG.snd){const was=RIG.g;rigAudio();if(RIG.g&&!was&&RIG.on){const el=(performance.now()-RIG.t0)/1000;RIG.at0=AC1.currentTime-el;RIG.ns=Math.ceil(el/(15/RIG.bpm))}}if(RIG.g)RIG.g.gain.setTargetAtTime(RIG.snd?.5:0,AC1.currentTime,.03);rigUI()}
function rigAudio(){if(RIG.g)return;if(!acx())return;RIG.g=AC1.createGain();RIG.g.gain.value=RIG.snd?.5:0;RIG.g.connect(AC1.destination);const b=AC1.createBuffer(1,AC1.sampleRate*.3,AC1.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;RIG.nb=b}
function rigHit(type,t,v=1){const a=AC1,o=RIG.g;if(type==='k'){const s=a.createOscillator(),g=a.createGain();s.frequency.setValueAtTime(110,t);s.frequency.exponentialRampToValueAtTime(42,t+.18);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.55);s.connect(g).connect(o);s.start(t);s.stop(t+.6);return}
  const n=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();n.buffer=RIG.nb;
  if(type==='s'){f.type='bandpass';f.frequency.value=1900;f.Q.value=.7;g.gain.setValueAtTime(.7*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);const s=a.createOscillator(),sg=a.createGain();s.type='triangle';s.frequency.value=185;sg.gain.setValueAtTime(.35*v,t);sg.gain.exponentialRampToValueAtTime(.001,t+.09);s.connect(sg).connect(o);s.start(t);s.stop(t+.1)}
  else{f.type='highpass';f.frequency.value=8000;g.gain.setValueAtTime(.22*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.045)}
  n.connect(f).connect(g).connect(o);n.start(t);n.stop(t+.25)}
function rigSched(){if(!RIG.on||!RIG.g)return;const sd=15/RIG.bpm;while(RIG.ns*sd<rigClock()+.12){const t=RIG.at0+RIG.ns*sd,s=RIG.ns%16;if(t>=AC1.currentTime){if(s===0||s===7||s===10)rigHit('k',t,s?.8:1);if(s===4||s===12)rigHit('s',t);if(s%2===0)rigHit('h',t,s%4?.6:1)}RIG.ns++}}
function rigLoop(){RIG.raf=0;if(!RIG.on)return;if(ST.tab!=='home'){rigStop();return}
  const r=$('.rig');if(r&&r.style&&!RM()){const beat=rigClock()*RIG.bpm/60;if(beat>=0){const bi=Math.floor(beat),ph=beat-bi;r.style.setProperty('--b',Math.exp(-ph*4.5).toFixed(3));
    if(bi!==RIG.lastBeat){RIG.lastBeat=bi;r.querySelectorAll('.eb').forEach((e,i)=>e.style.setProperty('--h',(.35+((Math.imul(bi*9+i,2654435761)>>>24)/255)*.65).toFixed(2)));
      [bi%4,4+(bi+2)%4].forEach(p=>{const l=r.querySelector(`[data-l="${p}"]`);if(l&&l.classList){l.classList.add('hit');setTimeout(()=>l.classList.remove('hit'),110)}})}}}
  RIG.raf=requestAnimationFrame(rigLoop)}
function rigBind(){const r=$('.rig');if(!r||!r.addEventListener||r.dataset.b)return;r.dataset.b=1;
  r.addEventListener('pointerdown',e=>{const pad=e.target.closest('.pad');if(pad){const l=r.querySelector(`[data-l="${pad.dataset.p}"]`);if(l){l.classList.add('hit');setTimeout(()=>l.classList.remove('hit'),140)}if(RIG.snd&&RIG.g)rigHit(pad.dataset.p%4===0?'k':pad.dataset.p%4===2?'s':'h',AC1.currentTime);return}
    const pl=e.target.closest('.plat');if(!pl||RM())return;const c=pl.querySelector('circle').getBoundingClientRect(),cx=c.left+c.width/2,cy=c.top+c.height/2;
    RIG.drag={pl,cx,cy,a0:Math.atan2(e.clientY-cy,e.clientX-cx),rot:0};pl.style.transition='none';try{r.setPointerCapture(e.pointerId)}catch(_){}});
  r.addEventListener('pointermove',e=>{const d=RIG.drag;if(!d)return;const a=Math.atan2(e.clientY-d.cy,e.clientX-d.cx);let da=a-d.a0;if(da>Math.PI)da-=2*Math.PI;if(da<-Math.PI)da+=2*Math.PI;d.rot+=da*180/Math.PI;d.a0=a;d.pl.style.transform=`rotate(${d.rot.toFixed(1)}deg)`});
  const up=()=>{const d=RIG.drag;if(!d)return;RIG.drag=null;d.pl.style.transition='';d.pl.style.transform=''};r.addEventListener('pointerup',up);r.addEventListener('pointercancel',up)}

/* ---------------- live transition timeline ---------------- */
const TLV={ty:'',e:0,b0:0,raf:0,t0:0,ev:[],last:''};
const tlX=t=>20+t*560,tlY=v=>150-v*120,tlP=pts=>pts.map((q,i)=>(i?'L':'M')+tlX(q[0]).toFixed(1)+' '+tlY(q[1]).toFixed(1)).join(' ');
function tlEntry(B){const i=B.findIndex(q=>q[1]>0);return i>0?B[i-1][0]:0}
function tlShift(d,dl){const cl=t=>Math.max(0,Math.min(1,t)),f=pts=>[pts[0],[cl(pts[0][0]+dl),pts[0][1]],...pts.slice(1,-1).map(q=>[cl(q[0]+dl),q[1]]),pts[pts.length-1]];return{A:f(d.A),B:f(d.B),bA:f(d.bA),bB:f(d.bB)}}
function tlEvents(c){const up=p=>{const i=p.findIndex(q=>q[1]>0);return i>0?p[i-1][0]:0},down=p=>{const i=p.findIndex(q=>q[1]<1);return i>0?p[i-1][0]:0},zero=p=>{const q=p.find(q=>q[1]===0&&q!==p[0]);return q?q[0]:1};
  return[['Включи трек B',up(c.B)],['Уводи громкость A',down(c.A)],['Бас A вниз',down(c.bA)],['Бас B вверх',up(c.bB)],['Трек A выключен',zero(c.A)]].map((x,i)=>({n:x[0],t:x[1],o:i})).sort((a,b)=>a.t-b.t||a.o-b.o)}
function tlive(ty){const d=TC[ty]||TC['EQ transition'],b0=tlEntry(d.B);if(TLV.ty!==ty){TLV.ty=ty;TLV.e=b0}TLV.b0=b0;const c=tlShift(d,TLV.e-b0);TLV.ev=tlEvents(c);const bar=Math.round(TLV.e*32);
  return`<div class="tl" id="tlv"><svg viewBox="0 0 600 170" aria-hidden="true"><g stroke="#2a2638" stroke-width="1"><path d="M20 150H580M20 30H580"/>${[0,.25,.5,.75,1].map(t=>`<path d="M${tlX(t)} 24V150"/>`).join('')}</g>${[0,8,16,24,32].map(b=>`<text class="ev" x="${tlX(b/32)}" y="166" text-anchor="middle" stroke="none">${b+1}</text>`).join('')}<g id="tlm">${tlMarks()}</g><path class="ln bb draw" id="tbB" pathLength="1" d="${tlP(c.bB)}"/><path class="ln ba draw" id="tbA" pathLength="1" d="${tlP(c.bA)}"/><path class="ln a draw" id="tA" pathLength="1" d="${tlP(c.A)}"/><path class="ln b draw" id="tB" pathLength="1" d="${tlP(c.B)}"/><g class="hd" id="thd" style="transform:translateX(${(tlX(TLV.e)-20).toFixed(1)}px)"><path d="M20 22V150" stroke="var(--hot)" stroke-width="1.5" stroke-dasharray="4 4"/><circle cx="20" cy="22" r="8" fill="var(--hot)" stroke="#0c0b12" stroke-width="2"/><path d="M17 22h6" stroke="#0c0b12" stroke-width="1.5"/><rect x="2" y="0" width="36" height="170" fill="transparent" stroke="none"/></g><line class="ph" id="tph" x1="20" x2="20" y1="30" y2="150"/></svg>`+
  `<div class="lg"><span><i class="a"></i>Трек A</span><span><i class="b"></i>Трек B</span><span><i class="ba"></i>Бас A</span><span><i class="bb"></i>Бас B</span></div>`+
  `<div class="tl-ctl"><label for="tle">Точка входа трека B</label><output id="tlo" for="tle">Вход B: такт ${bar+1} из 32</output><input type="range" id="tle" min="0" max="24" step="1" value="${bar}" oninput="tlSet(this.value/32)"></div><p class="k" style="margin:4px 0 0">Перетащи линию на схеме или двигай ползунок — кривые пересчитаются.</p><div class="tl-hint" role="status" aria-live="polite"><i aria-hidden="true"></i><span id="tlh"><b>Играет трек A</b></span></div></div>`}
function tlMarks(){return TLV.ev.map(e=>`<circle cx="${tlX(e.t).toFixed(1)}" cy="30" r="3" fill="var(--tx)" stroke="none" opacity=".7"/>`).join('')}
function tlSet(e){e=Math.max(0,Math.min(.75,Math.round(e*32)/32));if(e===TLV.e&&$('#tA'))return;TLV.e=e;const d=TC[TLV.ty]||TC['EQ transition'],c=tlShift(d,e-TLV.b0);TLV.ev=tlEvents(c);
  [['tA','A'],['tB','B'],['tbA','bA'],['tbB','bB']].forEach(([id,k])=>{const p=$('#'+id);if(p&&p.setAttribute){p.classList.remove('draw');p.setAttribute('d',tlP(c[k]))}});
  const h=$('#thd');if(h&&h.style)h.style.transform=`translateX(${(tlX(e)-20).toFixed(1)}px)`;const m=$('#tlm');if(m)m.innerHTML=tlMarks();
  const bar=Math.round(e*32),o=$('#tlo');if(o)o.textContent=L('Вход B: такт '+(bar+1)+' из 32');const r=$('#tle');if(r&&+r.value!==bar)r.value=bar;if(RM())tlHint(e)}
const TLW={'Играет трек A':'Track A is playing','Включи трек B':'Bring in track B','Бас A вниз':'Bass A down','Бас B вверх':'Bass B up','Уводи громкость A':'Fade track A out','Трек A выключен':'Track A is out','Переход завершён':'Transition done'};
function tlHint(t){const ev=TLV.ev,cur=[...ev].reverse().find(x=>x.t<=t+1e-6),nx=ev.find(x=>x.t>t+1e-6),en=ST.lang==='en',w=k=>en?TLW[k]:k;
  let s=cur?(en?'Now: ':'Сейчас: ')+w(cur.o===4&&!nx?'Переход завершён':cur.n):w('Играет трек A');
  const nb=nx?Math.max(1,Math.round((nx.t-t)*32)):0,unit=en?(nb===1?'bar':'bars'):nb%10===1&&nb%100!==11?'такт':nb%10>=2&&nb%10<=4&&(nb%100<10||nb%100>=20)?'такта':'тактов',
    more=nx?(en?'Next: ':'Дальше: ')+w(nx.n)+(en?' in ':' через ')+nb+' '+unit:'',txt=s+more;if(txt===TLV.last)return;TLV.last=txt;
  const h=$('#tlh');if(!h)return;const ch=s!==TLV.lastS;TLV.lastS=s;h.innerHTML='<b'+(ch?' class="chg"':'')+'>'+s+'</b>'+(more?' <span class="k">· '+more+'</span>':'')}
function tlLoop(now){TLV.raf=0;const p=$('#tph');if(!p||!p.style)return;if(!TLV.t0)TLV.t0=now;const t=((now-TLV.t0)/9000)%1;p.style.transform=`translateX(${(t*560).toFixed(1)}px)`;tlHint(t);TLV.raf=requestAnimationFrame(tlLoop)}
function tlBind(){const w=$('#tlv');if(!w||!w.addEventListener)return;TLV.last='';TLV.lastS='';
  const svg=w.querySelector('svg'),at=e=>{const r=svg.getBoundingClientRect();return((e.clientX-r.left)/r.width*600-20)/560};let dr=0;
  svg.addEventListener('pointerdown',e=>{dr=1;try{svg.setPointerCapture(e.pointerId)}catch(_){}tlSet(at(e))});
  svg.addEventListener('pointermove',e=>{if(dr)tlSet(at(e))});['pointerup','pointercancel'].forEach(n=>svg.addEventListener(n,()=>dr=0));
  if(RM()){const p=$('#tph');if(p)p.style.display='none';tlHint(TLV.e);return}
  if(!TLV.raf){TLV.t0=0;TLV.raf=requestAnimationFrame(tlLoop)}}

/* ---------------- empty states and skeletons ---------------- */
const ILL={
  set:`<svg viewBox="0 0 96 96" fill="none" stroke="#9a93b2" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><g class="spin"><circle cx="48" cy="34" r="24"/><circle cx="48" cy="34" r="17" stroke="#2a2638"/><circle cx="48" cy="34" r="10" stroke="#2a2638"/><circle cx="48" cy="34" r="4" stroke="var(--ac)"/><path d="M48 10a24 24 0 0 1 17 7" stroke="var(--hot)"/></g><rect x="14" y="46" width="68" height="36" rx="4" fill="#0c0b12"/><path d="M26 58h44M26 66h30M26 74h20" stroke="#2a2638"/><path class="fade" d="M70 70h6M73 67v6" stroke="var(--hot)"/></svg>`,
  search:`<svg viewBox="0 0 96 96" fill="none" stroke="#9a93b2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 56h8l4-10 5 20 5-28 5 24 4-8h6" stroke="#2a2638"/><g class="float"><circle cx="62" cy="42" r="17"/><circle cx="62" cy="42" r="11" stroke="#2a2638"/><path d="M74 54l12 12" stroke-width="3"/><path class="fade" d="M57 42h10" stroke="var(--ac)"/></g></svg>`,
  files:`<svg viewBox="0 0 96 96" fill="none" stroke="#9a93b2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 58V48a28 28 0 0 1 56 0v10"/><rect x="14" y="56" width="14" height="24" rx="5" fill="#0c0b12"/><rect x="68" y="56" width="14" height="24" rx="5" fill="#0c0b12"/><g class="float"><path d="M48 70V40M38 50l10-10 10 10" stroke="var(--ac)"/></g><path class="fade" d="M36 82h24" stroke="#2a2638"/></svg>`,
  sets:`<svg viewBox="0 0 96 96" fill="none" stroke="#9a93b2" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="22" y="22" width="52" height="52" rx="5" stroke="#2a2638"/><rect x="16" y="28" width="52" height="52" rx="5" fill="#0c0b12"/><g class="spin"><circle cx="42" cy="54" r="16"/><circle cx="42" cy="54" r="9" stroke="#2a2638"/><circle cx="42" cy="54" r="3" stroke="var(--hot)"/></g><path class="fade" d="M80 16l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" stroke="var(--ac)"/></svg>`};
function empty(k,t,s){return`<div class="card empty">${ILL[k]}<div><p class="v">${t}</p><p class="k">${s}</p></div></div>`}
function fileSkel(n){return Array.from({length:Math.min(n,4)},()=>`<div class="card sk" role="status" aria-label="Читаю файл…"><div class="skl" style="width:64%"></div><div class="skl" style="width:30%"></div><div class="skl blk"></div><div class="skl" style="width:46%"></div></div>`).join('')}

/* ---------------- audio context shared by players and mixer ---------------- */
function acx(){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;try{if(!AC1){AC1=new C();AN=AC1.createAnalyser();AN.fftSize=1024;AN.smoothingTimeConstant=.72;AN.connect(AC1.destination)}if(AC1.state==='suspended')AC1.resume()}catch(e){return null}return AC1}

/* ---------------- A/B mixer ---------------- */
const MX={xf:0,master:null,a:{i:-1,eq:{lo:0,mid:0,hi:0},vol:.9},b:{i:-1,eq:{lo:0,mid:0,hi:0},vol:.9}};
function mxNode(d){const D=MX[d];if(D.el)return D;if(!acx())return null;if(!MX.master){MX.master=AC1.createGain();MX.master.connect(AN)}
  D.el=new Audio();D.el.preload='auto';D.src=AC1.createMediaElementSource(D.el);
  const f=(t,fr,q)=>{const n=AC1.createBiquadFilter();n.type=t;n.frequency.value=fr;if(q)n.Q.value=q;return n};
  D.lo=f('lowshelf',220);D.mid=f('peaking',1100,.9);D.hi=f('highshelf',4200);D.g=AC1.createGain();D.x=AC1.createGain();
  D.src.connect(D.lo).connect(D.mid).connect(D.hi).connect(D.g).connect(D.x).connect(MX.master);
  D.el.addEventListener('ended',()=>{D.el.currentTime=0;mxUI()});mxApply();return D}
function mxApply(){['a','b'].forEach(d=>{const D=MX[d];if(!D.g)return;const t=AC1.currentTime;D.lo.gain.setTargetAtTime(D.eq.lo,t,.02);D.mid.gain.setTargetAtTime(D.eq.mid,t,.02);D.hi.gain.setTargetAtTime(D.eq.hi,t,.02);D.g.gain.setTargetAtTime(D.vol,t,.02);
  const p=(MX.xf+1)/2*Math.PI/2;D.x.gain.setTargetAtTime(d==='a'?Math.cos(p):Math.sin(p),t,.02)})}
function mxLoad(i,d){const D=mxNode(d);if(!D)return toast('Браузер не поддерживает аудио-анализ');D.el.pause();D.el.src=LIB[i].url;D.i=i;toast((d==='a'?'Дека A':'Дека B')+': '+LIB[i].l);render()}
function mxPlay(d){const D=MX[d];if(!D.el||D.i<0)return;if(!D.el.paused){D.el.pause();mxUI();return}acx();LIB.forEach(y=>{if(y.a&&!y.a.paused)y.a.pause()});const pr=D.el.play();if(pr&&pr.catch)pr.catch(()=>toast('Не удалось воспроизвести'));vzStart();mxUI()}
function mxEq(d,k,v){const D=MX[d];if(k==='vol')D.vol=+v;else D.eq[k]=+v;if(D.g)mxApply()}
function mxX(v){MX.xf=+v;mxApply()}
function mxSeek(d,e){const D=MX[d];if(!D.el||!isFinite(D.el.duration))return;const r=e.currentTarget.getBoundingClientRect();D.el.currentTime=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*D.el.duration;vzDraw()}
function mxKey(d,e){const D=MX[d];if(!D.el)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();D.el.currentTime=Math.max(0,D.el.currentTime+(e.key==='ArrowRight'?5:-5));vzDraw()}else if(e.key===' '||e.key==='Enter'){e.preventDefault();mxPlay(d)}}
function mxUI(){['a','b'].forEach(d=>{const b=$('#mxp-'+d),D=MX[d];if(b&&D.el)b.textContent=L(D.el.paused?'Слушать':'Пауза')});vzDraw()}
function mixer(){const deck=d=>{const D=MX[d],x=LIB[D.i],up=d.toUpperCase();
  const eq=[['lo','Low',-24,6,1],['mid','Mid',-24,6,1],['hi','High',-24,6,1],['vol','Громк.',0,1,.01]].map(([k,n,a,b,s])=>`<div><label for="mx-${d}-${k}">${n}</label><input type="range" id="mx-${d}-${k}" min="${a}" max="${b}" step="${s}" value="${k==='vol'?D.vol:D.eq[k]}" oninput="mxEq('${d}','${k}',this.value)"></div>`).join('');
  return`<div class="deck ${d}"><h3><span>${up}</span><span class="ttl">${x?esc(x.l):'Дека пуста'}</span></h3>${x?`<canvas id="mxc-${d}" role="slider" tabindex="0" aria-label="Перемотка" aria-valuemin="0" aria-valuemax="100" onclick="mxSeek('${d}',event)" onkeydown="mxKey('${d}',event)"></canvas><div class="row"><button class="sm on" id="mxp-${d}" onclick="mxPlay('${d}')">${D.el&&!D.el.paused?'Пауза':'Слушать'}</button><span class="k">${x.bpm} BPM</span></div><div class="eqs">${eq}</div>`:`<div class="deck-empty">${d==='a'?'Дека A':'Дека B'}</div>`}</div>`};
  return`<div class="card"><h3 style="font-size:17px">Микшер A/B</h3><p class="k" style="margin:4px 0 14px">Поставь треки на деки кнопками «Дека A» и «Дека B» в карточках ниже. Кроссфейдер и EQ смешивают звук прямо в браузере.</p><div class="mix">${deck('a')}<div class="mixc"><canvas id="mxv" aria-hidden="true"></canvas><label for="xf" style="margin:0">Кроссфейдер</label><input type="range" id="xf" min="-1" max="1" step="0.01" value="${MX.xf}" oninput="mxX(this.value)"><div class="xf"><span>A</span><span>B</span></div></div>${deck('b')}</div></div>`}

/* ---------------- visualizer helpers ---------------- */
const SPEC={};
function spec(id,n){if(!AN)return null;const f=spec.f&&spec.f.length===AN.frequencyBinCount?spec.f:(spec.f=new Uint8Array(AN.frequencyBinCount));if(spec.fr!==vzK){AN.getByteFrequencyData(f);spec.fr=vzK}
  const S=SPEC[id]||(SPEC[id]={v:new Float32Array(n),p:new Float32Array(n),h:new Float32Array(n)}),N=f.length;
  for(let k=0;k<n;k++){const a=Math.floor(Math.pow(N*.7,k/n)),b=Math.max(a+1,Math.floor(Math.pow(N*.7,(k+1)/n)));let m=0;for(let j=a;j<b&&j<N;j++)m=Math.max(m,f[j]);const v=m/255;
    S.v[k]+=(v-S.v[k])*(v>S.v[k]?.45:.12);if(S.v[k]>=S.p[k]){S.p[k]=S.v[k];S.h[k]=18}else if(S.h[k]>0)S.h[k]--;else S.p[k]=Math.max(0,S.p[k]-.012)}return S}
function spDraw(g,S,w,h,c0,c1){const n=S.v.length,bw=w/n,gr=g.createLinearGradient(0,h,0,0);gr.addColorStop(0,c0);gr.addColorStop(1,c1);
  g.fillStyle=gr;g.globalAlpha=.85;for(let k=0;k<n;k++){const v=S.v[k]*(h-6);g.fillRect(k*bw+1,h-v,Math.max(1,bw-2),v)}
  g.globalAlpha=1;g.fillStyle='#f1eef8';for(let k=0;k<n;k++){if(S.p[k]<.02)continue;g.fillRect(k*bw+1,h-S.p[k]*(h-6)-2,Math.max(1,bw-2),2)}}
function cvFit(c,h){const dpr=Math.min(2,window.devicePixelRatio||1),w=c.clientWidth||300;if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)}const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);return[g,w]}
function cvTime(g,w,txt){g.font='600 11px Manrope,system-ui,sans-serif';g.textAlign='right';g.textBaseline='top';g.fillStyle='rgba(12,11,18,.75)';const tw=g.measureText(txt).width;g.fillRect(w-tw-12,4,tw+8,16);g.fillStyle='#f1eef8';g.fillText(txt,w-8,7)}
function mxDraw(){const v=$('#mxv');['a','b'].forEach((d,j)=>{const D=MX[d],c=$('#mxc-'+d),x=LIB[D.i];if(!c||!c.getContext||!x)return;const h=56,[g,w]=cvFit(c,h),a=D.el,pg=a&&a.duration?a.currentTime/a.duration:0,n=x.pk.length,bw=w/n;
    for(let k=0;k<n;k++){const bh=Math.max(3,x.pk[k]*(h-12));g.fillStyle=(k+.5)/n<pg?vzC[j]:'rgba(154,147,178,.45)';g.fillRect(k*bw+1,(h-bh)/2,Math.max(1,bw-2),bh)}
    g.fillStyle='#f1eef8';g.fillRect(Math.min(w-2,pg*w),0,2,h);cvTime(g,w,mmss(a?a.currentTime:0)+' / '+mmss(a&&isFinite(a.duration)?a.duration:x.dur));c.setAttribute('aria-valuenow',Math.round(pg*100))});
  if(v&&v.getContext){const h=90,[g,w]=cvFit(v,h),pl=['a','b'].some(d=>MX[d].el&&!MX[d].el.paused),S=pl?spec('mx',32):SPEC.mx;if(S){if(!pl)for(let k=0;k<S.v.length;k++){S.v[k]*=.9;S.p[k]=Math.max(0,S.p[k]-.02)}spDraw(g,S,w,h,vzC[0],vzC[1])}else{g.fillStyle='#2a2638';for(let k=0;k<32;k++)g.fillRect(k*w/32+1,h-3,Math.max(1,w/32-2),3)}}}
