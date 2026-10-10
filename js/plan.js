// RAP DJ SET — тариф FREE/PRO: общие функции. Загружается до app.js, поэтому
// всё, что касается AUTH (из auth.js), проверяется лениво через typeof.

const PRO_PRICE=200;               // ₽ за 30 дней
const FREE_TRACKS=20,PRO_TRACKS=50;
// новые тексты сразу на двух языках: не зависят от словаря EN и не ломают его
const tt=(ru,en)=>typeof ST!=='undefined'&&ST.lang==='en'?en:ru;
const isPro=()=>typeof AUTH!=='undefined'&&AUTH.plan==='pro'&&AUTH.until>Date.now();
const maxT=()=>isPro()?PRO_TRACKS:FREE_TRACKS;
const proDays=()=>isPro()?Math.max(0,Math.ceil((AUTH.until-Date.now())/864e5)):0;
// FREE упёрся в лимит: объясняем и ведём на страницу PRO
function proNeed(msg){toast(msg);if(ST.tab!=='pro')setTimeout(()=>go('pro'),700)}

// темы оформления PRO
const SKINS={neon:['Неон','Neon','#8b5cff','#ff3d81'],ice:['Лёд','Ice','#4dd2ff','#7aa2ff'],gold:['Золото','Gold','#f5c15a','#ff8a4c'],blood:['Кровь','Blood','#ff3d3d','#c77dff']};

// сохранённые сеты: у PRO — в облаке (Supabase), у FREE — в браузере
function setsGet(){if(isPro()&&AUTH.cloud)return AUTH.cloud;return db.get('rds_sets',[])}
function setsPut(all){db.set('rds_sets',all);if(isPro()&&AUTH.cloud){AUTH.cloud=all;cloudPush(all)}}
async function cloudPush(all){if(!AUTH.sb||!AUTH.user)return;const uid=AUTH.user.id;
  try{if(all.length){const{error}=await AUTH.sb.from('sets').upsert(all.map(x=>({user_id:uid,id:x.id,name:x.name,tracks:x.tracks,date:x.date||''})),{onConflict:'user_id,id'});if(error)throw error}
    const ids=all.map(x=>x.id);let q=AUTH.sb.from('sets').delete().eq('user_id',uid);if(ids.length)q=q.not('id','in','('+ids.join(',')+')');const{error:e2}=await q;if(e2)throw e2}
  catch(e){toast(tt('Не удалось сохранить сеты в облако. Проверь интернет.','Could not save sets to the cloud. Check your connection.'))}}
async function cloudLoad(){if(!isPro()||!AUTH.sb)return;try{const{data,error}=await AUTH.sb.from('sets').select('id,name,tracks,date').order('id');if(error)throw error;
  let rows=(data||[]).map(r=>({id:Number(r.id),name:r.name,tracks:r.tracks||[],date:r.date||''}));
  const local=db.get('rds_sets',[]);const add=local.filter(l=>!rows.some(r=>r.id===l.id));   // первый раз в PRO: переносим сеты из браузера в облако
  if(add.length){rows=rows.concat(add);AUTH.cloud=rows;await cloudPush(rows)}else AUTH.cloud=rows;
  db.set('rds_sets',rows);render()}catch(e){AUTH.cloud=null}}
