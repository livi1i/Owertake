const enc=new TextEncoder();
const json=(body,status=200,headers={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}});
const hex=b=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
const hash=async(s)=>hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
async function password(value,salt){const key=await crypto.subtle.importKey('raw',enc.encode(value),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},key,256));}
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
const text=(v,max=3000)=>typeof v==='string'?v.trim().slice(0,max):'';
export const statuses=['Заявка получена','Обсуждение','Подготовка предложения','Согласование договора','В работе','На проверке','Завершён','На сопровождении'];
export async function api(req,env){
 const url=new URL(req.url),path=url.pathname,db=env.DB;
 if(!db)return json({error:'База данных пока недоступна'},503);
 const one=(sql,...p)=>db.prepare(sql).bind(...p).first();
 const run=(sql,...p)=>db.prepare(sql).bind(...p).run();
 const all=async(sql,...p)=>(await db.prepare(sql).bind(...p).all()).results;
 try{
  if(!['GET','HEAD'].includes(req.method)){
   if(req.headers.get('origin') && req.headers.get('origin')!==url.origin)fail('Недопустимый источник запроса',403);
   if(!(req.headers.get('content-type')||'').includes('application/json'))fail('Ожидается JSON',415);
   if(Number(req.headers.get('content-length')||0)>20000)fail('Запрос слишком большой',413);
  }
  const cookie=(req.headers.get('cookie')||'').match(/(?:^|;\s*)ot_session=([^;]+)/)?.[1];
  const user=cookie?await one('SELECT u.id,u.name,u.email,u.role FROM users u JOIN sessions s ON u.id=s.user_id WHERE s.token=? AND s.expires>?',await hash(cookie),Date.now()):null;
  let body={};if(!['GET','HEAD'].includes(req.method)){const raw=await req.text();if(raw.length>20000)fail('Запрос слишком большой',413);try{body=JSON.parse(raw)}catch{fail('Некорректный запрос')}}
  const requireUser=()=>{if(!user)fail('Войдите в аккаунт',401)};
  const requireAdmin=()=>{requireUser();if(user.role!=='admin')fail('Доступ только для команды',403)};
  const rate=async(category,limit)=>{const key=category+':'+(req.headers.get('cf-connecting-ip')||'local');const t=Date.now();await run('INSERT INTO attempts(key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<? THEN 1 ELSE count+1 END, expires=CASE WHEN expires<? THEN excluded.expires ELSE expires END',key,t+900000,t,t);const a=await one('SELECT count FROM attempts WHERE key=?',key);if(a.count>limit)fail('Слишком много попыток. Попробуйте через 15 минут',429)};
  if(path==='/api/me')return json({user});
  if(path==='/api/admin/claim'&&req.method==='POST'){requireUser();await rate('admin',5);if(!env.ADMIN_SETUP_KEY||!body.key||await hash(String(body.key))!==await hash(env.ADMIN_SETUP_KEY))fail('Неверный ключ настройки',403);const existing=await one("SELECT id FROM users WHERE role='admin' LIMIT 1");if(existing)fail('Администратор уже назначен',409);await run("UPDATE users SET role='admin' WHERE id=? AND NOT EXISTS (SELECT 1 FROM users WHERE role='admin')",user.id);return json({ok:true})}
  if(path==='/api/content'&&req.method==='GET'){const c=await one('SELECT data FROM content WHERE id=?','public');return json(c?JSON.parse(c.data):{projects:[],prices:{},contacts:{}})}
  if(path==='/api/content'&&req.method==='PUT'){requireAdmin();if(!Array.isArray(body.projects)||body.projects.length>30)fail('Некорректные проекты');for(const p of body.projects){if(p.url&&!/^https:\/\//.test(p.url))fail('Ссылка должна начинаться с https://');if(p.image&&!/^https:\/\//.test(p.image))fail('Изображение должно быть доступно по https://')}await run('INSERT INTO content(id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data','public',JSON.stringify(body));return json({ok:true})}
  if(path==='/api/register'&&req.method==='POST'){
   await rate('auth',15);const email=text(body.email,200).toLowerCase(),name=text(body.name,80),pass=body.password;
   if(!name||!/^\S+@\S+\.\S+$/.test(email)||typeof pass!=='string'||pass.length<10||pass.length>128)fail('Укажите имя, почту и пароль от 10 до 128 символов');
   if(!body.consent)fail('Необходимо согласие на обработку данных');
   if(await one('SELECT id FROM users WHERE email=?',email))fail('Не удалось зарегистрироваться с этой почтой');
   const salt=crypto.randomUUID();const id=crypto.randomUUID();await run('INSERT INTO users(id,name,email,password,salt,created) VALUES (?,?,?,?,?,?)',id,name,email,await password(pass,salt),salt,new Date().toISOString());
   return json({ok:true});
  }
  if(path==='/api/login'&&req.method==='POST'){
   await rate('auth',15);const email=text(body.email,200).toLowerCase();const u=await one('SELECT * FROM users WHERE email=?',email);
   const p=await password(typeof body.password==='string'?body.password:'',u?.salt||'invalid');if(!u||u.password!==p)fail('Неверная почта или пароль',401);
   const token=crypto.randomUUID()+crypto.randomUUID();await run('INSERT INTO sessions(token,user_id,expires) VALUES (?,?,?)',await hash(token),u.id,Date.now()+604800000);
   return json({ok:true},200,{'Set-Cookie':`ot_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${url.protocol==='https:'?'; Secure':''}`});
  }
  if(path==='/api/logout'&&req.method==='POST'){if(cookie)await run('DELETE FROM sessions WHERE token=?',await hash(cookie));return json({ok:true},200,{'Set-Cookie':'ot_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'})}
  if(path==='/api/leads'&&req.method==='POST'){
   await rate('leads',10);const name=text(body.name,80),contact=text(body.contact,200),service=text(body.service,100),description=text(body.description,5000);
   if(!name||!contact||!service||description.length<10||!body.consent)fail('Заполните все поля, опишите задачу (от 10 символов) и подтвердите согласие');
   const id=crypto.randomUUID();await run('INSERT INTO leads(id,user_id,name,contact,service,description,created) VALUES (?,?,?,?,?,?,?)',id,user?.id||null,name,contact,service,description,new Date().toISOString());return json({id});
  }
  if(path==='/api/leads'&&req.method==='GET'){requireUser();return json({leads:user.role==='admin'?await all('SELECT * FROM leads ORDER BY created DESC'):await all('SELECT * FROM leads WHERE user_id=? ORDER BY created DESC',user.id)})}
  const match=path.match(/^\/api\/leads\/([\w-]+)(\/messages)?$/);
  if(match){requireUser();const lead=await one('SELECT * FROM leads WHERE id=?',match[1]);if(!lead||(user.role!=='admin'&&lead.user_id!==user.id))fail('Проект не найден',404);
   if(match[2]){if(req.method==='GET')return json({messages:await all('SELECT m.id,m.text,m.created,u.name,u.role FROM messages m JOIN users u ON u.id=m.user_id WHERE m.lead_id=? ORDER BY m.created',lead.id)});if(req.method==='POST'){const value=text(body.text,3000);if(!value)fail('Сообщение пустое');await run('INSERT INTO messages(id,lead_id,user_id,text,created) VALUES (?,?,?,?,?)',crypto.randomUUID(),lead.id,user.id,value,new Date().toISOString());return json({ok:true})}}
   if(req.method==='PATCH'){requireAdmin();if(!statuses.includes(body.status)||!Number.isSafeInteger(body.price)||body.price<0)fail('Проверьте статус и стоимость');await run('UPDATE leads SET status=?,price=?,due=? WHERE id=?',body.status,body.price,text(body.due,40),lead.id);return json({ok:true})}
  }
  if(path==='/api/estimates'){requireAdmin();if(req.method==='GET')return json({estimates:await all('SELECT * FROM estimates ORDER BY created DESC')});if(req.method==='POST'){if(!text(body.title,200)||!Number.isSafeInteger(body.total)||body.total<0)fail('Проверьте расчёт');await run('INSERT INTO estimates(id,user_id,title,data,total,created) VALUES (?,?,?,?,?,?)',crypto.randomUUID(),user.id,text(body.title,200),JSON.stringify(body.data),body.total,new Date().toISOString());return json({ok:true})}}
  if(path==='/api/profile'&&req.method==='PUT'){requireUser();const name=text(body.name,80);if(!name)fail('Введите имя');await run('UPDATE users SET name=? WHERE id=?',name,user.id);return json({ok:true})}
  return json({error:'Не найдено'},404);
 }catch(e){if(!e.status)console.error(e);return json({error:e.status?e.message:'Не удалось выполнить запрос. Попробуйте позже'},e.status||500)}
}
