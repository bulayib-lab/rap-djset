// RAP DJ SET — вход через Google (Supabase Auth). Загружается после app.js.
// Профиль пользователя (и в будущем тариф FREE/PRO) хранится в таблице profiles, см. supabase/schema.sql.

EN.unshift(
  ['Войти через Google','Sign in with Google'],['Выйти из аккаунта','Sign out'],
  ['Вход через Google ещё не настроен: впиши ключи Supabase в js/config.js','Google sign-in is not set up yet: add the Supabase keys to js/config.js'],
  ['Не удалось открыть вход через Google','Could not open Google sign-in'],
  ['Ты вошёл как ','Signed in as '],['Ты вышел из аккаунта','You are signed out'],
  ['Аккаунт: ','Account: '],['Политика конфиденциальности','Privacy policy']
);

const AUTH={sb:null,user:null,plan:'free',until:0,cloud:null,ready:false,open:false,ret:/[?&]code=/.test(location.search)};
const GLOGO='<svg viewBox="0 0 18 18" aria-hidden="true" width="16" height="16"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/></svg>';

function authInit(){const c=window.RDS_CONFIG||{};
  if(!c.supabaseUrl||!c.supabaseAnonKey||!window.supabase||!window.supabase.createClient){AUTH.ready=true;authUI();return}
  try{AUTH.sb=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey,{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}catch(e){AUTH.ready=true;authUI();return}
  AUTH.sb.auth.onAuthStateChange((ev,s)=>{const was=AUTH.user;AUTH.user=s?s.user:null;AUTH.ready=true;
    if(AUTH.user&&!was){authProfile();if(AUTH.ret){AUTH.ret=false;authCleanUrl();toast('Ты вошёл как '+authName())}}
    if(!AUTH.user){AUTH.plan='free';AUTH.until=0;AUTH.cloud=null}authUI()});
  AUTH.sb.auth.getSession().then(({data})=>{const was=AUTH.user;AUTH.user=data&&data.session?data.session.user:null;AUTH.ready=true;if(AUTH.user&&!was){authProfile();if(AUTH.ret){AUTH.ret=false;toast('Ты вошёл как '+authName())}}authCleanUrl();authUI()}).catch(()=>{AUTH.ready=true;authUI()})}

// после возврата от Google в адресе остаётся ?code=…; убираем его, сохраняя вкладку в #hash
function authCleanUrl(){try{const u=new URL(location.href);if(!u.searchParams.has('code')&&!u.searchParams.has('error'))return false;u.searchParams.delete('code');u.searchParams.delete('state');u.searchParams.delete('error');u.searchParams.delete('error_description');history.replaceState(null,'',u.pathname+u.search+u.hash);return true}catch(e){return false}}

async function authProfile(){if(!AUTH.sb||!AUTH.user)return;try{const{data}=await AUTH.sb.from('profiles').select('plan,pro_until').eq('id',AUTH.user.id).maybeSingle();const was=isPro();if(data){AUTH.plan=data.plan||'free';AUTH.until=data.pro_until?Date.parse(data.pro_until):0}if(isPro()&&!AUTH.cloud)cloudLoad();if(was!==isPro()||ST.tab==='pro')render();else authUI();if(typeof proAfterProfile==='function')proAfterProfile()}catch(e){}}

async function authIn(){if(!AUTH.sb)return toast('Вход через Google ещё не настроен: впиши ключи Supabase в js/config.js');
  const back=location.origin+location.pathname+(location.hash||'');
  const{error}=await AUTH.sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:back,queryParams:{prompt:'select_account'}}});
  if(error)toast('Не удалось открыть вход через Google')}
async function authOut(){if(!AUTH.sb)return;AUTH.open=false;await AUTH.sb.auth.signOut();AUTH.user=null;AUTH.plan='free';AUTH.until=0;AUTH.cloud=null;render();toast('Ты вышел из аккаунта')}

const authName=()=>{const m=(AUTH.user&&AUTH.user.user_metadata)||{};return m.full_name||m.name||(AUTH.user&&AUTH.user.email)||''};
function authMenu(){AUTH.open=!AUTH.open;authUI();if(AUTH.open){const f=$('#authm button');if(f&&f.focus)f.focus()}}

function authUI(){const box=$('#auth');if(!box||!box.classList)return;
  if(!AUTH.ready){box.innerHTML='';return}
  if(!AUTH.user){box.innerHTML=L(`<button class="sm gbtn" onclick="authIn()">${GLOGO}<span>Войти через Google</span></button>`);return}
  const m=AUTH.user.user_metadata||{},n=authName(),first=esc(String(n).split(' ')[0]),av=m.avatar_url||m.picture;
  const pic=av?`<img src="${esc(av)}" alt="" referrerpolicy="no-referrer" width="26" height="26" onerror="this.replaceWith(Object.assign(document.createElement('i'),{textContent:'${esc(n.slice(0,1).toUpperCase())}'}))">`:`<i>${esc(n.slice(0,1).toUpperCase())}</i>`;
  box.innerHTML=L(`<button class="sm ubtn" onclick="authMenu()" aria-expanded="${AUTH.open}" aria-controls="authm" aria-label="Аккаунт: ${esc(n)}">${pic}<span class="un">${first}</span>${isPro()?'<b class="pro">PRO</b>':''}</button>`+
    (AUTH.open?`<div class="authm" id="authm"><div class="k">${esc(AUTH.user.email||'')}</div>${isPro()?`<div class="k">${tt('PRO активен ещё ','PRO active for ')+proDays()+tt(' дн.',' more days')}</div>`:`<button class="sm on" onclick="AUTH.open=false;go('pro')">${tt('Открыть PRO за ','Get PRO for ')+PRO_PRICE+' ₽'}</button>`}<button class="sm" onclick="authOut()">Выйти из аккаунта</button></div>`:''))}

// перерисовка шапки вместе с основным render() (смена языка и т.п.)
{const r0=render;render=function(){r0();authUI()}}
addEventListener('click',e=>{if(AUTH.open&&e.target.isConnected&&e.target.closest&&!e.target.closest('#auth')){AUTH.open=false;authUI()}});
addEventListener('keydown',e=>{if(AUTH.open&&e.key==='Escape'){AUTH.open=false;authUI();const b=$('#auth .ubtn');if(b)b.focus()}});
authInit();
