const os5Id = () => crypto.randomUUID();
const os5Stamp = () => new Date().toISOString();
export const os5Request = /^\/api\/os5(?:\/|$)/;

export async function os5(request, path, user, body, db, prices, {fail,text,hex,json}) {
  const os5NotFound = () => fail("Запись не найдена",404);
  if (!user) fail('Войдите в аккаунт',401);
  const owner = user.role === 'admin';
  const manager = user.role === 'manager';
  const method = request.method;
  const [, , , section, id, action, sub] = path.split('/');
  const one = (sql,...args) => db.prepare(sql).bind(...args).first();
  const all = async (sql,...args) => (await db.prepare(sql).bind(...args).all()).results;
  const command = (sql,...args) => db.prepare(sql).bind(...args);
  const mutate = (...commands) => db.batch(commands);
  const commandAudit = (entity, key, event, detail = {}) => command(
    'INSERT INTO os5_audit(actor_id,entity,entity_id,action,detail,created) VALUES (?,?,?,?,?,?)',
    user.id, entity, key, event, JSON.stringify(detail), os5Stamp(),
  );
  const staff = () => { if (!owner) fail('Требуются права владельца',403); };
  const required = (value,label,max=200) => {
    const safe=text(value,max+1);
    if (!safe || safe.length>max) fail('Проверьте поле «'+label+'»');
    return safe;
  };
  const get = async (table,key) => {
    const value=await one('SELECT * FROM '+table+' WHERE id=?',key);
    if (!value) os5NotFound();
    return value;
  };
  const date = (value) => {
    if (typeof value!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) ||
      new Date(value).toISOString().slice(0,10)!==value) fail('Укажите действительную дату');
    return value;
  };
  const options = (value, values) => {
    if (!values.includes(value)) fail('Проверьте выбранное значение');
    return value;
  };
  const amount = (value,max=10000000000) => {
    if (!Number.isSafeInteger(value) || value<1 || value>max) fail('Сумму укажите целым числом в копейках');
    return value;
  };
  const verifiedPdf = async (value) => {
    if (typeof value!=='string' || value.length>699052 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) fail('Укажите PDF не больше 512 КБ');
    let data;
    try { data=atob(value); } catch { fail('Некорректный PDF'); }
    if (btoa(data)!==value || data.length>524288 || !data.startsWith('%PDF-') || !data.trimEnd().endsWith('%%EOF')) fail('Некорректный PDF');
    const bytes=Uint8Array.from(data,c=>c.charCodeAt(0));
    return {value, digest:hex(await crypto.subtle.digest('SHA-256',bytes))};
  };
  const getProject = async (projectId) => {
    const project=await one(`SELECT p.id,p.title,p.client_id,p.created,c.name AS client_name FROM os5_projects p
       JOIN os5_clients c ON c.id=p.client_id WHERE p.id=? AND (?=1 OR (?=1 AND p.owner_id=?) OR EXISTS
       (SELECT 1 FROM os5_memberships m WHERE m.project_id=p.id AND m.user_id=?))`,projectId,Number(owner),Number(manager),user.id,user.id);
    if (!project) os5NotFound();
    return project;
  };
  const canReadInvoice = async (invoiceId) => {
    if (owner) return;
    if (!await one(`SELECT 1 FROM os5_projects p JOIN os5_memberships m ON m.project_id=p.id
      JOIN os5_invoices i ON i.id=p.invoice_id WHERE i.id=? AND m.user_id=? AND i.issued_at IS NOT NULL AND i.revoked_at IS NULL`,invoiceId,user.id)) os5NotFound();
  };
  if (section==='maintenance') {
    const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    const period=today.slice(0,7)+'-01';
    if (!id&&method==='GET') return json({items:await all(`
      SELECT m.*,p.title AS project_title,c.name AS client_name,
        (SELECT COALESCE(SUM(w.minutes),0) FROM os5_maintenance_work w WHERE w.plan_id=m.id AND w.worked_on>=? AND w.worked_on<=?) AS used_minutes
      FROM os5_maintenance_plans m JOIN os5_projects p ON p.id=m.project_id
      JOIN os5_clients c ON c.id=p.client_id WHERE ?=1 OR (?=1 AND p.owner_id=?) OR
        (?=0 AND EXISTS(SELECT 1 FROM os5_memberships a WHERE a.project_id=p.id AND a.user_id=?))
      ORDER BY m.active DESC,m.created DESC`,period,today,Number(owner),Number(manager),user.id,Number(manager),user.id)});
    if (!owner&&!manager) fail('Требуются права сотрудника',403);
    const minutes = (value,max) => {
      if (!Number.isInteger(value)||value<1||value>max) fail('Укажите допустимое целое число минут');
      return value;
    };
    if (!id&&method==='POST') {
      staff();
      const project=await getProject(body.projectId);
      const key=os5Id();
      await mutate(command('INSERT INTO os5_maintenance_plans(id,project_id,title,monthly_minutes,created) VALUES (?,?,?,?,?)',
        key,project.id,required(body.title,'Название услуги'),minutes(body.monthlyMinutes,44640),os5Stamp()),
        commandAudit('maintenance',key,'created',{projectId:project.id}));
      return json({id:key},201);
    }
    if (id) {
      const plan=await get('os5_maintenance_plans',id);
      if (manager&&!await one('SELECT id FROM os5_projects WHERE id=? AND owner_id=?',plan.project_id,user.id)) os5NotFound();
      if (!action&&method==='GET') return json({work:await all(`SELECT w.*,u.name AS actor_name
        FROM os5_maintenance_work w LEFT JOIN users u ON u.id=w.actor_id WHERE w.plan_id=?
        ORDER BY w.worked_on DESC,w.created DESC`,id)});
      if (!action&&method==='PUT') {
        staff();
        if (typeof body.active!=='boolean') fail('Укажите состояние обслуживания');
        await mutate(command('UPDATE os5_maintenance_plans SET active=? WHERE id=?',Number(body.active),id),
          commandAudit('maintenance',id,body.active?'resumed':'paused'));
        return json({ok:true});
      }
      if (action==='work'&&method==='POST') {
        const workedOn=date(body.workedOn);
        if (workedOn>today) fail('Дата работ не может быть в будущем');
        const key=os5Id();
        await mutate(command(`INSERT INTO os5_maintenance_work(id,plan_id,actor_id,worked_on,minutes,note,created)
          SELECT ?,id,?,?,?,?,? FROM os5_maintenance_plans WHERE id=? AND active=1
          AND (?=1 OR EXISTS(SELECT 1 FROM os5_projects p WHERE p.id=project_id AND p.owner_id=?))`,
          key,user.id,workedOn,minutes(body.minutes,1440),required(body.note,'Выполненные работы',2000),os5Stamp(),id,Number(owner),user.id));
        if (!await one('SELECT id FROM os5_maintenance_work WHERE id=?',key)) fail('Обслуживание приостановлено или доступ изменился',409);
        return json({id:key},201);
      }
    }
    os5NotFound();
  }
  if (['profile','alert-settings'].includes(section) && !id) {
    const key='os5:'+section+':'+user.id;
    const previous=JSON.parse((await one('SELECT data FROM content WHERE id=?',key))?.data||'{}');
    if (method==='GET') return json({settings:previous});
    if (method==='PUT') {
      let settings;
      const commands=[];
      if (section==='profile') {
        const name=required(body.name,'Имя',80);
        settings={phone:text(body.phone,60),tz:options(body.tz,['Europe/Moscow','Europe/Kaliningrad','Europe/Stockholm'])};
        commands.push(command('UPDATE users SET name=? WHERE id=?',name,user.id));
      } else {
        const setting=options(body.key,['inapp_leads','inapp_tasks','inapp_payments','inapp_renewals','email_leads','email_project','email_renewals','email_services','email_news']);
        if (typeof body.enabled!=='boolean') fail('Укажите состояние уведомления');
        settings={...previous,[setting]:body.enabled};
        await mutate(command("INSERT INTO content(id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=json_set(content.data,?,json(?))",
          key,JSON.stringify(settings),'$.'+setting,JSON.stringify(body.enabled)));
        return json({settings});
      }
      commands.push(command('INSERT INTO content(id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',key,JSON.stringify(settings)));
      await mutate(...commands);
      return json({settings});
    }
  }
  if (section==='preferences' && !id) {
    if (method==='GET') return json({preferences:await one('SELECT theme,accent,layout,density FROM os5_preferences WHERE user_id=?',user.id)});
    if (method==='PUT') {
      const {theme,accent,layout,density}=body;
      options(theme,['light','dark']);options(accent,['blue','mint','violet','graphite']);
      options(layout,['left','top','right','bottom']);options(density,['comfortable','compact']);
      await mutate(command(`INSERT INTO os5_preferences VALUES (?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE
        SET theme=excluded.theme,accent=excluded.accent,layout=excluded.layout,density=excluded.density`,user.id,theme,accent,layout,density));
      return json({preferences:{theme,accent,layout,density}});
    }
  }
  if (section==='projects' && !id && method==='GET') return json({projects:await all(`SELECT p.id,p.title,p.created,c.name client_name,
    (SELECT COUNT(*) FROM os5_milestones m WHERE m.project_id=p.id AND m.approved_at IS NOT NULL) AS completed_count
    FROM os5_projects p JOIN os5_clients c ON c.id=p.client_id WHERE ?=1 OR (?=1 AND p.owner_id=?) OR EXISTS
    (SELECT 1 FROM os5_memberships m WHERE m.project_id=p.id AND m.user_id=?) ORDER BY p.created DESC`,Number(owner),Number(manager),user.id,user.id)});
  if (section==='projects' && id) {
    const project=await getProject(id);
    if (method==='GET' && !action) return json({project,
      milestones:await all('SELECT position,title,ready_at,approved_at FROM os5_milestones WHERE project_id=? ORDER BY position',id),
      infrastructure:await all('SELECT id,kind,title,provider,renewed_until,payer FROM os5_infrastructure WHERE project_id=? ORDER BY renewed_until',id),
      support:await all('SELECT id,kind,subject,body,created,resolved_at FROM os5_support WHERE project_id=? ORDER BY created DESC',id),
      documents:manager?[]:await all('SELECT i.id,i.number,i.issued_at FROM os5_invoices i JOIN os5_projects p ON p.invoice_id=i.id WHERE p.id=? AND i.revoked_at IS NULL',id),
    });
    if (method==='POST' && action==='support') {
      const key=os5Id(), kind=options(body.kind,['question','defect','change']);
      const subject=required(body.subject,'Тема'), message=required(body.body,'Описание',6000);
      await mutate(command('INSERT INTO os5_support(id,project_id,author_id,kind,subject,body,created) VALUES (?,?,?,?,?,?,?)',key,id,user.id,kind,subject,message,os5Stamp()),commandAudit('project',id,'support-created',{ticketId:key,kind}));
      return json({id:key},201);
    }
    if (method==='PUT' && action==='milestones' && /^[1-6]$/.test(sub||'')) {
      staff();
      await mutate(command('UPDATE os5_milestones SET ready_at=? WHERE project_id=? AND position=? AND ready_at IS NULL',os5Stamp(),id,Number(sub)),
        command(`INSERT INTO os5_audit(actor_id,entity,entity_id,action,detail,created)
          SELECT ?,'project',?,'milestone-ready',?,? WHERE changes()=1`,user.id,id,JSON.stringify({position:Number(sub)}),os5Stamp()));
      return json({ok:true});
    }
    if (method==='POST' && action==='milestones' && /^[1-6]$/.test(sub||'')) {
      if (owner || manager) fail("Согласование доступно представителю заказчика",403);
      await mutate(command(`UPDATE os5_milestones SET approved_at=? WHERE project_id=? AND position=? AND ready_at IS NOT NULL AND approved_at IS NULL
        AND NOT EXISTS(SELECT 1 FROM os5_milestones WHERE project_id=? AND position<? AND approved_at IS NULL)`,os5Stamp(),id,Number(sub),id,Number(sub)),
        command(`INSERT INTO os5_audit(actor_id,entity,entity_id,action,detail,created)
          SELECT ?,'project',?,'milestone-acknowledgement',?,? WHERE changes()=1`,user.id,id,JSON.stringify({position:Number(sub)}),os5Stamp()));
      const row=await one('SELECT approved_at FROM os5_milestones WHERE project_id=? AND position=?',id,Number(sub));
      if (!row?.approved_at) fail('Этап ещё не передан на согласование или не завершены предыдущие этапы',409);
      return json({ok:true});
    }
    if (method==='POST' && action==='memberships') {
      staff();
      const target=required(body.userId,'ID пользователя');
      if (!await one("SELECT 1 FROM users WHERE id=? AND role='client'",target)) os5NotFound();
      const basis=required(body.basis,'Основание подтверждения',1200);
      await mutate(command('INSERT INTO os5_memberships VALUES (?,?,?,?,?) ON CONFLICT(project_id,user_id) DO NOTHING',id,target,user.id,basis,os5Stamp()),
        commandAudit('project',id,'membership-granted',{userId:target,basis}));
      return json({ok:true});
    }
    if (method==='DELETE' && action==='memberships' && sub) {
      staff();
      await mutate(command('DELETE FROM os5_memberships WHERE project_id=? AND user_id=?',id,sub),commandAudit('project',id,'membership-revoked',{userId:sub}));
      return json({ok:true});
    }
    if (method==='POST' && action==='infrastructure') {
      staff();
      const key=os5Id(),kind=options(body.kind,['domain','hosting']),payer=options(body.payer,['client','agency']);
      const title=required(body.title,'Название'), provider=required(body.provider,'Поставщик');
      await mutate(command('INSERT INTO os5_infrastructure VALUES (?,?,?,?,?,?,?,?)',key,id,kind,title,provider,date(body.renewedUntil),payer,os5Stamp()),
        commandAudit('project',id,'infrastructure-added',{id:key}));
      return json({id:key},201);
    }
  }
  if (section==='support' && id && action==='messages') {
    const ticket=await get('os5_support',id);
    await getProject(ticket.project_id);
    if (method==='GET') return json({messages:await all(`SELECT m.id,u.name author,m.body,m.created
      FROM os5_support_messages m JOIN users u ON u.id=m.sender_id WHERE m.ticket_id=? ORDER BY m.created,m.id`,id)});
    if (method==='POST') {
      const key=os5Id(),message=required(body.body,'Сообщение',6000);
      await mutate(command('INSERT INTO os5_support_messages VALUES(?,?,?,?,?)',key,id,user.id,message,os5Stamp()),
        commandAudit('support',id,'message-added',{id:key}));
      return json({id:key},201);
    }
  }
  if ((owner||manager) && method==='POST' && section==='support' && id && action==='resolve') {
    const ticket=await get('os5_support',id);
    await getProject(ticket.project_id);
    if (typeof body.resolved!=='boolean') fail('Укажите статус обращения');
    await mutate(command('UPDATE os5_support SET resolved_at=? WHERE id=? AND EXISTS (SELECT 1 FROM os5_projects WHERE id=os5_support.project_id AND (?=1 OR owner_id=?))',
      body.resolved?os5Stamp():null,id,Number(owner),user.id),command(`INSERT INTO os5_audit(actor_id,entity,entity_id,action,created)
        SELECT ?,'support',?,?,? WHERE changes()=1`,user.id,id,body.resolved?'resolved':'reopened',os5Stamp()));
    return json({ok:true});
  }
  if (section==='invoices' && id && action==='pdf' && method==='GET') {
    await canReadInvoice(id);
    const row=await one('SELECT number,pdf FROM os5_invoices WHERE id=? AND issued_at IS NOT NULL AND revoked_at IS NULL',id);
    if (!row) os5NotFound();
    return new Response(Uint8Array.from(atob(row.pdf),c=>c.charCodeAt(0)),{headers:{
      'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="'+row.number+'.pdf"',
      'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',
    }});
  }
  if ((owner||manager) && method==='GET' && !id && section==='staff') {
    return json({items:await all("SELECT id,name FROM users WHERE role IN ('admin','manager') ORDER BY name,id")});
  }
  if ((owner||manager) && method==='GET' && !id && section==='requests') {
    return json({items:await all(`SELECT l.id,l.user_id,l.name,l.contact,l.service,l.description,l.status,l.created,
      d.id AS deal_id,p.name AS partner_name,w.stage,w.responsible_id,u.name AS responsible_name,COALESCE(w.version,0) AS version,
      EXISTS(SELECT 1 FROM content c WHERE c.id='consent:'||l.id) AS consent_recorded
      FROM leads l LEFT JOIN os5_lead_workflow w ON w.lead_id=l.id LEFT JOIN users u ON u.id=w.responsible_id
      LEFT JOIN os5_deals d ON d.request_id=l.id LEFT JOIN os5_referrals r ON r.request_id=l.id
      LEFT JOIN os5_partners p ON p.id=r.partner_id
      WHERE ?=1 OR w.responsible_id=? ORDER BY l.created DESC`,Number(owner),user.id)});
  }
  if ((owner||manager) && method==='POST' && section==='requests' && id && ['assign','stage'].includes(action)) {
    await get('leads',id);
    const state=await one('SELECT * FROM os5_lead_workflow WHERE lead_id=?',id);
    const responsible=state?.responsible_id??null;
    if (!owner&&responsible!==user.id) os5NotFound();
    if (action==='assign'&&responsible!==user.id&&!(owner&&!responsible))
      fail('Передать лид может только его ответственный',403);
    const assigning=action==='assign';
    const stage=assigning?(state?.stage||'new'):options(body.stageId,['new','contact','qualified','closed']);
    const target=assigning?required(body.userId,'Ответственный'):responsible;
    if (assigning&&!await one("SELECT 1 FROM users WHERE id=? AND role IN ('admin','manager')",target))
      fail('Выберите сотрудника',400);
    if (!assigning&&await one('SELECT 1 FROM os5_deals WHERE request_id=?',id))
      fail('Лид уже переведён в сделку',409);
    const version=state?.version??0;
    if (body.version!==version) fail('Карточка изменилась. Обновите воронку',409);
    const result=await mutate(command(`INSERT INTO os5_lead_workflow(lead_id,responsible_id,stage,version)
        SELECT ?,?,?,1 WHERE (?=1 OR NOT EXISTS(SELECT 1 FROM os5_deals WHERE request_id=?))
        ON CONFLICT(lead_id) DO UPDATE SET responsible_id=excluded.responsible_id,stage=excluded.stage,version=os5_lead_workflow.version+1
        WHERE os5_lead_workflow.version=?`,id,target,stage,Number(assigning),id,version),
      command(`INSERT INTO os5_audit(actor_id,entity,entity_id,action,detail,created)
        SELECT ?,'request',?,?,?,? WHERE changes()=1`,user.id,id,assigning?'assigned':'stage',
        JSON.stringify(assigning?{from:responsible,to:target}:{from:state?.stage||'new',to:stage}),os5Stamp()));
    if (!(result[0].meta?.changes??result[0].changes)) fail('Карточка изменилась. Обновите воронку',409);
    return json({ok:true});
  }
  if (manager && method==='GET' && !id && section==='infrastructure') {
    return json({items:await all(`SELECT i.* FROM os5_infrastructure i JOIN os5_projects p ON p.id=i.project_id
      WHERE p.owner_id=? ORDER BY i.renewed_until,i.id`,user.id)});
  }
  if (manager && method==='GET' && !id && section==='stages') return json({items:await all('SELECT * FROM os5_stages ORDER BY position,id')});
  if (manager && method==='GET' && !id && section==='deals') return json({items:await all(`SELECT d.id,d.title,d.stage_id,d.version,d.owner_id,d.request_id,d.created,
    c.name AS client_name,p.id AS project_id FROM os5_deals d JOIN os5_clients c ON c.id=d.client_id
    LEFT JOIN os5_projects p ON p.deal_id=d.id WHERE d.owner_id=? AND d.archived_at IS NULL ORDER BY d.created DESC`,user.id)});
  if (manager && method==='GET' && !id && section==='support') return json({items:await all(`SELECT s.id,s.project_id,s.kind,s.subject,s.body,s.created,s.resolved_at
    FROM os5_support s JOIN os5_projects p ON p.id=s.project_id WHERE p.owner_id=? ORDER BY s.created DESC`,user.id)});
  if (manager && method==='POST' && section==='deals' && id && action==='stage') {
    const deal=await get('os5_deals',id);
    if (deal.owner_id!==user.id || deal.archived_at) os5NotFound();
    const target=await get('os5_stages',required(body.stageId,'Этап'));
    if (target.id==='won' || deal.stage_id==='won') fail('Успех фиксируется конвертацией в проект',409);
    if (deal.version!==body.version) fail('Сделка уже изменилась',409);
    const result=await mutate(command('UPDATE os5_deals SET stage_id=?,version=version+1 WHERE id=? AND version=? AND owner_id=?',
      target.id,id,deal.version,user.id),command(`INSERT INTO os5_audit(actor_id,entity,entity_id,action,detail,created)
      SELECT ?,'deal',?,'stage',?,? WHERE changes()=1`,user.id,id,JSON.stringify({from:deal.stage_id,to:target.id}),os5Stamp()));
    if (!(result[0].meta?.changes ?? result[0].changes)) fail('Сделка уже изменилась',409);
    return json({ok:true});
  }
  if (!(manager && method==='POST' && section==='deals' && id && action==='assign')) staff();
  if (section==='requests' && !action && (method==='POST'&&!id || method==='PUT'&&id)) {
    const args=[required(body.name,'Имя',80),required(body.contact,'Контакт',200),
      required(body.service,'Услуга',100),required(body.description,'Описание',5000)];
    if (id) {
      await get('leads',id);
      await mutate(command('UPDATE leads SET name=?,contact=?,service=?,description=? WHERE id=?',...args,id),commandAudit('request',id,'updated'));
      return json({ok:true});
    }
    if (body.consent!==true) fail('Подтвердите согласие клиента на обработку данных');
    const key=os5Id(),created=os5Stamp();
    const consent={recordId:key,purpose:'inquiry',version:'2026-11-16.1',accepted:true,created,source:'staff-recorded',actor:user.id};
    await mutate(command('INSERT INTO leads(id,name,contact,service,description,created) VALUES (?,?,?,?,?,?)',key,...args,created),
      command('INSERT INTO content(id,data) VALUES (?,?)','consent:'+key,JSON.stringify(consent)),commandAudit('request',key,'created'));
    return json({id:key},201);
  }
  if (method==='GET' && !id) {
    const lists={
      clients:'SELECT * FROM os5_clients WHERE archived_at IS NULL ORDER BY created DESC',
      deals:`SELECT d.*,c.name AS client_name,p.id AS project_id FROM os5_deals d JOIN os5_clients c ON c.id=d.client_id
        LEFT JOIN os5_projects p ON p.deal_id=d.id WHERE d.archived_at IS NULL ORDER BY d.created DESC`,
      stages:'SELECT * FROM os5_stages ORDER BY position,id',
      briefs:'SELECT b.*,d.title AS deal_title FROM os5_briefs b JOIN os5_deals d ON d.id=b.deal_id ORDER BY b.created DESC',
      quotes:'SELECT q.*,d.title AS deal_title FROM os5_quotes q JOIN os5_deals d ON d.id=q.deal_id ORDER BY q.created DESC',
      invoices:`SELECT i.id,i.deal_id,i.number,i.total,i.start_min,i.created,i.issued_at,i.pdf_hash,i.revoked_at,
        d.title deal_title, (SELECT COUNT(*) FROM os5_signatures s WHERE s.invoice_id=i.id AND s.reviewed_at IS NOT NULL) reviewed,
        COALESCE((SELECT SUM(p.amount) FROM os5_payments p WHERE p.invoice_id=i.id AND p.verified_at IS NOT NULL),0) paid
        FROM os5_invoices i JOIN os5_deals d ON d.id=i.deal_id ORDER BY i.created DESC`,
      partners:'SELECT p.*, (SELECT COUNT(*) FROM os5_referrals r WHERE r.partner_id=p.id) AS referrals FROM os5_partners p ORDER BY p.created DESC',
      mail:'SELECT * FROM os5_mail_drafts ORDER BY updated_at DESC',
      payments:'SELECT p.*,i.number FROM os5_payments p JOIN os5_invoices i ON i.id=p.invoice_id ORDER BY p.created DESC',
      tasks:'SELECT * FROM os5_tasks ORDER BY done_at ASC,due_on ASC,created DESC',
      support:'SELECT * FROM os5_support ORDER BY created DESC',
      infrastructure:'SELECT * FROM os5_infrastructure ORDER BY renewed_until',
      users:'SELECT id,name,email,role,created FROM users ORDER BY created DESC',
      notifications:"SELECT l.id,l.name,l.service,l.created,r.created AS read_at FROM leads l LEFT JOIN os5_request_reads r ON r.request_id=l.id AND r.user_id=? ORDER BY l.created DESC LIMIT 200",
      archive:`SELECT id,name title,archived_at,'client' AS kind FROM os5_clients WHERE archived_at IS NOT NULL
        UNION ALL SELECT id,title,archived_at,'deal' FROM os5_deals WHERE archived_at IS NOT NULL ORDER BY archived_at DESC`,
      audit:'SELECT seq,actor_id,entity,entity_id,action,detail,created FROM os5_audit ORDER BY seq DESC LIMIT 100',
    };
    if (section==='org') return json({organization:JSON.parse((await one('SELECT data FROM os5_org WHERE id=1'))?.data||'null')});
    if (section==='prices') return json({items:Object.values(prices)});
    if (section==='overview' || section==='analytics') return json({counts:await one(`SELECT
      (SELECT COUNT(*) FROM leads) AS requests,(SELECT COUNT(*) FROM os5_clients WHERE archived_at IS NULL) AS clients,
      (SELECT COUNT(*) FROM os5_deals WHERE archived_at IS NULL AND stage_id NOT IN ('won','lost')) AS deals,
      (SELECT COUNT(*) FROM os5_projects) AS projects,(SELECT COUNT(*) FROM os5_tasks WHERE done_at IS NULL) AS open_tasks,
      (SELECT COALESCE(SUM(total),0) FROM os5_invoices WHERE issued_at IS NOT NULL AND revoked_at IS NULL) AS billed,
      (SELECT COALESCE(SUM(amount),0) FROM os5_payments WHERE verified_at IS NOT NULL) AS received`),attribution:'unconfigured'});
    if (section==="notifications") return json({items:await all(lists.notifications,user.id)});
    if (Object.hasOwn(lists,section)) return json({items:await all(lists[section])});
  }
  if (method==='PUT' && section==='infrastructure' && id) {
    await get('os5_infrastructure',id);
    const until=date(body.renewedUntil);
    await mutate(command('UPDATE os5_infrastructure SET renewed_until=? WHERE id=?',until,id),
      commandAudit('infrastructure',id,'renewal-updated',{until}));
    return json({ok:true});
  }
  if (method==='POST' && section==='notifications' && id && action==='read') {
    await get('leads',id);
    await mutate(command('INSERT INTO os5_request_reads VALUES(?,?,?) ON CONFLICT(user_id,request_id) DO NOTHING',user.id,id,os5Stamp()));
    return json({ok:true});
  }
  if (method==='POST' && section==='partners' && !id) {
    const key=os5Id(), name=required(body.name,'Имя партнёра');
    const code=required(body.code,'Код',40).toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{2,39}$/.test(code)) fail('Для кода используйте 3–40 латинских букв, цифр или дефисов');
    await mutate(command('INSERT INTO os5_partners(id,name,code,created) VALUES(?,?,?,?)',key,name,code,os5Stamp()),commandAudit('partner',key,'created'));
    return json({id:key},201);
  }
  if (method==='POST' && section==='partners' && id && action==='toggle') {
    await get('os5_partners',id);
    if (typeof body.active!=='boolean') fail('Укажите статус партнёра');
    await mutate(command('UPDATE os5_partners SET active=? WHERE id=?',Number(body.active),id),commandAudit('partner',id,'status',{active:body.active}));
    return json({ok:true});
  }
  if (section==='mail' && ((method==='POST' && !id)||(method==='PUT' && id && !action))) {
    const recipient=required(body.recipient,'Получатель');
    if (!/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(recipient)) fail('Проверьте email получателя');
    const subject=required(body.subject,'Тема'),message=required(body.body,'Сообщение',9000);
    if (id) {
      await get('os5_mail_drafts',id);
      await mutate(command('UPDATE os5_mail_drafts SET recipient=?,subject=?,body=?,updated_at=? WHERE id=?',recipient,subject,message,os5Stamp(),id),
        commandAudit('mail',id,'draft-updated'));
      return json({ok:true});
    }
    const key=os5Id();
    await mutate(command('INSERT INTO os5_mail_drafts(id,author_id,recipient,subject,body,created,updated_at) VALUES(?,?,?,?,?,?,?)',
      key,user.id,recipient,subject,message,os5Stamp(),os5Stamp()),commandAudit('mail',key,'draft-created'));
    return json({id:key},201);
  }
  if (method==='GET' && section==='clients' && id && !action) {
    const client=await get('os5_clients',id);
    return json({client,deals:await all('SELECT id,title,stage_id FROM os5_deals WHERE client_id=? ORDER BY created DESC',id),
      projects:await all('SELECT id,title FROM os5_projects WHERE client_id=? ORDER BY created DESC',id)});
  }
  if (method==='GET' && section==='deals' && id && !action) {
    const deal=await get('os5_deals',id);
    return json({deal,client:await get('os5_clients',deal.client_id),
      request:deal.request_id?await get('leads',deal.request_id):null,
      project:await one('SELECT id,title FROM os5_projects WHERE deal_id=?',id),
      invoices:await all('SELECT id,number,issued_at,revoked_at FROM os5_invoices WHERE deal_id=? ORDER BY created DESC',id),
      activity:await all("SELECT action,created FROM os5_audit WHERE entity='deal' AND entity_id=? ORDER BY seq DESC",id)});
  }
  if (method==='POST' && section==='users' && id && action==='role') {
    const account=await get('users',id);
    const role=options(body.role,['client','manager']);
    if (account.role==='admin') fail('Роль владельца нельзя менять из CRM',403);
    if (role==='manager' && await one('SELECT 1 FROM os5_memberships WHERE user_id=?',id))
      fail('Для работы менеджера используйте отдельную учётную запись',409);
    if (role==='client' && (await one('SELECT 1 FROM os5_lead_workflow WHERE responsible_id=?',id) ||
      await one('SELECT 1 FROM os5_deals WHERE owner_id=? AND archived_at IS NULL',id) ||
      await one('SELECT 1 FROM os5_projects WHERE owner_id=?',id))) fail('Сначала переназначьте записи менеджера',409);
    const basis=required(body.basis,'Основание изменения роли',1200);
    await mutate(command("UPDATE users SET role=? WHERE id=? AND role<>'admin'",role,id),command('DELETE FROM sessions WHERE user_id=?',id),
      commandAudit('user',id,'role-changed',{role,basis}));
    return json({ok:true});
  }
  if (method==='POST' && section==='deals' && id && action==='assign') {
    const deal=await get('os5_deals',id);
    if (!owner&&deal.owner_id!==user.id) os5NotFound();
    const target=required(body.userId,'Ответственный');
    if (!await one("SELECT 1 FROM users WHERE id=? AND role IN ('admin','manager')",target)) os5NotFound();
    if (deal.stage_id==='won' || deal.archived_at) fail('Передача завершённой сделки не поддерживается',409);
    if (body.version!==undefined&&body.version!==deal.version) fail('Сделка уже изменилась',409);
    const result=await mutate(command("UPDATE os5_deals SET owner_id=?,version=version+1 WHERE id=? AND version=? AND stage_id<>'won' AND archived_at IS NULL",
      target,id,deal.version),command(`INSERT INTO os5_audit(actor_id,entity,entity_id,action,detail,created)
      SELECT ?,'deal',?,'assigned',?,? WHERE changes()=1`,user.id,id,JSON.stringify({ownerId:target}),os5Stamp()));
    if (!(result[0].meta?.changes ?? result[0].changes)) fail('Сделка уже изменилась',409);
    return json({ok:true});
  }
  if (section==='clients' && !action && (method==='POST'&&!id || method==='PUT'&&id)) {
    const kind=options(body.kind,['person','entrepreneur','company']),name=required(body.name,'Имя или наименование');
    const email=text(body.email,200).toLowerCase()||null,rawPhone=text(body.phone,60),taxId=text(body.taxId,30)||null;
    const digits=rawPhone.replace(/\D/g,'');
    const phone=digits.length===11 && /^[78]/.test(digits)?'7'+digits.slice(1):digits||null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Проверьте email');
    if (rawPhone && (!phone || phone.length<10 || phone.length>15)) fail('Проверьте телефон');
    if (kind!=='person' && !taxId) fail('Для организации или ИП требуется ИНН');
    if (taxId && !new RegExp(kind==='company'?'^\\d{10}$':'^\\d{12}$').test(taxId)) fail('Проверьте ИНН');
    if (!email && !phone && !taxId) fail('Укажите хотя бы один идентификатор контрагента');
    const details=Object.fromEntries(['address','signatory','authority','registration','kpp'].map(key=>[key,text(body[key],400)]));
    if (id) await get('os5_clients',id);
    const duplicate=await all('SELECT id FROM os5_clients WHERE (email=? OR phone=? OR tax_id=?) AND id<>?',email,phone,taxId,id||'');
    if (duplicate.length===1) return json({id:duplicate[0].id,existing:true},409);
    if (duplicate.length>1) fail('Контакты совпали у нескольких карточек. Проверьте контрагентов вручную',409);
    if (id) {
      await mutate(command('UPDATE os5_clients SET kind=?,name=?,email=?,phone=?,tax_id=?,details=? WHERE id=?',kind,name,email,phone,taxId,JSON.stringify(details),id),
        commandAudit('client',id,'updated'));
      return json({id});
    }
    const key=os5Id();
    await mutate(command('INSERT INTO os5_clients(id,kind,name,email,phone,tax_id,details,created) VALUES (?,?,?,?,?,?,?,?)',key,kind,name,email,phone,taxId,JSON.stringify(details),os5Stamp()),commandAudit('client',key,'created'));
    return json({id:key},201);
  }
  if (method==='POST' && ((section==='deals'&&!id) || (section==='requests'&&id&&action==='convert'))) {
    const requestId=section==='requests'?id:null;
    const source=requestId?await get('leads',requestId):null;
    const previous=source&&await one('SELECT id FROM os5_deals WHERE request_id=?',source.id);
    if (previous) return json({id:previous.id,existing:true});
    const client=await get('os5_clients',required(body.clientId,'Клиент'));
    if (client.archived_at) fail('Восстановите клиента перед созданием сделки',409);
    const title=required(body.title||source?.service,'Название сделки'),key=os5Id();
    await mutate(command(`INSERT INTO os5_deals(id,request_id,client_id,owner_id,stage_id,title,created)
        VALUES (?,?,?,COALESCE((SELECT responsible_id FROM os5_lead_workflow WHERE lead_id=?),?),'new',?,?)
        ON CONFLICT(request_id) DO NOTHING`,key,requestId,client.id,requestId,user.id,title,os5Stamp()),
      command(`INSERT INTO os5_audit(actor_id,entity,entity_id,action,created) SELECT ?,'deal',id,'created',?
        FROM os5_deals WHERE id=?`,user.id,os5Stamp(),key));
    const deal=requestId?await one('SELECT id FROM os5_deals WHERE request_id=?',requestId):{id:key};
    return json({id:deal.id,existing:deal.id!==key},deal.id===key?201:200);
  }
  if (method==='POST' && section==='stages' && !id) {
    const key=os5Id(),title=required(body.title,'Название этапа',70);
    await mutate(command('INSERT INTO os5_stages SELECT ?,?,COALESCE(MAX(position),0)+10,0 FROM os5_stages',key,title),commandAudit('stage',key,'created'));
    return json({id:key},201);
  }
  if (method==='PUT' && section==='stages' && id) {
    await get('os5_stages',id);
    const title=required(body.title,'Название этапа',70);
    await mutate(command('UPDATE os5_stages SET title=? WHERE id=?',title,id),commandAudit('stage',id,'renamed'));
    return json({ok:true});
  }
  if (method==='PUT' && section==='deals' && id && !action) {
    const row=await get('os5_deals',id),title=required(body.title,'Название сделки');
    if (row.archived_at||row.version!==body.version) fail('Сделка уже изменилась или архивирована',409);
    const result=await mutate(command('UPDATE os5_deals SET title=?,version=version+1 WHERE id=? AND version=?',title,id,body.version),
      command('INSERT INTO os5_audit(actor_id,entity,entity_id,action,created) SELECT ?,?,?,?,? WHERE changes()=1',user.id,'deal',id,'updated',os5Stamp()));
    if (!(result[0].meta?.changes??result[0].changes)) fail('Сделка уже изменилась',409);
    return json({ok:true});
  }
  if (method==='DELETE' && section==='stages' && id) {
    const stage=await get('os5_stages',id);
    if (stage.terminal || id==='new' || await one('SELECT 1 FROM os5_deals WHERE stage_id=?',id)) fail('Этап защищён или содержит сделки',409);
    await mutate(command('DELETE FROM os5_stages WHERE id=?',id),commandAudit('stage',id,'deleted'));
    return json({ok:true});
  }
  if (method==='POST' && section==='deals' && id && action==='stage') {
    const deal=await get('os5_deals',id), target=await get('os5_stages',required(body.stageId,'Этап'));
    if (target.id==='won' || deal.stage_id==='won' || deal.archived_at) fail('Успех фиксируется конвертацией в проект',409);
    if (deal.version!==body.version) fail('Сделка уже изменилась. Обновите карточку',409);
    const result=await mutate(command('UPDATE os5_deals SET stage_id=?,version=version+1 WHERE id=? AND version=?',target.id,id,deal.version),
      command(`INSERT INTO os5_audit(actor_id,entity,entity_id,action,detail,created)
        SELECT ?,'deal',?,'stage',?,? WHERE changes()=1`,user.id,id,JSON.stringify({from:deal.stage_id,to:target.id}),os5Stamp()));
    if (!(result[0].meta?.changes ?? result[0].changes)) fail('Сделка уже изменилась',409);
    return json({ok:true});
  }
  if (method==='POST' && section==='briefs' && !id) {
    const deal=await get('os5_deals',required(body.dealId,'Сделка'));
    const scope=required(body.scope,'Объём работ',8000),key=os5Id();
    await mutate(command(`INSERT INTO os5_briefs(id,deal_id,revision,scope,author_id,created)
      SELECT ?,?,COALESCE(MAX(revision),0)+1,?,?,? FROM os5_briefs WHERE deal_id=?`,key,deal.id,scope,user.id,os5Stamp(),deal.id),commandAudit('brief',key,'created'));
    return json({id:key},201);
  }
  if (method==='POST' && section==='briefs' && id && action==='approve') {
    await get('os5_briefs',id);
    const basis=required(body.basis,'Основание согласования',1200);
    await mutate(command('UPDATE os5_briefs SET approved_at=?,approved_by=? WHERE id=? AND approved_at IS NULL',os5Stamp(),user.id,id),
      command(`INSERT INTO os5_audit(actor_id,entity,entity_id,action,detail,created) SELECT ?,'brief',?,'approved',?,? WHERE changes()=1`,
        user.id,id,JSON.stringify({basis}),os5Stamp()));
    return json({ok:true});
  }
  if (method==='POST' && section==='quotes' && !id) {
    const brief=await get('os5_briefs',required(body.briefId,'Бриф'));
    if (!brief.approved_at) fail('Сначала согласуйте бриф',409);
    if (!Array.isArray(body.lines) || !body.lines.length || body.lines.length>30) fail('Добавьте позиции из прайса');
    const lines=body.lines.map(line=>{
      const price=typeof line?.code==='string' && Object.hasOwn(prices,line.code)?prices[line.code]:null;
      if (!price || price.period!=='once') fail('Выберите разовую позицию из утверждённого прайса');
      const quantity=amount(line.quantity,1000);
      return {code:price.code,name:price.name,scope:price.scope,quantity,unitAmount:price.minor};
    });
    if (new Set(lines.map(line=>line.code)).size!==lines.length) fail('Объедините повторяющиеся позиции в одной строке');
    const total=amount(lines.reduce((sum,line)=>sum+line.quantity*line.unitAmount,0)),key=os5Id();
    await mutate(command(`INSERT INTO os5_quotes SELECT ?,?,?,COALESCE(MAX(revision),0)+1,?,?,? FROM os5_quotes WHERE deal_id=?`,
      key,brief.deal_id,brief.id,JSON.stringify(lines),total,os5Stamp(),brief.deal_id),commandAudit('quote',key,'created'));
    return json({id:key,total},201);
  }
  if (section==='org' && method==='PUT' && !id) {
    const fields=['name','taxId','registration','address','signatory','bank','bik','account','correspondent','tax','templateApproval'];
    const organization=Object.fromEntries(fields.map(key=>[key,text(body[key],400)]));
    await mutate(command('INSERT INTO os5_org VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at',
      JSON.stringify(organization),os5Stamp()),commandAudit('organization','1','updated'));
    return json({ok:true});
  }
  if (method==='POST' && section==='invoices' && !id) {
    const quote=await get('os5_quotes',required(body.quoteId,'Смета')),key=os5Id();
    const min=body.startMinor===undefined||body.startMinor===''?quote.total:amount(body.startMinor,quote.total);
    const terms=text(body.terms,2000);
    if (min<quote.total && terms.length<12) fail('Для частичной оплаты зафиксируйте график платежей');
    const number='IC-'+os5Stamp().slice(0,4)+'-'+key;
    await mutate(command('INSERT INTO os5_invoices(id,deal_id,quote_id,number,total,start_min,terms,created) VALUES (?,?,?,?,?,?,?,?)',
      key,quote.deal_id,quote.id,number,quote.total,min,terms,os5Stamp()),commandAudit('invoice',key,'draft-created'));
    return json({id:key,number},201);
  }
  if (section==='invoices' && id && !action && method==='GET') {
    const row=await get('os5_invoices',id);
    const {pdf,...invoice}=row;
    const quote=await get('os5_quotes',invoice.quote_id);
    const deal=await get('os5_deals',invoice.deal_id);
    return json({invoice,quote,client:await get('os5_clients',deal.client_id),
      signatures:await all('SELECT id,source_hash,pdf_hash,created,reviewed_at,review_basis FROM os5_signatures WHERE invoice_id=?',id)});
  }
  if (method==='POST' && section==='invoices' && id && action==='issue') {
    const invoice=await get('os5_invoices',id);
    if (invoice.issued_at || invoice.revoked_at) fail('Счёт-договор уже выпускался или отозван',409);
    const org=JSON.parse((await one('SELECT data FROM os5_org WHERE id=1'))?.data||'{}');
    if (!['name','address','signatory','bank','tax','templateApproval'].every(key=>org[key]) || !/^\d{9}$/.test(org.bik||'') ||
      !/^\d{20}$/.test(org.account||'') || !/^\d{20}$/.test(org.correspondent||'') ||
      !/^\d{10}(?:\d{2})?$/.test(org.taxId||'') || !/^\d{13}(?:\d{2})?$/.test(org.registration||'')) fail('Заполните банк, налоговый статус и реквизиты организации. Укажите согласование шаблона',409);
    const deal=await get('os5_deals',invoice.deal_id),client=await get('os5_clients',deal.client_id);
    const details=JSON.parse(client.details);
    if (!details.address || (client.kind==='entrepreneur'&&!/^\d{15}$/.test(details.registration)) ||
      (client.kind==='company'&&(!/^\d{13}$/.test(details.registration)||!/^\d{9}$/.test(details.kpp)||!details.signatory||!details.authority))) fail('Заполните реквизиты заказчика по его типу',409);
    if (body.reviewed!==true) fail('Подтвердите сверку PDF со сметой, графиком и реквизитами');
    const pdf=await verifiedPdf(body.pdf),quote=await get('os5_quotes',invoice.quote_id),brief=await get('os5_briefs',quote.brief_id);
    const snapshot=JSON.stringify({number:invoice.number,org,client,quote,brief,total:invoice.total,startMinor:invoice.start_min,terms:invoice.terms});
    await mutate(command('UPDATE os5_invoices SET issued_at=?,snapshot=?,pdf=?,pdf_hash=? WHERE id=? AND issued_at IS NULL AND revoked_at IS NULL',
      os5Stamp(),snapshot,pdf.value,pdf.digest,id),commandAudit('invoice',id,'issued',{sha256:pdf.digest}));
    return json({ok:true,sha256:pdf.digest});
  }
  if (method==='POST' && section==='invoices' && id && action==='revoke') {
    await get('os5_invoices',id);
    const basis=required(body.basis,'Основание отзыва',1600);
    await mutate(command('UPDATE os5_invoices SET revoked_at=? WHERE id=? AND revoked_at IS NULL',os5Stamp(),id),commandAudit('invoice',id,'revoked',{basis}));
    return json({ok:true});
  }
  if (method==='POST' && section==='invoices' && id && action==='signed') {
    const invoice=await get('os5_invoices',id);
    if (!invoice.issued_at || invoice.revoked_at) fail('Сначала выпустите счёт-договор',409);
    const pdf=await verifiedPdf(body.pdf), key=os5Id();
    if (pdf.digest===invoice.pdf_hash) fail('Загрузите отдельный подписанный экземпляр');
    await mutate(command('INSERT INTO os5_signatures(id,invoice_id,source_hash,pdf,pdf_hash,created) VALUES (?,?,?,?,?,?)',key,id,invoice.pdf_hash,pdf.value,pdf.digest,os5Stamp()),
      commandAudit('invoice',id,'signature-evidence-uploaded',{signatureId:key,sha256:pdf.digest}));
    return json({id:key},201);
  }
  if (method==='GET' && section==='signatures' && id && action==='pdf') {
    const signature=await get('os5_signatures',id);
    return new Response(Uint8Array.from(atob(signature.pdf),c=>c.charCodeAt(0)),{headers:{
      'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="signed-evidence.pdf"',
      'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff',
    }});
  }
  if (method==='POST' && section==='signatures' && id && action==='review') {
    const signature=await get('os5_signatures',id);
    if (body.bothParties!==true) fail('Подтвердите проверку подписей обеих сторон');
    const basis=required(body.basis,'Основание проверки',1800);
    await mutate(command('UPDATE os5_signatures SET reviewed_at=?,reviewed_by=?,review_basis=? WHERE id=? AND reviewed_at IS NULL',
      os5Stamp(),user.id,basis,id),command(`INSERT INTO os5_audit(actor_id,entity,entity_id,action,detail,created)
      SELECT ?,'invoice',?,'signatures-reviewed',?,? WHERE changes()=1`,user.id,signature.invoice_id,JSON.stringify({signatureId:id,basis}),os5Stamp()));
    return json({ok:true});
  }
  if (method==='POST' && section==='payments' && !id) {
    const invoice=await get('os5_invoices',required(body.invoiceId,'Счёт-договор'));
    if (!invoice.issued_at || invoice.revoked_at) fail('Можно сверять только действующий счёт-договор',409);
    const reference=required(body.reference,'Банковский идентификатор').toLowerCase();
    const proof=required(body.proof,'Документ или запись выписки',1800), value=amount(body.amount);
    const refund=body.refundOf?required(body.refundOf,'Платёж для возврата'):null;
    if (refund && !await one('SELECT 1 FROM os5_payments WHERE id=? AND invoice_id=? AND amount>0 AND verified_at IS NOT NULL',refund,invoice.id)) fail('Для возврата выберите подтверждённое поступление по этому счёту');
    const key=os5Id();
    await mutate(command('INSERT INTO os5_payments(id,invoice_id,bank_ref,amount,refund_of,proof,occurred_on,created) VALUES (?,?,?,?,?,?,?,?)',
      key,invoice.id,reference,refund?-value:value,refund,proof,date(body.occurredOn),os5Stamp()),commandAudit('payment',key,'recorded'));
    return json({id:key},201);
  }
  if (method==='POST' && section==='payments' && id && action==='verify') {
    const payment=await get('os5_payments',id);
    if (payment.verified_at) return json({ok:true,existing:true});
    const basis=required(body.basis,'Основание сверки',1800);
    await mutate(command('UPDATE os5_payments SET verified_at=?,verified_by=? WHERE id=? AND verified_at IS NULL',os5Stamp(),user.id,id),
      command(`INSERT INTO os5_audit(actor_id,entity,entity_id,action,detail,created)
        SELECT ?,'payment',?,'verified',?,? WHERE changes()=1`,user.id,id,JSON.stringify({basis}),os5Stamp()));
    return json({ok:true});
  }
  if (method==='POST' && section==='deals' && id && action==='project') {
    const old=await one('SELECT id FROM os5_projects WHERE deal_id=?',id);
    if (old) return json({id:old.id,existing:true});
    const deal=await get('os5_deals',id);
    const invoice=await one('SELECT id,pdf_hash,start_min FROM os5_invoices WHERE deal_id=? AND issued_at IS NOT NULL AND revoked_at IS NULL',id);
    if (!invoice) fail('Выпустите действующий счёт-договор',409);
    if (!await one('SELECT 1 FROM os5_signatures WHERE invoice_id=? AND source_hash=? AND reviewed_at IS NOT NULL',invoice.id,invoice.pdf_hash)) fail('Требуется проверка двусторонней подписи',409);
    const net=await one('SELECT COALESCE(SUM(amount),0) paid FROM os5_payments WHERE invoice_id=? AND verified_at IS NOT NULL',invoice.id);
    if (net.paid<invoice.start_min) fail('Сумма подтверждённых поступлений пока недостаточна',409);
    const key=os5Id();
    await mutate(command(`INSERT INTO os5_projects SELECT ?,d.id,d.client_id,?,d.owner_id,?,d.title,? FROM os5_deals d
      WHERE d.id=? AND NOT EXISTS(SELECT 1 FROM os5_projects WHERE deal_id=?)`,key,invoice.id,user.id,os5Stamp(),deal.id,deal.id));
    const result=await one('SELECT id FROM os5_projects WHERE deal_id=?',id);
    return json({id:result.id,existing:result.id!==key},result.id===key?201:200);
  }
  if (method==='POST' && section==='tasks' && !id) {
    const deal=await get('os5_deals',required(body.dealId,'Сделка'));
    const key=os5Id(),title=required(body.title,'Задача');
    await mutate(command('INSERT INTO os5_tasks(id,deal_id,title,due_on,created) VALUES (?,?,?,?,?)',key,deal.id,title,body.dueOn?date(body.dueOn):null,os5Stamp()),commandAudit('deal',deal.id,'task-created',{taskId:key}));
    return json({id:key},201);
  }
  if (method==='POST' && section==='tasks' && id && action==='done') {
    await get('os5_tasks',id);
    const done=body.done!==false;
    await mutate(command('UPDATE os5_tasks SET done_at=? WHERE id=?',done?os5Stamp():null,id),commandAudit('task',id,done?'done':'reopened'));
    return json({ok:true});
  }
  if (method==='PUT' && section==='tasks' && id && !action) {
    await get('os5_tasks',id);
    const title=required(body.title,'Задача');
    await mutate(command('UPDATE os5_tasks SET title=?,due_on=? WHERE id=?',title,body.dueOn?date(body.dueOn):null,id),commandAudit('task',id,'updated'));
    return json({ok:true});
  }
  if (method==='POST' && ['deals','clients'].includes(section) && id && ['archive','restore'].includes(action)) {
    const table=section==='deals'?'os5_deals':'os5_clients';
    await get(table,id);
    if (action==='archive') {
      const linked=section==='deals'?'SELECT 1 FROM os5_invoices WHERE deal_id=? AND revoked_at IS NULL':
        'SELECT 1 FROM os5_deals WHERE client_id=? AND archived_at IS NULL';
      if (await one(linked,id)) fail('В карточке есть действующие связи',409);
    }
    await mutate(command('UPDATE '+table+' SET archived_at=? WHERE id=?',action==='archive'?os5Stamp():null,id),commandAudit(section,id,action));
    return json({ok:true});
  }
  os5NotFound();
}

export function os5Error(error,json) {
  const reason=String(error?.message||'');
  if (reason.includes('os5_project_gate')) return json({error:'Условия конвертации изменились. Проверьте подписи, оплату и согласованный объём.'},409);
  if (reason.includes('os5_refund_limit')) return json({error:'Возврат превышает подтверждённый остаток платежа'},409);
  if (/constraint|os5_.*immutable/i.test(reason)) return json({error:'Запись конфликтует с уже сохранёнными данными. Обновите страницу.'},409);
  if (reason.includes("os5_invoice_revoke_guard")) return json({error:"Счёт связан с подтверждённой подписью, платёжной записью или проектом"},409);
  if (/os5_(client_has_deals|deal_has_agreement|deal_active_client|invoice_active_deal)/.test(reason)) return json({error:"Операция конфликтует с действующими связями"},409);
  if (error?.status) return json({error:error.message},error.status);
  return json({error:'Операция CRM недоступна'},500);
}
