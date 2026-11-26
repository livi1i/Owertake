import {createTemplates} from './templates.js';
import {S,ui,clientPages,defaultAppearance,applyData,pageData,os,request,get,id,minor,rubles} from './model.js';

const managerPages=['overview','deals','projects','support','settings'];
const owner=()=>S.user?.role==='admin';
const allowedPages=()=>ui.clientPortal?clientPages:owner()?view.nav.flatMap(([,items])=>items.map(([key])=>key)):managerPages;
const staffNav=()=>view.nav.map(([label,items])=>[label,items.filter(([key])=>allowedPages().includes(key))]).filter(([,items])=>items.length);
const onlyClientProjects=()=>S.projects;
const supported=action=>{
  const [verb,type,record]=action.split(':');
  if (verb==='go') return allowedPages().includes(type);
  if (verb==='stageEditor') return owner()&&type==='deals';
  if (verb==='archive') return owner()&&['clients','deals'].includes(type);
  if (verb==='add') return type==='support'||(owner()&&['request','client','deal','partner','brief','task','infra','doc','payment','mail','membership'].includes(type));
  if (verb==='edit') return owner()&&['task','request','deal','client','brief','infra','mail','user'].includes(type);
  if (verb==='taskDone') return owner();
  return !['accountSwitch','purge','sessionRevoke','security'].includes(verb);
};

let toastTimer;
function notify(message) {
  const el=document.getElementById('toast');
  el.textContent=message;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('visible'),3600);
}
function showError(error) {
  if (error.status===401 && S.user) return location.reload();
  const target=document.querySelector('#modal-root .modal');
  if (target) {
    let alert=target.querySelector('[data-form-error]');
    if (!alert) {
      alert=document.createElement('p');
      alert.className='notice peach';
      alert.dataset.formError='';
      alert.setAttribute('role','alert');
      target.append(alert);
    }
    alert.textContent=error.message;
  }
  notify(error.message);
}
let latestRead=0;
async function refresh() {
  const read=++latestRead;
  const result=await pageData(ui.page);
  if (owner()&&ui.page!=='notifications') result.notifications=await os('notifications');
  if (read!==latestRead) return;
  applyData(result);
  view.render();
}
function accountRows() {
  const {esc,icon}=view;
  return '<div class="account-row"><span class="avatar">'+esc(S.profile.name.slice(0,1))+'</span><span><b>'+
    esc(S.profile.name)+'</b><small style="display:block">'+esc(S.profile.email)+'</small></span>'+icon('check')+'</div>'+
    '<div class="divider"></div><button class="account-row" data-action="accountLogout">'+icon('logout')+'<span>Выйти</span></button>';
}
function overview() {
  const {head,icon,btn,metric,esc,tag,rawEvents}=view;
  const steps=S.dealStages.map(stage=>({label:stage.label,value:S.deals.filter(deal=>deal.stage===stage.id).length}));
  const top=Math.max(1,...steps.map(step=>step.value));
  return head('Рабочий стол','Главное по заявкам, сделкам, проектам и задачам — без лишних переходов.',
    btn(icon('plus')+' Новая заявка','add:request','primary'))+
    '<div class="metric-grid">'+metric('Заявки','Новые обращения',owner()?S.requests.length:'—','inbox')+
    metric('Открытые сделки','Перейти в воронку',S.counts.deals??S.deals.filter(deal=>!['won','lost'].includes(deal.stage)).length,'deal')+
    metric('Активные проекты','Этапы и согласования',S.counts.projects??S.projects.length,'folder','green')+
    metric('Задачи на контроле','Незакрытые задачи',owner()?S.tasks.filter(task=>!task.done).length:'—','tasks','peach')+'</div>'+
    '<div class="grid two"><div class="card"><div class="card-head"><div><div class="card-title">Новые обращения</div><div class="card-sub">Выберите заявку, чтобы посмотреть и связать её со сделкой</div></div>'+
    btn('Все заявки','go:requests','soft sm')+'</div>'+
    (S.requests.slice(0,6).map(row=>'<div class="list-item"><div class="list-round">'+icon('inbox')+'</div><div><b>'+esc(row.name)+'</b><small>'+esc(row.contact)+' · '+esc(row.source)+'</small></div>'+
      tag(row.status,'peach')+btn('Открыть','detail:request:'+row.id,'sm')+'</div>').join('')||'<div class="empty">Нет новых обращений</div>')+
    '</div><div class="card"><div class="card-head"><div class="card-title">Нужны действия</div>'+btn('Мои задачи','go:tasks','soft sm')+'</div>'+
    (S.tasks.filter(task=>!task.done).slice(0,5).map(task=>'<div class="list-item"><div class="list-round">'+icon('clock')+'</div><div><b>'+esc(task.title)+'</b><small>'+esc(task.due||'Срок не указан')+'</small></div></div>').join('')||'<div class="empty">Нет открытых задач</div>')+'</div></div>'+
    '<div class="grid equal"><div class="card"><div class="card-head"><h3 class="card-title">Продажи — путь к заказу</h3>'+btn('Открыть воронку','go:deals','soft sm')+'</div>'+
    (steps.some(step=>step.value)?'<div class="mini-chart">'+steps.map(step=>'<i title="'+esc(step.label+': '+step.value)+'" style="height:'+(step.value/top*100)+'%"></i>').join('')+'</div>':'<div class="empty">Пока нет сделок для диаграммы</div>')+
    '</div><div class="card"><div class="card-head"><h3 class="card-title">История действий</h3>'+btn('Уведомления','go:notifications','soft sm')+'</div>'+(rawEvents()||'<div class="empty">Нет событий</div>')+'</div></div>';
}
function analyticsSection(key) {
  const {metric,head,tag}=view;
  if (key==='site') return '<div class="card"><div class="card-head"><h3 class="card-title">Посещаемость сайта</h3>'+tag('Источник не подключён','peach')+'</div><div class="empty">Данные появятся после подключения веб-аналитики.</div></div>';
  const cards={
    requests:[['Заявки',S.counts.requests??S.requests.length,'inbox']],
    deals:[['Открытые сделки',S.counts.deals??S.deals.length,'deal']],
    projects:[['Проекты',S.counts.projects??S.projects.length,'folder']],
    payments:[['Выставлено',view.money(rubles(S.counts.billed||0)),'doc'],['Сверенные поступления',view.money(rubles(S.counts.received||0)),'check']],
    partners:[['Заявки партнёров',S.partners.reduce((n,p)=>n+p.requests,0),'partner']],
  }[key]||[];
  return cards.length?'<div class="metric-grid">'+cards.map(([title,value,icon])=>metric(title,'Данные CRM',value,icon)).join('')+'</div>':'<div class="card"><div class="empty">Для этой разбивки источник ещё не настроен.</div></div>';
}
const view=createTemplates({S,ui,refresh,notify,showError,allowedPages,staffNav,accountRows,overview,analyticsSection,onlyClientProjects,supported});
const {esc,btn,field,selection,textarea,wrapper,openModal,tag,table,icon,money}=view;
const opts=(rows,label='title')=>[['','— Выберите —'],...rows.map(row=>[row.id,row[label]])];
const briefOpts=()=>opts(S.briefs.filter(row=>row.approved).map(row=>({...row,label:(get('deals',row.dealId)?.title||row.dealId)+' · '+row.template})),'label');
const choice=(label,name,rows,selected='',key)=>selection(label,name,opts(rows,key),selected,'required');
const fileField=(label)=>'<div class="field"><label for="os5-pdf">'+label+'</label><input id="os5-pdf" class="input" name="pdf" type="file" accept="application/pdf,.pdf" required></div>';
const check=(label,name)=>'<label class="field full"><span><input type="checkbox" name="'+name+'" required> '+label+'</span></label>';
const download=(path,label)=>'<a class="btn soft sm" href="/api/os5/'+esc(path)+'">'+esc(label)+'</a>';
const form=(type,title,fields,{key='',desc='',label='Сохранить'}={})=>{
  const body=wrapper(type,fields,key).replace(/>Создать запись<|>Сохранить изменения</,'>'+label+'<');
  openModal(title,desc,body,'wide');
};

function add(type,preset='') {
  if (type==='request') return form(type,'Новая заявка',field('Имя заказчика','name','','text','required')+
    field('Контакт','contact','','text','required')+field('Услуга или название задачи','service','','text','required')+textarea('Описание','description')+
    check('Клиент дал согласие на обработку данных для ответа на заявку','consent'));
  if (type==='doc') return form(type,'Новый счёт-договор',choice('Подтверждённая смета','quoteId',S.quotes.map(row=>({...row,label:row.title+' · '+money(row.total)+' · v'+row.revision})),'','label')+
    field('Сумма для начала работ, ₽','start','','text','inputmode="decimal"')+textarea('График платежей и условия','terms'),{desc:'Оставьте сумму для начала пустой для полной оплаты.'});
  if (type==='payment') return form(type,'Поступление из банка',choice('Выставленный счёт','invoiceId',S.docs.filter(row=>row.issued&&!row.revoked),preset,'number')+
    field('Сумма, ₽','amount','','text','inputmode="decimal" required')+field('Идентификатор банковской операции','reference','','text','required')+
    field('Дата по выписке','occurredOn','','date','required')+textarea('Основание и ссылка на запись выписки','proof')+
    selection('Возврат по платежу (необязательно)','refundOf',opts(S.payments.filter(row=>row.verified&&row.amount>0).map(row=>({...row,label:row.reference+' · '+money(row.amount)})),'label')));
  if (type==='membership') return form(type,'Предоставить доступ к проекту',choice('Проект','projectId',S.projects,preset)+
    choice('Пользователь','userId',S.accounts.filter(row=>row.role==='customer'),'','email')+textarea('Основание проверки полномочий','basis'));
  if (type==='mail') return form(type,'Новое письмо',field('Получатель','to','','email','required')+field('Тема','subject',preset,'text','required')+
    textarea('Текст письма','body'),{label:'Сохранить черновик',desc:'Отправка станет доступна после подключения почтового сервиса.'});
  view.formOpen(type,'',type==='deal'?{clientId:preset}:type==='support'?{projectId:preset||ui.activeProject}:type==='brief'?{template:preset||'Сайт'}:{});
}
const display=(rows)=>'<div class="card">'+rows.map(([label,value])=>'<div class="list-item"><div><b>'+esc(label)+'</b><small>'+esc(value||'—')+'</small></div></div>').join('')+'</div>';
const actions=(...buttons)=>'<div class="form-actions">'+buttons.join('')+'</div>';
const opened=(name,key,body)=>openModal(name,key,body,'wide');

async function detail(type,key) {
  if (type==='deal') {
    const deal=get('deals',key);
    if (!deal) return;
    const doc=S.docs.find(row=>row.dealId===key&&!row.revoked);
    const briefs=S.briefs.filter(row=>row.dealId===key);
    const quote=S.quotes.find(row=>row.dealId===key);
    const body=display([['Название',deal.title],['Клиент',get('clients',deal.clientId)?.name||deal.clientName],['Исходная заявка',deal.requestId],['Смета',quote?money(quote.total):'Не рассчитана'],['Счёт-договор',doc?.number],['Проект',deal.projectId]])+
      (deal.stage!=='won'?wrapper('stageMove',selection('Этап сделки','stage',S.dealStages.filter(row=>row.id!=='won').map(row=>[row.id,row.label]),deal.stage),key):'')+
      (briefs.length?'<div class="card">'+table(['Бриф','Статус'],briefs.map(row=>'<tr><td>'+btn(row.template,'detail:brief:'+row.id,'sm')+'</td><td>'+tag(row.status)+'</td></tr>'))+'</div>':'')+
      actions(owner()?btn('Бриф','newBrief:'+key,'soft'):'',owner()?btn('Смета','newQuote:'+key,'soft'):'',
        owner()?btn('Назначить','assign:'+key,'soft'):'',doc?btn('Счёт-договор','detail:doc:'+doc.id,'soft'):'',
        owner()?btn('Передать в проекты','convert:'+key,'primary'):'',btn('В архив','archive:deals:'+key,'danger'));
    return opened('Сделка',key,body);
  }
  if (type==='request') {
    const row=get('requests',key);
    if (!row) return;
    return opened('Заявка',key,display([['Имя',row.name],['Контакт',row.contact],['Услуга',row.service],['Описание',row.description],['Источник',row.source]])+
      actions(btn(row.dealId?'Открыть сделку':'В сделку','requestToDeal:'+key,'primary'),btn('Изменить','edit:request:'+key,'soft')));
  }
  if (type==='client') {
    const row=get('clients',key);
    if (!row) return;
    const {deals,projects}=await os('clients/'+key);
    return opened('Клиент',key,display([['Клиент',row.name],['Email',row.email],['Телефон',row.phone],['Адрес',row.address],['ИНН',row.inn]])+
      '<div class="grid equal"><div class="card"><h3 class="card-title">Сделки</h3>'+deals.map(deal=>btn(esc(deal.title),'detail:deal:'+id(deal.id),'sm')).join('')+
      '</div><div class="card"><h3 class="card-title">Проекты</h3>'+projects.map(project=>btn(esc(project.title),'detail:project:'+id(project.id),'sm')).join('')+'</div></div>'+
      actions(btn('Новая сделка','add:deal:'+key,'primary'),btn('Изменить','edit:client:'+key,'soft'),btn('В архив','archive:clients:'+key,'danger')));
  }
  if (type==='brief') {
    const row=get('briefs',key);
    if (!row) return;
    return opened('Бриф',key,display([['Версия',row.template],['Задачи',row.goal],['Состояние',row.status]])+
      actions(row.approved?btn('Составить смету','newQuote:'+row.dealId,'primary'):btn('Согласовать бриф','approveBrief:'+key,'primary'),btn('Новая версия','edit:brief:'+key,'soft')));
  }
  if (type==='doc') {
    const {invoice,client,quote,signatures}=await os('invoices/'+key);
    const actual=JSON.parse(quote.lines);
    const body=display([['Номер',invoice.number],['Заказчик',client.name],['Сумма',money(rubles(invoice.total))],
      ['Условие старта',money(rubles(invoice.start_min))],['График',invoice.terms],['SHA-256',invoice.pdf_hash]])+
      '<div class="card">'+table(['Позиция','Кол-во','Цена'],actual.map(row=>'<tr><td>'+esc(row.name)+'</td><td>'+Number(row.quantity)+'</td><td>'+money(rubles(row.unitAmount))+'</td></tr>'))+'</div>'+
      (signatures.length?'<div class="card"><h3 class="card-title">Подписанные экземпляры</h3>'+signatures.map(signature=>'<div class="list-item"><div><b>'+
        esc(signature.created)+'</b><small>'+esc(signature.review_basis||'Подписи ожидают проверки')+'</small></div>'+
        download('signatures/'+id(signature.id)+'/pdf','Скачать')+(signature.reviewed_at?'':btn('Проверить','reviewSignature:'+id(signature.id),'soft sm'))+'</div>').join('')+'</div>':'')+
      actions(invoice.revoked_at?'':invoice.issued_at?download('invoices/'+key+'/pdf','Скачать счёт-договор')+btn('Загрузить подписанный PDF','signed:'+key,'soft')+
        btn('Добавить поступление','add:payment:'+key,'soft'):btn('Выпустить PDF','issue:'+key,'primary'),invoice.revoked_at?'':btn('Отозвать','revoke:'+key,'danger'));
    return opened('Счёт-договор',invoice.number,body);
  }
  if (type==='payment') {
    const row=get('payments',key);
    return opened('Оплата',key,display([['Счёт',row.number],['Сумма',money(row.amount)],['Запись банка',row.reference],['Выписка',row.proof],['Состояние',row.verified?'Сверено':'Ожидает сверки']])+
      actions(row.verified?'':btn('Подтвердить сверку','verifyPay:'+key,'primary')));
  }
  if (type==='project') {
    const {project,milestones,documents,infrastructure}=await os('projects/'+key);
    const body=display([['Проект',project.title],['Заказчик',project.client_name]])+'<div class="card"><h3 class="card-title">Ход проекта</h3>'+
      milestones.map(row=>'<div class="list-item"><div><b>'+esc(row.title)+'</b><small>'+(row.approved_at?'Согласован':row.ready_at?'На согласовании':'Впереди')+'</small></div>'+
        (!row.ready_at&&owner()?btn('На согласование','readyMilestone:'+key+':'+Number(row.position),'soft sm'):'')+'</div>').join('')+'</div>'+
      actions(...documents.map(row=>download('invoices/'+id(row.id)+'/pdf',row.number)),owner()?btn('Доступ к проекту','add:membership:'+key,'soft'):'',btn('Новое обращение','add:support:'+key,'soft'));
    return opened('Проект',key,body);
  }
  if (type==='support') {
    const row=get('support',key);
    if (!row) return;
    const {messages}=await os('support/'+key+'/messages');
    return opened(row.title,'Обращение',display([['Сообщение',row.body],['Тип',row.type]])+
      '<div class="card">'+messages.map(message=>'<div class="list-item"><div><b>'+esc(message.author)+'</b><small>'+esc(message.body)+'</small></div></div>').join('')+'</div>'+
      wrapper('reply',textarea('Ответ','body'),key));
  }
  if (type==='mail') {
    const row=get('mail',key);
    return form('mail','Черновик',field('Получатель','to',row.to,'email','required')+
      field('Тема','subject',row.subject,'text','required')+textarea('Текст','body',row.body),{key,desc:'Почтовая отправка пока не подключена.'});
  }
  if (type==='user') {
    const row=get('accounts',key);
    return opened('Аккаунт',key,display([['Имя',row.name],['Email',row.email],['Роль',row.role],['Дата регистрации',row.date]])+
      actions(row.role==='owner'?'':btn('Изменить роль','edit:user:'+key,'soft')));
  }
  if (type==='partner') {
    const row=get('partners',key);
    return opened('Партнёр',key,display([['Партнёр',row.name],['Ссылка',location.origin+'/?ref='+row.code],['Заявки',String(row.requests)],['Статус',row.active?'Активен':'Пауза']])+
      actions(btn('Копировать ссылку','copyPartner:'+key,'soft'),btn(row.active?'Приостановить':'Возобновить','togglePartner:'+key,'soft')));
  }
  if (type==='service') {
    const row=get('services',key);
    return opened('Услуга',key,display([['Название',row.name],['Стоимость',money(row.price)],['Состав',row.scope]]));
  }
}
let dealDraft=null;
let mutation=false;
async function saved(message='Сохранено', after) {
  view.closeModal();
  await refresh();
  if (after) await after();
  notify(message);
}
async function move(key,stage) {
  const deal=get('deals',key);
  if (stage!==deal.stage) await os('deals/'+key+'/stage','POST',{stageId:stage,version:deal.version});
}
function fieldText(type, title, label, key) {
  return form(type,title,textarea(label,'basis'),{key,label:'Подтвердить'});
}
function quoteFields(index) {
  return choice('Позиция прайса','lineCode'+index,S.services.filter(row=>row.period==='once').map(row=>({...row,label:row.name+' · '+money(row.price)})),'','label')+
    field('Количество','lineQuantity'+index,'1','number','min="1" max="1000" required');
}
function newQuote(dealId) {
  const options=briefOpts();
  const selected=S.briefs.find(row=>row.dealId===dealId&&row.approved)?.id;
  return form('quote','Смета',selection('Согласованный бриф','briefId',options,selected||'','required')+
    quoteFields(0)+'<div class="full"></div><div class="full">'+btn('Добавить строку','quoteLine','soft sm')+'</div>',{label:'Создать смету'});
}
const pdfData=file=>new Promise((resolve,reject)=>{
  if (!file?.size||file.size>524288) return reject(Error('Выберите PDF не больше 512 КБ'));
  const reader=new FileReader();
  reader.addEventListener('load',()=>resolve(reader.result.split(',')[1]),{once:true});
  reader.addEventListener('error',()=>reject(Error('Файл не удалось прочитать')),{once:true});
  reader.readAsDataURL(file);
});

function edit(type,key) {
  const fields={
    request:()=>{const row=get('requests',key);return field('Имя','name',row.name,'text','required')+
      field('Контакт','contact',row.contact,'text','required')+field('Услуга','service',row.service,'text','required')+textarea('Описание','description',row.description);},
    deal:()=>field('Название сделки','title',get('deals',key).title,'text','required'),
    task:()=>{const row=get('tasks',key);return field('Задача','title',row.title,'text','required')+field('Срок','due',row.due,'date');},
    infra:()=>field('Оплачено до','until',get('infrastructure',key).until,'date','required'),
    user:()=>selection('Роль','role',[['client','Клиент'],['manager','Менеджер']],get('accounts',key).role==='manager'?'manager':'client')+
      textarea('Основание изменения','basis'),
  };
  if (fields[type]) return form('edit'+type,'Редактировать запись',fields[type](),{key});
  if (type==='mail') return detail('mail',key);
  if (type==='brief') return view.formOpen('brief',key);
  if (type==='client') return view.formOpen('client',key);
}

async function onAction(el) {
  const [verb,type,key,sub]=el.dataset.action.split(':');
  if (verb==='go') return view.navigate(type||el.dataset.value);
  if (verb==='tab') { ui.tab=type||el.dataset.value; return view.render(); }
  if (verb==='settings') {
    view.navigate(ui.clientPortal?'client-settings':'settings');
    ui.tab=ui.clientPortal?'':type;
    return view.render();
  }
  if (verb==='directory') return view.directory();
  if (verb==='flowInfo') return view.flowInfo();
  if (verb==='pop') return view.pop(el.dataset.value);
  if (verb==='closePop') {ui.pop='';return view.renderPop();}
  if (verb==='closeModal') {
    const draft=dealDraft;
    dealDraft=null;
    if (draft) return view.formOpen('deal','',draft);
    return view.closeModal();
  }
  if (verb==='archivePolicy') return openModal('Правила хранения','Архив', '<p class="notice">Архивные карточки можно восстановить. Финансовые документы и подтверждения остаются в учёте.</p>');
  if (verb==='detail') return detail(type,key||el.dataset.id);
  if (verb==='add') {
    if (type==='client'&&document.querySelector('form[data-form="deal"]')) dealDraft=Object.fromEntries(new FormData(document.querySelector('form[data-form="deal"]')));
    if (type==='payment'&&!S.payments.length) applyData({payments:await os('payments')});
    return add(type,key);
  }
  if (verb==='edit') return edit(type,key);
  if (verb==='requestToDeal') {
    const row=get('requests',type);
    if (row.dealId) {
      if (!get('deals',row.dealId)) applyData({deals:await os('deals'),stages:await os('stages')});
      return detail('deal',row.dealId);
    }
    return form('convertRequest','Связать со сделкой',field('Название сделки','title',row.service||row.name,'text','required')+
      choice('Карточка существующего клиента','clientId',S.clients,'','name')+
      '<div class="full">'+btn('Создать клиента','clientForRequest:'+type,'soft sm')+'</div>',{key:type,label:'Создать сделку'});
  }
  if (verb==='clientForRequest') {
    dealDraft={...Object.fromEntries(new FormData(document.querySelector('form[data-form="convertRequest"]'))),requestId:type};
    return view.formOpen('client','',{name:get('requests',type)?.name});
  }
  if (verb==='assign') return form('assign','Назначить ответственного',choice('Сотрудник','userId',S.accounts.filter(row=>row.role!=='customer'),'','name'),{key:type});
  if (verb==='newBrief') return view.formOpen('brief','',{dealId:type});
  if (verb==='newQuote') return newQuote(type);
  if (verb==='quoteLine') {
    const grid=el.closest('.form-grid'), index=grid.querySelectorAll('[name^="lineCode"]').length;
    if (index<30) el.parentNode.insertAdjacentHTML('beforebegin',quoteFields(index));
    if (index===29) el.disabled=true;
    return;
  }
  if (verb==='stageEditor') return view.stageEdit('deals');
  if (verb==='deleteStage') {
    await os('stages/'+key,'DELETE',{});
    await refresh();
    return view.stageEdit('deals');
  }
  if (verb==='convert') {
    const project=await os('deals/'+type+'/project','POST',{});
    return saved('Проект готов к работе',()=>detail('project',id(project.id)));
  }
  if (verb==='approveBrief') return fieldText('approveBrief','Согласовать бриф','Основание согласования с заказчиком',type);
  if (verb==='verifyPay') return fieldText('verifyPay','Подтверждение по банку','Как проверили выписку',type);
  if (verb==='revoke') return fieldText('revoke','Отозвать счёт-договор','Причина отзыва',type);
  if (verb==='reviewSignature') return form(verb,'Проверка подписи',textarea('Основание проверки','basis')+
    check('Проверены подписи обеих сторон именно этой версии','bothParties'),{key:type,label:'Подтвердить'});
  if (verb==='signed'||verb==='issue') return form(verb,verb==='issue'?'Выпуск счёта-договора':'Подписанный экземпляр',
    fileField('Файл PDF')+(verb==='issue'?check('Сверены смета, реквизиты и график платежей','reviewed'):''),
    {key:type,label:verb==='issue'?'Выпустить':'Загрузить'});
  if (verb==='approveMilestone'||verb==='readyMilestone') {
    await os('projects/'+type+'/milestones/'+key,verb==='readyMilestone'?'PUT':'POST',{});
    return saved(verb==='readyMilestone'?'Этап на согласовании':'Этап согласован',verb==='readyMilestone'?()=>detail('project',type):null);
  }
  if (verb==='archive') {await os(type+'/'+key+'/archive','POST',{});return saved('Перенесено в архив');}
  if (verb==='restore') {await os(get('archive',type).collection+'/'+type+'/restore','POST',{});return saved('Восстановлено');}
  if (verb==='taskDone') {await os('tasks/'+type+'/done','POST',{done:!get('tasks',type).done});return saved('Задача обновлена');}
  if (verb==='read'||verb==='readAll') {
    const keys=verb==='read'?[type]:S.notifications.filter(row=>!row.read).map(row=>row.id);
    for (const key of keys) await os('notifications/'+key+'/read','POST',{});
    await refresh();
    if (verb==='read') {
      if (ui.page!=='requests') applyData({requests:await os('requests')});
      return detail('request',type);
    }
    return;
  }
  if (verb==='copyPartner') {await navigator.clipboard.writeText(location.origin+'/?ref='+get('partners',type).code);return notify('Ссылка скопирована');}
  if (verb==='togglePartner') {
    await os('partners/'+type+'/toggle','POST',{active:!get('partners',type).active});
    return saved('Статус партнёра обновлён');
  }
  if (verb==='appearance'||verb==='resetAppearance') {
    const next=verb==='resetAppearance'?defaultAppearance:{...S.appearance,[type]:key};
    viewResult(await os('preferences','PUT',{...next,density:next.density==='comfort'?'comfortable':next.density}));
    ui.pop='';
    return view.render();
  }
  if (verb==='switch') {
    S.notify=(await os('alert-settings','PUT',{key:type,enabled:!S.notify[type]})).settings;
    return view.render();
  }
  if (verb==='briefTemplate') return view.formOpen('brief','',{template:type});
  if (verb==='mailTpl') return add('mail','OVERTAKE · '+type);
  if (verb==='accountLogout') {await request('logout','POST',{});return location.assign('/');}
}
function viewResult(result) {applyData({preferences:result});}

async function submit(element) {
  const data=Object.fromEntries(new FormData(element));
  const type=element.dataset.form,key=element.dataset.id;
  if (type==='login') {
    await request('login','POST',{email:data.email,password:data.password});
    return location.reload();
  }
  if (type==='client') {
    const payload={...data,kind:data.kind==='individual'?'person':data.kind,taxId:data.inn};
    let result;
    try {result=await os(key?'clients/'+key:'clients',key?'PUT':'POST',payload);}
    catch(error) {
      if (!key&&error.result?.existing&&dealDraft&&id(error.result.id)) result=error.result;
      else if (!key&&error.result?.existing) throw Error('Контрагент с таким контактом уже существует. Откройте его карточку в реестре.');
      else throw error;
    }
    if (!dealDraft) return saved('Карточка сохранена');
    const draft={...dealDraft,clientId:result.id};
    dealDraft=null;
    applyData({clients:await os('clients')});
    if (draft.requestId) return form('convertRequest','Связать со сделкой',field('Название сделки','title',draft.title,'text','required')+
      choice('Карточка существующего клиента','clientId',S.clients,result.id,'name'),{key:draft.requestId,label:'Создать сделку'});
    return view.formOpen('deal','',draft);
  }
  if (type==='request') await os('requests','POST',{...data,consent:data.consent==='on'});
  else if (type==='deal'||type==='convertRequest') {
    const route=type==='deal'?'deals':'requests/'+key+'/convert';
    await os(route,'POST',{clientId:data.clientId,title:data.title});
  }
  else if (type==='brief') await os('briefs','POST',{dealId:data.dealId,scope:data.goal});
  else if (type==='task') await os('tasks','POST',{dealId:data.dealId,title:data.title,dueOn:data.due});
  else if (type==='partner') await os('partners','POST',{name:data.name,code:data.code});
  else if (type==='support') await os('projects/'+id(data.projectId)+'/support','POST',{
    kind:{Консультация:'question',Доработка:'change',Ошибка:'defect'}[data.type],subject:data.title,body:data.body,
  });
  else if (type==='infra') await os('projects/'+id(data.projectId)+'/infrastructure','POST',{
    kind:data.kind==='Домен'?'domain':'hosting',title:data.name,provider:data.provider,renewedUntil:data.until,payer:data.owner==='Клиент'?'client':'agency',
  });
  else if (type==='doc') await os('invoices','POST',{quoteId:data.quoteId,terms:data.terms,...(data.start?{startMinor:minor(data.start)}:{})});
  else if (type==='payment') await os('payments','POST',{...data,amount:minor(data.amount)});
  else if (type==='membership') await os('projects/'+id(data.projectId)+'/memberships','POST',{userId:data.userId,basis:data.basis});
  else if (type==='mail') await os(key?'mail/'+key:'mail',key?'PUT':'POST',{recipient:data.to,subject:data.subject,body:data.body});
  else if (type==='reply') {await os('support/'+key+'/messages','POST',{body:data.body});return saved('Ответ добавлен',()=>detail('support',key));}
  else if (type==='editrequest') await os('requests/'+key,'PUT',data);
  else if (type==='editdeal') await os('deals/'+key,'PUT',{title:data.title,version:get('deals',key).version});
  else if (type==='edittask') await os('tasks/'+key,'PUT',{title:data.title,dueOn:data.due});
  else if (type==='editinfra') await os('infrastructure/'+key,'PUT',{renewedUntil:data.until});
  else if (type==='edituser') await os('users/'+key+'/role','POST',data);
  else if (type==='stageMove') {await move(key,data.stage);return saved('Этап обновлён',()=>detail('deal',key));}
  else if (type==='assign') await os('deals/'+key+'/assign','POST',{userId:data.userId});
  else if (type==='quote') {
    const lines=Object.keys(data).filter(key=>key.startsWith('lineCode')).map(key=>({code:data[key],quantity:Number(data['lineQuantity'+key.slice(8)])}));
    await os('quotes','POST',{briefId:data.briefId,lines});
  }
  else if (type==='organization') await os('org','PUT',{...data,taxId:data.inn,registration:data.ogrnip,correspondent:data.corr});
  else if (type==='profile') {
    if (data.email!==S.profile.email) throw Error('Изменение почты требует подтверждения нового адреса');
    const {settings}=await os('profile','PUT',{name:data.name,phone:data.phone,tz:data.tz});
    S.profile={...S.profile,...settings,name:data.name};
  }
  else if (type==='approveBrief') await os('briefs/'+key+'/approve','POST',{basis:data.basis});
  else if (type==='verifyPay') await os('payments/'+key+'/verify','POST',{basis:data.basis});
  else if (type==='revoke') await os('invoices/'+key+'/revoke','POST',{basis:data.basis});
  else if (type==='reviewSignature') await os('signatures/'+key+'/review','POST',{basis:data.basis,bothParties:data.bothParties==='on'});
  else if (type==='issue'||type==='signed') await os('invoices/'+key+'/'+type,'POST',{pdf:await pdfData(data.pdf),reviewed:data.reviewed==='on'});
  else if (type==='addStage'||type==='renameStage') {
    await os(key?'stages/'+key:'stages',key?'PUT':'POST',{title:data.name});
    await refresh();
    return view.stageEdit('deals');
  }
  else throw Error('Действие сейчас недоступно');
  return saved();
}
async function run(work,button) {
  if (mutation) return;
  mutation=true;
  if (button) button.disabled=true;
  try {await work();}catch(error){showError(error);}
  finally {mutation=false;if(button?.isConnected)button.disabled=false;}
}

document.addEventListener('click',event=>{
  const action=event.target.closest('[data-action]');
  if (action) {event.preventDefault();run(()=>onAction(action));}
  else if(event.target.matches('[data-close-cover]')) view.closeModal();
});
document.addEventListener('submit',event=>{
  const form=event.target.closest('form[data-form]');
  if (form) {event.preventDefault();run(()=>submit(form),event.submitter);}
});
document.addEventListener('change',event=>{
  if (event.target.name==='activeProject') {ui.activeProject=id(event.target.value);refresh().catch(showError);}
});
document.addEventListener('input',event=>{
  if (event.target.id!=='directory-search') return;
  const query=event.target.value.trim().toLowerCase().replaceAll('ё','е');
  for(const group of document.querySelectorAll('.directory-group')) {
    const buttons=[...group.querySelectorAll('.directory-link')];
    for(const button of buttons) button.hidden=!button.dataset.name.replaceAll('ё','е').includes(query);
    group.hidden=buttons.every(button=>button.hidden);
  }
});
document.addEventListener('keydown',event=>{
  if (event.key==='Escape') {ui.pop='';view.renderPop();view.closeModal();}
  if (S.user&&(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k') {
    event.preventDefault();view.directory();document.getElementById('directory-search')?.focus();
  }
  if (event.target.matches('.deal-card[data-action]')&&['Enter',' '].includes(event.key)) {event.preventDefault();event.target.click();}
});
document.addEventListener('dragstart',event=>{
  const card=event.target.closest('[data-drag-type="deal"]');
  if (card) event.dataTransfer.setData('application/overtake-deal',card.dataset.dragId);
  else if(event.target.closest('[data-drag-type="project"]'))event.preventDefault();
});
document.addEventListener('dragover',event=>{
  if (event.target.closest('[data-pipeline="deals"]')&&event.dataTransfer.types.includes('application/overtake-deal')) event.preventDefault();
});
document.addEventListener('drop',event=>{
  const lane=event.target.closest('[data-pipeline="deals"]');
  const key=id(event.dataTransfer.getData('application/overtake-deal'));
  if (!lane||!get('deals',key)) return;
  event.preventDefault();
  run(async()=>{await move(key,lane.dataset.stage);await saved('Этап обновлён');});
});
function currentPage() {
  const key=new URLSearchParams(location.search).get('view')||location.pathname.split('/')[2];
  const mapped={preferences:'settings',prices:'services',documents:ui.clientPortal?'client-documents':'documents',
    projects:ui.clientPortal?'client-portal':'projects',support:ui.clientPortal?'client-support':'support',infrastructure:ui.clientPortal?'client-infra':'infrastructure'}[key]||key;
  return allowedPages().includes(mapped)?mapped:ui.clientPortal?'client-portal':'overview';
}
window.addEventListener('popstate',()=>{
  if (!S.user) return;
  ui.page=currentPage();ui.tab='';ui.pop='';view.closeModal();refresh().catch(showError);
});

async function start() {
  const {user}=await request('me');
  if (!user) {
    document.getElementById('app').innerHTML='<main class="workspace"><div class="page-head"><div><div class="eyebrow">OVERTAKE WORKSPACE 5.0</div><h1>Вход в рабочую систему</h1></div></div>'+
      '<div class="card">'+wrapper('login',field('Email','email','','email','required autocomplete="username"')+
        field('Пароль','password','','password','required autocomplete="current-password"')).replace('Создать запись','Войти')+
      '<a class="cell-link" href="/">На сайт OVERTAKE</a> · <a class="cell-link" href="/account">Создать аккаунт</a></div></main>';
    return;
  }
  S.user=user;
  const [prefs,profile,alerts]=await Promise.all([os('preferences'),os('profile'),os('alert-settings')]);
  S.profile={...S.profile,...profile.settings,name:user.name,email:user.email};
  S.notify=alerts.settings;
  ui.clientPortal=user.role==='client';
  ui.page=currentPage();
  applyData({preferences:prefs});
  await refresh();
}
start().catch(error=>{
  const root=document.getElementById('app');
  root.innerHTML='<main class="workspace"><h1>Не удалось открыть OVERTAKE</h1><p></p><a class="btn" href="/cabinet">Повторить</a> <a class="btn soft" href="/account">Существующий кабинет</a></main>';
  root.querySelector('p').textContent=error.message;
});
