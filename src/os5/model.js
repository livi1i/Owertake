const projectStages = [
  ['kickoff','Старт'], ['structure','ТЗ и структура'], ['design','Дизайн'],
  ['development','Разработка'], ['testing','Тестирование'], ['handoff','Сдача'],
  ['complete','Завершён'],
].map(([id,label]) => ({id,label}));

export const defaultAppearance = {theme:'light',accent:'blue',layout:'left',density:'comfort'};
export const S = {
  user:null, appearance:{...defaultAppearance}, profile:{name:'',email:'',phone:'',tz:'Europe/Moscow'},
  organization:{}, notify:{}, clients:[], requests:[], deals:[], dealStages:[], projects:[],
  projectStages, briefs:[], quotes:[], docs:[], payments:[], partners:[], accounts:[],
  sessions:[], loginHistory:[], notifications:[], tasks:[], services:[], mail:[], support:[],
  infrastructure:[], archive:[], events:[], counts:{},
};
export const ui = {page:'overview',tab:'',pop:'',modal:'',clientPortal:false,activeProject:''};
export const clientPages=['client-portal','client-support','client-documents','client-infra','client-settings'];

export const id = value => /^[a-zA-Z0-9_-]{1,120}$/.test(value ?? '') ? value : '';
const iso = value => /^\d{4}-\d{2}-\d{2}/.test(value ?? '') ? value.slice(0,10) : '';
const jsonObject = value => {
  try { return (typeof value==='string'?JSON.parse(value):value)||{}; } catch { return {}; }
};
export const rubles = minor => Number(minor)/100;
export const minor = value => {
  if (!/^\d{1,8}([.,]\d{1,2})?$/.test(value)) throw Error('Укажите сумму в рублях с точностью до копейки');
  return Math.round(Number(value.replace(',','.'))*100);
};

export async function request(path,method='GET',body) {
  const response = await fetch('/api/'+path, {
    method, credentials:'same-origin', cache:'no-store',
    ...(body===undefined?{}:{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),
  });
  const result=await response.json().catch(()=>({}));
  if (!response.ok) {
    const error=new Error(result.error||'Сервер не смог выполнить действие');
    throw Object.assign(error,{status:response.status, result});
  }
  return result;
}
export const os = (path,method,body) => request('os5/'+path,method,body);
export const get = (group,key) => S[group]?.find(record=>record.id===key);

const portalCollection = {
  'client-portal':['projects'],'client-support':['projects'],
  'client-documents':['projects'],'client-infra':['projects'],'client-settings':['preferences'],
};
const ownerCollection = {
  overview:['overview','requests','tasks','audit','stages','deals'],
  tasks:['tasks','deals'], notifications:['notifications'],
  requests:['requests','clients','deals','stages'], deals:['deals','clients','stages','invoices','briefs','quotes','prices','users'],
  clients:['clients','deals','stages','projects'], partners:['partners'],
  projects:['projects','clients','users'], briefs:['briefs','deals','prices'],
  support:['support','projects','clients'], infrastructure:['infrastructure','projects','clients'],
  documents:['invoices','deals','quotes','clients','payments'],payments:['payments','invoices','clients','deals'],
  mail:['mail','clients','audit'], analytics:['analytics'],services:['prices'],users:['users','projects','audit'],
  settings:['preferences','org'],archive:['archive'],
};
const managerCollection = {overview:['deals','projects','stages'], deals:['deals','stages'],projects:['projects'],support:['support','projects'],settings:['preferences']};

export async function pageData(page) {
  const role=S.user.role;
  const collection=(role==='admin'?ownerCollection:role==='manager'?managerCollection:portalCollection)[page]||[];
  const results=Object.fromEntries(await Promise.all(collection.map(async key=>[key,await os(key)])));
  if (results.projects && (role==='client'||page==='projects')) {
    const listed=results.projects.projects;
    const selected=listed.find(row=>row.id===ui.activeProject)||listed[0];
    results.selectedProject=selected?.id||'';
    const wanted=role==='client'&&page!=='client-portal'?listed:selected?[selected]:[];
    results.projectDetails=await Promise.all(wanted.map(row=>os('projects/'+id(row.id))));
  }
  return results;
}

const supportTypes={question:'Консультация',defect:'Ошибка',change:'Доработка'};
const payerTypes={agency:'Агентство',client:'Клиент'};
function supportRow(row) {
  return {id:id(row.id),projectId:id(row.project_id),title:row.subject,body:row.body,
    type:supportTypes[row.kind],status:row.resolved_at?'Закрыто':'Открыто',date:iso(row.created)};
}
function infraRow(row) {
  return {id:id(row.id),projectId:id(row.project_id),name:row.title,provider:row.provider,
    kind:row.kind==='domain'?'Домен':'Хостинг',until:iso(row.renewed_until),owner:payerTypes[row.payer]};
}

export function applyData(result) {
  const data=key=>result[key]?.items;
  if (result.preferences?.preferences) {
    const {density,...prefs}=result.preferences.preferences;
    S.appearance={...prefs,density:density==='compact'?'compact':'comfort'};
  }
  if (result.org) {
    const org=result.org.organization||{};
    S.organization={...org,inn:org.taxId,ogrnip:org.registration,corr:org.correspondent};
  }
  if (data('clients')) S.clients=data('clients').map(row=>({
    ...jsonObject(row.details),id:id(row.id),kind:row.kind==='person'?'individual':row.kind,
    name:row.name,person:jsonObject(row.details).signatory||row.name,
    email:row.email,phone:row.phone,inn:row.tax_id,date:iso(row.created),
  }));
  if (data('deals')) S.deals=data('deals').map(row=>({
    id:id(row.id),title:row.title,clientId:id(row.client_id),clientName:row.client_name,stage:id(row.stage_id),
    projectId:id(row.project_id),requestId:id(row.request_id),ownerId:id(row.owner_id),version:row.version,
    created:iso(row.created),amount:null,
  }));
  if (data('requests')) S.requests=data('requests').map(row=>({
    id:id(row.id),name:row.name,contact:row.contact,description:row.description,service:row.service,
    source:row.partner_name?'Партнёр · '+row.partner_name:'Форма заявки',
    status:row.deal_id?'В работе':row.status==='new'||!row.status?'Новая':'В работе',
    dealId:id(row.deal_id),date:iso(row.created),
  }));
  if (data('stages')) S.dealStages=data('stages').map(row=>({id:id(row.id),label:row.title,terminal:Boolean(row.terminal)}));
  if (data('briefs')) S.briefs=data('briefs').map(row=>({
    id:id(row.id),dealId:id(row.deal_id),template:'Бриф · v'+Number(row.revision),
    goal:row.scope,status:row.approved_at?'Согласован':'Черновик',approved:Boolean(row.approved_at),
  }));
  if (data('invoices')) S.docs=data('invoices').map(row=>({
    id:id(row.id),number:row.number,dealId:id(row.deal_id),clientId:get('deals',row.deal_id)?.clientId,
    kind:'new',amount:rubles(row.total),paid:rubles(row.paid),signedVerified:Number(row.reviewed)>0,
    status:row.revoked_at?'Отозван':row.issued_at?'Выставлен':'Черновик',
    issued:Boolean(row.issued_at),revoked:Boolean(row.revoked_at),date:iso(row.created),
  }));
  if (data('quotes')) S.quotes=data('quotes').map(row=>({
    id:id(row.id),dealId:id(row.deal_id),briefId:id(row.brief_id),title:row.deal_title,
    total:rubles(row.total),revision:Number(row.revision),
  }));
  if (data('payments')) S.payments=data('payments').map(row=>({
    id:id(row.id),invoiceId:id(row.invoice_id),number:row.number,amount:rubles(row.amount),
    verified:Boolean(row.verified_at),date:iso(row.occurred_on),reference:row.bank_ref,proof:row.proof,
  }));
  if (data('tasks')) S.tasks=data('tasks').map(row=>({
    id:id(row.id),dealId:id(row.deal_id),projectId:id(row.project_id),title:row.title,due:iso(row.due_on),done:Boolean(row.done_at),priority:'—',
  }));
  if (data('notifications')) S.notifications=data('notifications').map(row=>({
    id:id(row.id),title:'Новая заявка',text:row.name,date:iso(row.created),read:Boolean(row.read_at),
  }));
  if (data('partners')) S.partners=data('partners').map(row=>({
    id:id(row.id),name:row.name,code:row.code,active:Boolean(row.active),requests:Number(row.referrals),
  }));
  if (data('users')) S.accounts=data('users').map(row=>({
    id:id(row.id),name:row.name,email:row.email,status:'Зарегистрирован',
    role:row.role==='admin'?'owner':row.role==='manager'?'manager':'customer',date:iso(row.created),
  }));
  if (data('mail')) S.mail=data('mail').map(row=>({
    id:id(row.id),to:row.recipient,body:row.body,subject:row.subject,date:iso(row.updated_at),folder:'Черновики',
  }));
  if (data('prices')) S.services=data('prices').map(row=>({
    id:id(row.code),name:row.name,category:row.category||row.period,scope:row.scope,period:row.period,price:rubles(row.minor),
  }));
  if (data('archive')) S.archive=data('archive').map(row=>({
    id:id(row.id),collection:row.kind==='client'?'clients':'deals',label:row.title,deletedAt:iso(row.archived_at),object:{id:id(row.id)},
  }));
  if (data('audit')) S.events=data('audit').map(row=>({text:row.entity+' · '+row.action,date:iso(row.created)})).reverse();
  if (data('support')) S.support=data('support').map(supportRow);
  if (data('infrastructure')) S.infrastructure=data('infrastructure').map(infraRow);
  if (result.projects) S.projects=result.projects.projects.map(row=>{
    const detail=result.projectDetails?.find(item=>item.project.id===row.id);
    const milestones=detail?.milestones||[], done=milestones.filter(step=>step.approved_at).length;
    const domain=detail?.infrastructure.find(item=>item.kind==='domain');
    const hosting=detail?.infrastructure.find(item=>item.kind==='hosting');
    return {id:id(row.id),title:row.title,clientId:id(detail?.project.client_id),clientName:row.client_name,
      created:iso(row.created),milestones,documents:detail?.documents||[],details:detail,
      invoiceId:id(detail?.documents[0]?.id), progress: Math.round(done/Math.max(1,milestones.length)*100),
      stage:projectStages[done].id,domain:domain?.title,domainUntil:iso(domain?.renewed_until),
      hosting:hosting?.title,hostingUntil:iso(hosting?.renewed_until)};
  });
  if (result.projectDetails && S.user.role==='client') {
    ui.activeProject=result.selectedProject;
    S.support=result.projectDetails.flatMap(detail=>detail.support.map(supportRow));
    S.infrastructure=result.projectDetails.flatMap(detail=>detail.infrastructure.map(row=>infraRow({...row,project_id:detail.project.id})));
    S.docs=result.projectDetails.flatMap(detail=>detail.documents.map(row=>({id:id(row.id),number:row.number,signedVerified:true})));
  }
  if (result.overview||result.analytics) S.counts=(result.overview||result.analytics).counts;
}
