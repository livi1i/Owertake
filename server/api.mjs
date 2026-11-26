import {os5,os5Error,os5Request} from "./os5.mjs";
const enc = new TextEncoder();
const json = (body, status = 200, headers = {}) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
const hex = (b) =>
  Array.from(new Uint8Array(b), (v) => v.toString(16).padStart(2, "0")).join(
    "",
  );
const hash = async (s) =>
  hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
async function password(value, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(value),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return hex(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: enc.encode(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      256,
    ),
  );
}
const fail = (message, status = 400) => {
  throw Object.assign(new Error(message), { status });
};
const text = (v, max = 3000) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
export const statuses = [
  "Заявка получена",
  "Обсуждение",
  "Подготовка предложения",
  "Согласование договора",
  "В работе",
  "На проверке",
  "Завершён",
  "На сопровождении",
];
export async function api(req, env) {
  const url = new URL(req.url),
    path = url.pathname,
    db = env.DB;
  if (!db) return json({ error: "База данных пока недоступна" }, 503);
  const one = (sql, ...p) =>
    db
      .prepare(sql)
      .bind(...p)
      .first();
  const run = (sql, ...p) =>
    db
      .prepare(sql)
      .bind(...p)
      .run();
  const all = async (sql, ...p) =>
    (
      await db
        .prepare(sql)
        .bind(...p)
        .all()
    ).results;
  try {
    const requestLimit = ((os5Request.test(path) && /\/(issue|signed)$/.test(path)) || /^\/api\/leads\/[\w-]+\/attachments$/.test(path)) && req.method === "POST" ? 710000 : 20000;
    if (!["GET", "HEAD"].includes(req.method)) {
      if (req.headers.get("origin") && req.headers.get("origin") !== url.origin)
        fail("Недопустимый источник запроса", 403);
      if (!(req.headers.get("content-type") || "").includes("application/json"))
        fail("Ожидается JSON", 415);
      if (Number(req.headers.get("content-length") || 0) > requestLimit)
        fail("Запрос слишком большой", 413);
    }
    const cookie = (req.headers.get("cookie") || "").match(
      /(?:^|;\s*)ot_session=([^;]+)/,
    )?.[1];
    const user = cookie
      ? await one(
          "SELECT u.id,u.name,u.email,u.role FROM users u JOIN sessions s ON u.id=s.user_id WHERE s.token=? AND s.expires>?",
          await hash(cookie),
          Date.now(),
        )
      : null;
    let body = {};
    if (!["GET", "HEAD"].includes(req.method)) {
      const raw = await req.text();
      if (raw.length > requestLimit) fail("Запрос слишком большой", 413);
      try {
        body = JSON.parse(raw);
      } catch {
        fail("Некорректный запрос");
      }
    }
    if (path==="/api/os5/status" && req.method==="GET") return json({enabled:Boolean(env.OS5_PRICES)});
    if (os5Request.test(path)) {
      if (!env.OS5_PRICES) return json({error:'CRM 5.0 ещё не включена'},503);
      const settings=await one("SELECT data FROM content WHERE id='public'");
      const overrides=JSON.parse(settings?.data||'{}').prices||{};
      const prices=Object.fromEntries(env.OS5_PRICES.map(item=>{
        const configured=overrides[item.code];
        const minor=typeof configured==='string'&&/^[0-9]{1,8}(?:\.[0-9]{1,2})?$/.test(configured)&&Number(configured)>0
          ? Math.round(Number(configured)*100) : item.minor;
        return [item.code,{...item,minor}];
      }));
      try {return await os5(req,path,user,body,db,prices,{fail,text,hex,json});}
      catch(error){ return os5Error(error,json); }
    }
    const requireUser = () => {
      if (!user) fail("Войдите в аккаунт", 401);
    };
    const requireAdmin = () => {
      requireUser();
      if (user.role !== "admin") fail("Доступ только для команды", 403);
    };
    const rate = async (category, limit) => {
      const key =
        category + ":" + (req.headers.get("cf-connecting-ip") || "local");
      const t = Date.now();
      await run(
        "INSERT INTO attempts(key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<? THEN 1 ELSE count+1 END, expires=CASE WHEN expires<? THEN excluded.expires ELSE expires END",
        key,
        t + 900000,
        t,
        t,
      );
      const a = await one("SELECT count FROM attempts WHERE key=?", key);
      if (a.count > limit)
        fail("Слишком много попыток. Попробуйте через 15 минут", 429);
    };
    const recordConsent = async (id, purpose) => run("INSERT INTO content(id,data) VALUES (?,?)", "consent:" + id, JSON.stringify({recordId:id,purpose,version:body.consentVersion === '2026-11-16.1' ? body.consentVersion : 'legacy-unspecified',accepted:true,created:new Date().toISOString()}));
    if (path === '/api/admin/consents' && req.method === 'GET') { requireAdmin(); return json({consents:(await all("SELECT data FROM content WHERE id LIKE 'consent:%' ORDER BY id")).map(r=>JSON.parse(r.data))}); }
    if ((path === '/api/services' || path === '/api/admin/services') && req.method === 'GET') {
      if(path.includes('/admin/'))requireAdmin();
      const items=(await all("SELECT data FROM content WHERE id LIKE 'service:%'")).map(r=>JSON.parse(r.data));
      return json({services:path.includes('/admin/')?items:items.map(s=>s.status==='Скрыта'?{slug:s.slug,status:s.status}:s)});
    }
    if(path === '/api/admin/services' && req.method === 'PUT') {
      requireAdmin();
      if(!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(body.slug||'') || body.slug.length>60 || !['Доступна','По согласованию','Временно недоступна','Скрыта'].includes(body.status) || !['Сайты','Боты и автоматизация','ИИ','Дизайн','Продвижение','Видео и 3D','Приложения','Сопровождение','CRM','Хостинг и домены'].includes(body.category))fail('Проверьте адрес, направление и статус');
      const item={slug:body.slug,category:body.category,status:body.status};
      for(const key of ['name','description','includes','audience','options']){if(typeof body[key]!=='string'||body[key].length>(key==='name'?100:1500)|| (key!=='options'&&!body[key].trim()))fail('Заполните описание услуги');item[key]=body[key].trim();}
      await run("INSERT INTO content(id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data",'service:'+item.slug,JSON.stringify(item));return json({ok:true});
    }
    if((path==='/api/faq'||path==='/api/admin/faq')&&req.method==='GET'){
      const adminView=path==='/api/admin/faq';if(adminView)requireAdmin();
      const items=(await all("SELECT data FROM content WHERE id LIKE 'faq:%'")).map(r=>JSON.parse(r.data));
      return json({faq:adminView?items:items.map(x=>x.published?x:{id:x.id,published:false})});
    }
    if(path==='/api/admin/faq'&&req.method==='PUT'){
      requireAdmin();
      if(typeof body.id!=='string'||body.id.length>60||!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(body.id)||typeof body.published!=='boolean'||!['Стоимость и сроки','Оплата и договор','Разработка и правки','Поддержка','Код и права','Сотрудничество'].includes(body.category))fail('Проверьте идентификатор, тему и статус');
      if(typeof body.question!=='string'||!body.question.trim()||body.question.length>200||typeof body.answer!=='string'||!body.answer.trim()||body.answer.length>1500)fail('Заполните вопрос и ответ');
      const item={id:body.id,category:body.category,published:body.published,question:body.question.trim(),answer:body.answer.trim()};
      await run("INSERT INTO content(id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data",'faq:'+item.id,JSON.stringify(item));return json({ok:true});
    }

    if(path==='/api/documents'||/^\/api\/documents\/[\w-]+$/.test(path)){
      requireUser();const adminView=user.role==='admin';
      const canRead=async d=>{const lead=await one('SELECT user_id FROM leads WHERE id=?',d.leadId);return !!lead&&(adminView||lead.user_id===user.id);};
      const present=d=>adminView?d:{id:d.id,number:d.number,leadId:d.leadId,title:d.versions.find(v=>v.version===d.publishedVersion)?.title||d.title,kind:d.kind,publishedVersion:d.publishedVersion,versions:d.versions.filter(v=>v.version===d.publishedVersion)};
      if(path==='/api/documents'&&req.method==='GET'){
        const docs=(await all("SELECT data FROM content WHERE id LIKE 'document:%'")).map(r=>JSON.parse(r.data));const visible=[];
        for(const d of docs)if(await canRead(d)&&(adminView||d.publishedVersion))visible.push(present(d));return json({documents:visible.sort((a,b)=>b.versions.at(-1).created.localeCompare(a.versions.at(-1).created))});
      }
      const kinds=['Коммерческое предложение','Смета','Техническое задание','Договор','Счёт','Акт','Передача прав'];
      const valid=()=>{if(typeof body.title!=='string'||!body.title.trim()||body.title.length>200||typeof body.text!=='string'||!body.text.trim()||body.text.length>8000)fail('Заполните название и текст документа (до 8000 символов)');};
      if(path==='/api/documents'&&req.method==='POST'){
        requireAdmin();valid();if(!kinds.includes(body.kind))fail('Выберите тип документа');const lead=await one('SELECT id FROM leads WHERE id=?',text(body.leadId,100));if(!lead)fail('Проект не найден',404);
        const id=crypto.randomUUID(),created=new Date().toISOString();const d={id,number:'OT-'+created.slice(0,4)+'-'+id.replaceAll('-','').toUpperCase(),leadId:lead.id,title:body.title.trim(),kind:body.kind,publishedVersion:null,versions:[{version:1,title:body.title.trim(),text:body.text.trim(),created,author:user.id}]};
        await run('INSERT INTO content(id,data) VALUES (?,?)','document:'+id,JSON.stringify(d));return json({document:d},201);
      }
      if(path!=='/api/documents'){
        const id=path.split('/').at(-1),row=await one('SELECT data FROM content WHERE id=?','document:'+id);if(!row)fail('Документ не найден',404);const d=JSON.parse(row.data);
        if(!(await canRead(d))||(!adminView&&!d.publishedVersion))fail('Документ не найден',404);
        if(req.method==='GET')return json({document:present(d)});
        if(req.method==='PUT'){
          requireAdmin();const latest=d.versions.at(-1);if(body.expectedVersion!==latest.version||body.expectedPublishedVersion!==d.publishedVersion)fail('Документ изменился. Обновите его перед сохранением',409);
          if(body.action==='revise'){valid();if(d.versions.length>=50)fail('Достигнут лимит 50 версий');d.title=body.title.trim();d.versions.push({version:latest.version+1,title:body.title.trim(),text:body.text.trim(),created:new Date().toISOString(),author:user.id});}
          else if(body.action==='publish'){if(body.reviewed!==true)fail('Подтвердите проверку документа');d.publishedVersion=latest.version;}
          else if(body.action==='withdraw')d.publishedVersion=null;else fail('Неизвестное действие');
          const updated=await run('UPDATE content SET data=? WHERE id=? AND data=?',JSON.stringify(d),'document:'+id,row.data);if(updated.meta?.changes===0||updated.changes===0)fail('Документ изменился. Обновите страницу',409);return json({document:d});
        }
      }
      return json({error:'Метод не поддерживается'},405);
    }

    if(/^\/api\/leads\/[\w-]+\/attachments$/.test(path)||/^\/api\/attachments\/[\w-]+$/.test(path)){
      requireUser();const leadRoute=path.startsWith('/api/leads/');const id=path.split('/')[3];let row=null,attachment=null;
      if(!leadRoute){row=await one('SELECT data FROM content WHERE id=?','attachment:'+id);if(!row)fail('Файл не найден',404);attachment=JSON.parse(row.data);}
      const lead=await one('SELECT id,user_id FROM leads WHERE id=?',leadRoute?id:attachment.leadId);
      if(!lead||(user.role!=='admin'&&lead.user_id!==user.id))fail('Проект или файл не найден',404);
      const meta=a=>{const {base64,...rest}=a;return {...rest,canArchive:user.role==='admin'||a.uploadedBy===user.id};};
      if(leadRoute&&req.method==='GET')return json({attachments:(await all("SELECT data FROM content WHERE id LIKE 'attachment:%' AND json_extract(data,'$.leadId')=?",lead.id)).map(r=>meta(JSON.parse(r.data)))});
      if(leadRoute&&req.method==='POST'){
        await rate('attachments',25);const filename=body.filename;
        if(typeof filename!=='string'||filename.length>120||!filename.trim()||/[\/\\\x00-\x1f\x7f]/.test(filename))fail('Укажите корректное имя файла');
        if(typeof body.base64!=='string'||body.base64.length>699052||body.base64.length%4||! /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(body.base64))fail('Некорректные данные файла');
        if(btoa(atob(body.base64))!==body.base64)fail('Некорректные данные файла');const bytes=Uint8Array.from(atob(body.base64),c=>c.charCodeAt(0));if(!bytes.length||bytes.length>524288)fail('Размер файла — от 1 байта до 512 КБ');
        const ext=filename.split('.').at(-1).toLowerCase();const prefix=String.fromCharCode(...bytes.slice(0,12));let valid=false;
        if(ext==='pdf')valid=prefix.startsWith('%PDF-');
        if(ext==='png')valid=[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
        if(['jpg','jpeg'].includes(ext))valid=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
        if(ext==='webp')valid=prefix.startsWith('RIFF')&&prefix.slice(8,12)==='WEBP';
        if(ext==='txt'){try{const decoded=new TextDecoder('utf-8',{fatal:true}).decode(bytes);valid=!/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(decoded);}catch{valid=false;}}
        if(!valid)fail('Допустимы PDF, PNG, JPG, WebP и TXT в UTF-8 с соответствующим содержимым');
        const item={id:crypto.randomUUID(),leadId:lead.id,filename:filename.trim(),size:bytes.length,uploadedBy:user.id,created:new Date().toISOString(),archived:false,base64:body.base64};
        const inserted=await run("INSERT INTO content(id,data) SELECT ?,? WHERE (SELECT COUNT(*) FROM content WHERE id LIKE 'attachment:%' AND json_extract(data,'$.leadId')=?)<10 AND (SELECT COUNT(*) FROM content WHERE id LIKE 'attachment:%' AND json_extract(data,'$.uploadedBy')=?)<100",'attachment:'+item.id,JSON.stringify(item),lead.id,user.id);
        if(inserted.meta?.changes===0||inserted.changes===0)fail('Лимит: 10 файлов на проект и 100 загрузок на пользователя, включая архив',409);return json({attachment:meta(item)},201);
      }
      if(!leadRoute&&req.method==='GET'){
        if(attachment.archived)fail('Файл в архиве. Сначала восстановите его',404);
        const bytes=Uint8Array.from(atob(attachment.base64),c=>c.charCodeAt(0));return new Response(bytes,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':"attachment; filename=download.bin; filename*=UTF-8''"+encodeURIComponent(attachment.filename).replace(/['()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase()),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin','Content-Security-Policy':'sandbox'}});
      }
      if(!leadRoute&&req.method==='PUT'){
        if(user.role!=='admin'&&attachment.uploadedBy!==user.id)fail('Менять архив может автор файла или команда',403);
        if(typeof body.archived!=='boolean')fail('Проверьте статус файла');attachment.archived=body.archived;
        const updated=await run('UPDATE content SET data=? WHERE id=? AND data=?',JSON.stringify(attachment),'attachment:'+id,row.data);if(updated.meta?.changes===0||updated.changes===0)fail('Файл изменился. Обновите список',409);return json({attachment:meta(attachment)});
      }
      return json({error:'Метод не поддерживается'},405);
    }

    if(path==='/api/admin/seo'){
      requireAdmin();if(req.method==='GET')return json({pages:(await all("SELECT data FROM content WHERE id LIKE 'seo:%'")).map(r=>JSON.parse(r.data))});
      if(req.method==='PUT'){
        if(typeof body.path!=='string'||body.path.length>120||!/^\/(?:services(?:\/[a-z0-9-]+)?|portfolio(?:\/[a-z0-9-]+)?|about|contacts|faq)?$/.test(body.path)||typeof body.title!=='string'||body.title.length>160||typeof body.description!=='string'||body.description.length>320)fail('Проверьте адрес, заголовок (до 160) и описание (до 320 символов)');
        const item={path:body.path,title:body.title.trim(),description:body.description.trim()};await run('INSERT INTO content(id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data','seo:'+item.path,JSON.stringify(item));return json({ok:true});
      }
    }
    if (path === "/api/me") return json({ user });
    if (path === "/api/admin/claim" && req.method === "POST") {
      requireUser();
      await rate("admin", 5);
      if (
        !env.ADMIN_SETUP_KEY ||
        !body.key ||
        (await hash(String(body.key))) !== (await hash(env.ADMIN_SETUP_KEY))
      )
        fail("Неверный ключ настройки", 403);
      const existing = await one(
        "SELECT id FROM users WHERE role='admin' LIMIT 1",
      );
      if (existing) fail("Администратор уже назначен", 409);
      await run(
        "UPDATE users SET role='admin' WHERE id=? AND NOT EXISTS (SELECT 1 FROM users WHERE role='admin')",
        user.id,
      );
      return json({ ok: true });
    }
    if ((path === "/api/content" || path === "/api/admin/content") && req.method === "GET") {
      if(path === "/api/admin/content")requireAdmin();
      const c = await one("SELECT data FROM content WHERE id=?", "public");
      const data=c ? JSON.parse(c.data) : {projects:[],prices:{},contacts:{}};
      if(path === "/api/content")data.projects=(data.projects||[]).filter(p=>p.confirmed===true);
      return json(data);
    }
    if (path === "/api/content" && req.method === "PUT") {
      requireAdmin();
      if (!body.contacts || typeof body.contacts !== "object" || Array.isArray(body.contacts) || Object.values(body.contacts).some(v=>typeof v!=="string" || v.length>1000)) fail("Контакты должны быть текстом не длиннее 1000 символов");
      if (body.prices !== undefined && (!body.prices || typeof body.prices !== "object" || Array.isArray(body.prices) ||
        Object.entries(body.prices).some(([key,value]) => /^(?:OV-[0-9]{3}|P26-[0-9]{1,3})$/.test(key) &&
          (typeof value !== "string" || (value !== "" && (!/^[0-9]{1,8}(?:\.[0-9]{1,2})?$/.test(value) || Number(value) <= 0)))))) fail("Укажите корректную сумму в рублях");
      if (!Array.isArray(body.projects) || body.projects.length > 30)
        fail("Некорректные проекты");
      const projectKeys=new Set();
      for (const p of body.projects) {
        if(!p||typeof p.title!=='string'||!p.title.trim()||p.title.length>200||typeof p.category!=='string'||!p.category.trim()||p.category.length>100||typeof p.description!=='string'||!p.description.trim()||p.description.length>1500)fail('Заполните название, категорию и описание проекта');
        for(const key of ['task','result','technologies'])if(p[key]!==undefined&&(typeof p[key]!=='string'||p[key].length>1500))fail('Текст проекта слишком длинный');
        if(p.confirmed!==undefined&&typeof p.confirmed!=='boolean')fail('Проверьте согласование публикации');
        if(p.slug && (typeof p.slug!=='string'||p.slug.length>60||!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)||p.slug.startsWith('concept-')||['aura-studio','flow-crm','pulse-bot'].includes(p.slug)))fail('Укажите уникальный адрес страницы проекта');
        if(!p.slug&&['AURA Studio','Flow CRM','Pulse Bot'].includes(p.title))fail('Название совпадает с концепцией: задайте другой адрес страницы');
        const projectKey=p.slug||p.title;if(projectKeys.has(projectKey))fail('Адреса или названия проектов не должны повторяться');projectKeys.add(projectKey);
        if (p.url && !/^https:\/\//.test(p.url))
          fail("Ссылка должна начинаться с https://");
        if (p.image && !/^https:\/\//.test(p.image))
          fail("Изображение должно быть доступно по https://");
      }
      await run(
        "INSERT INTO content(id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data",
        "public",
        JSON.stringify(body),
      );
      return json({ ok: true });
    }
    if (path === "/api/register" && req.method === "POST") {
      await rate("auth", 15);
      const email = text(body.email, 200).toLowerCase(),
        name = text(body.name, 80),
        pass = body.password;
      if (
        !name ||
        !/^\S+@\S+\.\S+$/.test(email) ||
        typeof pass !== "string" ||
        pass.length < 10 ||
        pass.length > 128
      )
        fail("Укажите имя, почту и пароль от 10 до 128 символов");
      if (!body.consent) fail("Необходимо согласие на обработку данных");
      if (await one("SELECT id FROM users WHERE email=?", email))
        fail("Не удалось зарегистрироваться с этой почтой");
      const salt = crypto.randomUUID();
      const id = crypto.randomUUID();
      await run(
        "INSERT INTO users(id,name,email,password,salt,created) VALUES (?,?,?,?,?,?)",
        id,
        name,
        email,
        await password(pass, salt),
        salt,
        new Date().toISOString(),
      );
      await recordConsent(id, "account");
      return json({ ok: true });
    }
    if (path === "/api/login" && req.method === "POST") {
      await rate("auth", 15);
      const email = text(body.email, 200).toLowerCase();
      const u = await one("SELECT * FROM users WHERE email=?", email);
      const p = await password(
        typeof body.password === "string" ? body.password : "",
        u?.salt || "invalid",
      );
      if (!u || u.password !== p) fail("Неверная почта или пароль", 401);
      const token = crypto.randomUUID() + crypto.randomUUID();
      await run(
        "INSERT INTO sessions(token,user_id,expires) VALUES (?,?,?)",
        await hash(token),
        u.id,
        Date.now() + 604800000,
      );
      return json({ ok: true }, 200, {
        "Set-Cookie": `ot_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${url.protocol === "https:" ? "; Secure" : ""}`,
      });
    }
    if (path === "/api/logout" && req.method === "POST") {
      if (cookie)
        await run("DELETE FROM sessions WHERE token=?", await hash(cookie));
      return json({ ok: true }, 200, {
        "Set-Cookie": "ot_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
      });
    }
    if (path === "/api/leads" && req.method === "POST") {
      await rate("leads", 10);
      const name = text(body.name, 80),
        contact = text(body.contact, 200),
        service = text(body.service, 100),
        description = text(body.description, 5000);
      if (
        !name ||
        !contact ||
        !service ||
        description.length < 10 ||
        !body.consent
      )
        fail(
          "Заполните все поля, опишите задачу (от 10 символов) и подтвердите согласие",
        );
      const id = crypto.randomUUID();
      const created = new Date().toISOString();
      const sql="INSERT INTO leads(id,user_id,name,contact,service,description,created) VALUES (?,?,?,?,?,?,?)";
      const args=[id,user?.id||null,name,contact,service,description,created];
      if (env.OS5_PRICES) {
        const consent={recordId:id,purpose:'inquiry',version:body.consentVersion==='2026-11-16.1'?body.consentVersion:'legacy-unspecified',accepted:true,created};
        const mutations=[db.prepare(sql).bind(...args),db.prepare('INSERT INTO content(id,data) VALUES (?,?)').bind('consent:'+id,JSON.stringify(consent))];
        if (typeof body.referral==='string' && /^[a-z0-9][a-z0-9-]{2,39}$/.test(body.referral)) {
          mutations.push(db.prepare('INSERT INTO os5_referrals(request_id,partner_id,created) SELECT ?,id,? FROM os5_partners WHERE active=1 AND code=?')
            .bind(id,created,body.referral));
        }
        await db.batch(mutations);
      } else {
        await run(sql,...args);await recordConsent(id,'inquiry');
      }
      return json({ id });
    }
    if (path === "/api/leads" && req.method === "GET") {
      requireUser();
      return json({
        leads:
          user.role === "admin"
            ? await all("SELECT * FROM leads ORDER BY created DESC")
            : await all(
                "SELECT * FROM leads WHERE user_id=? ORDER BY created DESC",
                user.id,
              ),
      });
    }
    const match = path.match(/^\/api\/leads\/([\w-]+)(\/messages)?$/);
    if (match) {
      requireUser();
      const lead = await one("SELECT * FROM leads WHERE id=?", match[1]);
      if (!lead || (user.role !== "admin" && lead.user_id !== user.id))
        fail("Проект не найден", 404);
      if (match[2]) {
        if (req.method === "GET")
          return json({
            messages: await all(
              "SELECT m.id,m.text,m.created,u.name,u.role FROM messages m JOIN users u ON u.id=m.user_id WHERE m.lead_id=? ORDER BY m.created",
              lead.id,
            ),
          });
        if (req.method === "POST") {
          const value = text(body.text, 3000);
          if (!value) fail("Сообщение пустое");
          await run(
            "INSERT INTO messages(id,lead_id,user_id,text,created) VALUES (?,?,?,?,?)",
            crypto.randomUUID(),
            lead.id,
            user.id,
            value,
            new Date().toISOString(),
          );
          return json({ ok: true });
        }
      }
      if (req.method === "PATCH") {
        requireAdmin();
        if (
          !statuses.includes(body.status) ||
          !Number.isSafeInteger(body.price) ||
          body.price < 0
        )
          fail("Проверьте статус и стоимость");
        await run(
          "UPDATE leads SET status=?,price=?,due=? WHERE id=?",
          body.status,
          body.price,
          text(body.due, 40),
          lead.id,
        );
        return json({ ok: true });
      }
    }
    if (path === "/api/estimates") {
      requireAdmin();
      if (req.method === "GET")
        return json({
          estimates: await all("SELECT * FROM estimates ORDER BY created DESC"),
        });
      if (req.method === "POST") {
        if (
          !text(body.title, 200) ||
          !Number.isSafeInteger(body.total) ||
          body.total < 0
        )
          fail("Проверьте расчёт");
        await run(
          "INSERT INTO estimates(id,user_id,title,data,total,created) VALUES (?,?,?,?,?,?)",
          crypto.randomUUID(),
          user.id,
          text(body.title, 200),
          JSON.stringify(body.data),
          body.total,
          new Date().toISOString(),
        );
        return json({ ok: true });
      }
    }
    if (path === "/api/profile" && req.method === "PUT") {
      requireUser();
      const name = text(body.name, 80);
      if (!name) fail("Введите имя");
      await run("UPDATE users SET name=? WHERE id=?", name, user.id);
      return json({ ok: true });
    }
    return json({ error: "Не найдено" }, 404);
  } catch (e) {
    if (!e.status) console.error(e);
    return json(
      {
        error: e.status
          ? e.message
          : "Не удалось выполнить запрос. Попробуйте позже",
      },
      e.status || 500,
    );
  }
}
