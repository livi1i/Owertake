import {useEffect,useRef,useState,type FormEvent,type ReactNode} from 'react';
import {Archive,Bell,BookOpen,BriefcaseBusiness,CalendarClock,ChartNoAxesColumn,ChevronDown,ClipboardList,FileText,FolderOpen,Globe,House,LayoutList,LogOut,Mail,Menu,MessageSquare,Plus,Search,Settings,Users,Wallet,X} from 'lucide-react';
import {api,money,type User} from '../lib/app-shared';
import './os5-workspace.css';

type Row=Record<string,any>;
type Fields=Record<string,string|File|boolean>;
type Field={key:string; label:string; choices?:Row[]; kind?:'textarea'|'date'|'number'|'file'|'checkbox';value?:string;optional?:boolean;search?:boolean};
type Prompt={title:string;fields:Field[];submit:(values:Fields)=>Promise<unknown>;secondary?:{label:string;run:(values:Fields)=>void}};
const menu=[
  ['Обзор','overview',House],['Задачи','tasks',ClipboardList],['Уведомления','notifications',Bell],
  ['Заявки','requests',MessageSquare],['Сделки','deals',BriefcaseBusiness],['Клиенты','clients',Users],['Партнёры','partners',BriefcaseBusiness],
  ['Проекты','projects',FolderOpen],['Брифы','briefs',BookOpen],['Правки и поддержка','support',MessageSquare],['Домены и хостинг','infrastructure',Globe],
  ['Счета-договоры','invoices',FileText],['Оплаты','payments',Wallet],['Почта','mail',Mail],['Аналитика','analytics',ChartNoAxesColumn],
  ['Услуги и цены','prices',LayoutList],['Пользователи','users',Users],['Настройки','preferences',Settings],['Архив','archive',Archive],
] as const;
const customerMenu=[
  ['Мои проекты','projects',FolderOpen],['Сообщения и правки','support',MessageSquare],['Согласования','approvals',ClipboardList],
  ['Документы','documents',FileText],['Домен и хостинг','infrastructure',Globe],['Настройки','preferences',Settings],
] as const;
const projectViews=['support','infrastructure','approvals','documents'];
const base='os5/';
const options=(mapping:Record<string,string>)=>Object.entries(mapping).map(([id,title])=>({id,title}));
const prefsDefault={theme:'light',accent:'blue',layout:'left',density:'comfortable'};
const overviewLabels:Record<string,string>={requests:'Заявки',clients:'Клиенты',deals:'Активные сделки',projects:'Проекты',open_tasks:'Открытые задачи',billed:'Выставлено',received:'Подтверждено банком'};
const supportKinds=options({question:'Консультация',defect:'Сообщение о недостатке',change:'Запрос на изменение'});
const rubles=(value:string|number)=>money(Number(value)/100);
const idOf=(row:Row)=>String(row.id || row.code || row.seq || row.position);
const titleOf=(row:Row)=>String(row.title || row.name || row.subject || row.number || row.bank_ref || row.service || row.email || row.id || '');
const field=(key:string,label:string,extra:Partial<Field>={}):Field=>({key,label,...extra});
const choice=(key:string,label:string,choices:Row[],extra:Partial<Field>={}):Field=>field(key,label,{choices,search:choices.length>8,...extra});

function SelectField({item}:{item:Field}) {
  const [filter,setFilter]=useState('');
  return <div className="os5-field">
    {item.search && <input type="search" aria-label={'Поиск · '+item.label} placeholder={'Поиск · '+item.label} value={filter} onChange={e=>setFilter(e.target.value)}/>}
    <label>{item.label}<select name={item.key} defaultValue={item.value||''} required={!item.optional}>
      <option value="">Выберите</option>{item.choices?.filter(row=>[titleOf(row),row.email,row.tax_id,row.phone,idOf(row)].join(' ').toLocaleLowerCase().includes(filter.toLocaleLowerCase())||idOf(row)===item.value).map(row=>
        <option key={idOf(row)} value={idOf(row)}>{titleOf(row)}</option>)}
    </select></label>
  </div>;
}

function ActionDialog({prompt,close,refresh}:{prompt:Prompt; close:(submitted?:Prompt)=>void;refresh:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const sending=useRef(false);
  const formRef=useRef<HTMLFormElement>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{if(dialog.current && !dialog.current.open) dialog.current.showModal();},[]);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(sending.current) return;
    const form=new FormData(event.currentTarget);
    const values=Object.fromEntries(form) as Fields;
    for(const item of prompt.fields) if(item.kind==='checkbox') values[item.key]=form.has(item.key);
    sending.current=true;setBusy(true);setError('');
    try {await prompt.submit(values);refresh();close(prompt);}
    catch(error){setError(error instanceof Error?error.message:'Операция не выполнена');}
    finally{sending.current=false;setBusy(false);}
  }
  return <dialog ref={dialog} className="os5-dialog" aria-labelledby="os5-dialog-title" onCancel={event=>{event.preventDefault();if(!busy)close();}}>
    <form ref={formRef} onSubmit={submit}>
      <header><h2 id="os5-dialog-title">{prompt.title}</h2><button type="button" aria-label="Закрыть" onClick={()=>close()} disabled={busy}><X size={19}/></button></header>
      {prompt.fields.map(item=>item.choices?<SelectField key={item.key} item={item}/>:<label key={item.key} className={item.kind==='checkbox'?'os5-check':''}>
        {item.label}
        {item.kind==='textarea'?<textarea rows={5} name={item.key} defaultValue={item.value} required={!item.optional}/>:
          <input name={item.key} type={item.kind||'text'} defaultValue={item.value} required={!item.optional} accept={item.kind==='file'?'.pdf,application/pdf':undefined}
            min={item.kind==='number'?0.01:undefined} step={item.kind==='number'?'.01':undefined}/>}
      </label>)}
      {error&&<p className="os5-error" role="alert">{error}</p>}
      {prompt.secondary&&<button type="button" disabled={busy} onClick={()=>{if(formRef.current) prompt.secondary?.run(Object.fromEntries(new FormData(formRef.current)) as Fields);}}>{prompt.secondary.label}</button>}
      <button className="os5-primary" type="submit" disabled={busy}>{busy?'Сохраняем…':'Подтвердить'}</button>
    </form>
  </dialog>;
}

async function pdfValue(value:Fields[string]) {
  if (!(value instanceof File) || !value.size || value.size>524288) throw new Error('Выберите PDF размером до 512 КБ');
  const bytes=new Uint8Array(await value.arrayBuffer());
  let raw='';
  for(let i=0;i<bytes.length;i+=16384) raw+=String.fromCharCode(...bytes.subarray(i,i+16384));
  return btoa(raw);
}

export function Os5Workspace({user,logout}:{user:User;logout:()=>void}) {
  const owner=user.role==='admin';
  const manager=user.role==='manager';
  const sections=owner?menu:manager?menu.filter(item=>['deals','projects','support','preferences'].includes(item[1])):customerMenu;
  const route=location.pathname.split('/')[2] || (owner?'overview':manager?'deals':'projects');
  const section=sections.find(item=>item[1]===route);
  const active=section?.[1] || (owner?'overview':manager?'deals':'projects');
  const [prefs,setPrefs]=useState(prefsDefault);
  const [data,setData]=useState<Row>({});
  const [related,setRelated]=useState<Record<string,Row[]>>({});
  const [details,setDetails]=useState<{key:string; value:Row}|null>(null);
  const [prompt,setPrompt]=useState<Prompt|null>(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [revision,setRevision]=useState(0);
  const [displaySearch,setDisplaySearch]=useState(false);
  const [search,setSearch]=useState('');
  const [mailStatus,setMailStatus]=useState('');
  const [notifications,setNotifications]=useState<Row[]>([]);
  const [popped,setPopped]=useState(false);
  const [mode,setMode]=useState('board');
  const searchRef=useRef<HTMLInputElement>(null);
  const refresh=()=>setRevision(value=>value+1);
  const request=(path:string,values?:unknown,method?:string)=>api(base+path,values,method);
  const patch=(path:string,values:unknown)=>request(path,values,'PUT');
  useEffect(()=>{let live=true;request('preferences').then(value=>{if(live&&value.preferences)setPrefs(value.preferences);}).catch(()=>{});return()=>{live=false;};},[]);
  useEffect(()=>{
    function key(event:KeyboardEvent) {
      if ((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k') {
        event.preventDefault();setDisplaySearch(true);requestAnimationFrame(()=>searchRef.current?.focus());
      }
      if(event.key==='Escape'){setDisplaySearch(false);setPopped(false);}
    }
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
  },[]);
  useEffect(()=>{
    let live=true;
    setLoading(true);setError('');
    const list=active==='prices'?'prices':(!owner && !manager && projectViews.includes(active))?'projects':active;
    const dependencies:Record<string,string[]>={requests:['clients'],deals:owner?['clients','stages','users']:['stages'],briefs:['deals','prices'],invoices:['quotes'],payments:['invoices'],tasks:['deals'],projects:owner?['users']:[]};
    Promise.all([request(list),...((dependencies[active]||[]).map(async key=>[key,(await request(key)).items]))])
      .then(([result,...lookups])=>{if(live){setData(result);setRelated(Object.fromEntries(lookups));}})
      .catch(error=>{if(live)setError(error.message);}).finally(()=>{if(live)setLoading(false);});
    return()=>{live=false;};
  },[active,revision,owner]);
  async function run(task:()=>Promise<any>) {
    setError('');
    try {const response=await task();refresh();return response;}
    catch(error){setError(error instanceof Error?error.message:'Операция не выполнена');}
  }
  async function loadDetail(resource:string,id:string) {
    try {setDetails({key:id,value:await request(resource+'/'+id)});} catch(error){setError((error as Error).message);}
  }
  useEffect(()=>{
    const id=new URLSearchParams(location.search).get('id');
    if(id&&['clients','deals','projects','invoices'].includes(active)) void loadDetail(active,id);
  },[active]);
  const dialog=(title:string,fields:Field[],submit:Prompt['submit'],secondary?:Prompt['secondary'])=>setPrompt({title,fields,submit,secondary});
  const basis=[field('basis','Основание',{kind:'textarea'})];
  const clientCreate=(then?:(id:string,clients:Row[])=>void)=>dialog('Новый контрагент',[
    choice('kind','Тип',options({person:'Физическое лицо',entrepreneur:'ИП',company:'Юридическое лицо'})),
    field('name','ФИО или наименование'),...['email','phone','taxId','address','registration','kpp','signatory','authority'].map((key,index)=>
      field(key,['Email','Телефон','ИНН','Адрес','ОГРН или ОГРНИП','КПП','Подписант','Основание полномочий'][index],{optional:true})),
  ],async values=>{
    const result=await request('clients',values);
    if(then) then(result.id,(await request('clients')).items);
  });
  const makeDeal=(row?:Row,defaults?:{clientId:string;title:string;clients:Row[]})=>dialog(row?'Создать сделку из заявки':'Новая сделка',[
    choice('clientId','Контрагент',defaults?.clients||related.clients||[],{value:defaults?.clientId}),
    field('title','Название',{value:defaults?.title||row?.service})],
    values=>request(row?'requests/'+row.id+'/convert':'deals',values),
    {label:'Создать нового контрагента',run:values=>clientCreate((clientId,clients)=>
      makeDeal(row,{clientId,clients,title:String(values.title||'')}))});
  const move=(row:Row,stageId:string)=>run(()=>request('deals/'+row.id+'/stage',{stageId,version:row.version}));
  const openProject=(id:string)=>loadDetail('projects',id);
  async function openTicket(ticket:Row,projectId:string) {
    try {
      const {messages}=await request('support/'+ticket.id+'/messages');
      setDetails({key:ticket.id,value:{ticket,messages,projectId}});
    } catch(error) {setError((error as Error).message);}
  }
  const renew=(item:Row,projectId?:string)=>dialog('Дата продления',[field('renewedUntil','Оплачено до',{kind:'date',value:item.renewed_until})],
    async values=>{await patch('infrastructure/'+item.id,values);if(projectId)await openProject(projectId);});
  const requestSupport=(id:string)=>dialog('Обращение по проекту',[choice('kind','Тип',supportKinds),field('subject','Тема'),field('body','Описание',{kind:'textarea'})],
    async values=>{await request('projects/'+id+'/support',values);await openProject(id);});
  const addInfra=(id:string)=>dialog('Домен или хостинг',[choice('kind','Тип',options({domain:'Домен',hosting:'Хостинг'})),field('title','Название'),field('provider','Поставщик'),field('renewedUntil','Оплачено до',{kind:'date'}),choice('payer','Кто продлевает',options({client:'Клиент',agency:'Агентство'}))],
    async values=>{await request('projects/'+id+'/infrastructure',values);await openProject(id);});
  const addMember=(id:string)=>dialog('Доступ представителю клиента',[choice('userId','Учётная запись',(related.users||[]).filter(row=>row.role==='client')),...basis],
    values=>request('projects/'+id+'/memberships',values));

  const list:Row[]=data.items||data.projects||[];
  function taxSettings() {
    const keys=['name','taxId','registration','address','signatory','bank','bik','account','correspondent','tax','templateApproval'];
    run(async ()=>{
      const {organization}=await request('org');
      dialog('Реквизиты исполнителя',keys.map((key,index)=>field(key,['Наименование','ИНН','ОГРН или ОГРНИП','Адрес','Подписант','Банк','БИК','Расчётный счёт','Корреспондентский счёт','Налоговый статус','Реквизит согласования шаблона'][index],
        {value:organization?.[key],optional:true})),values=>patch('org',values));
    });
  }
  const permissions=owner?'Рабочая система':manager?'Кабинет менеджера':'Кабинет клиента';
  const workLinks=sections.filter(item=>item[0].toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const link=(key:string,id?:string)=>'/cabinet/'+key+(id?'?id='+encodeURIComponent(id):'');

  function actions(row:Row) {
    const id=row.id;
    switch(active) {
      case 'requests': return row.deal_id?<a href={link('deals',row.deal_id)}>Открыть сделку</a>:<button onClick={()=>makeDeal(row)}>Создать сделку</button>;
      case 'deals': return <>
        {owner&&<button onClick={()=>loadDetail('deals',id)}>Открыть сделку</button>}
        <label className="os5-sr" htmlFor={'move-'+id}>Этап · {row.title}</label>
        <select id={'move-'+id} value={row.stage_id} disabled={row.stage_id==='won'} onChange={e=>move(row,e.target.value)}>
          {(related.stages||[]).filter(stage=>stage.id!=='won'||stage.id===row.stage_id).map(stage=><option key={stage.id} value={stage.id}>{stage.title}</option>)}
        </select>
        {row.project_id?<a href={link('projects',row.project_id)}>К проекту</a>:owner&&<button onClick={()=>run(()=>request('deals/'+id+'/project',{}))}>Передать в проект</button>}
        {owner&&row.stage_id!=='won'&&<button onClick={()=>dialog('Архивировать сделку',[],()=>request('deals/'+id+'/archive',{}))}>Архивировать</button>}
      </>;
      case 'clients':return <><button onClick={()=>loadDetail('clients',id)}>Открыть клиента</button><button onClick={()=>dialog('Архивировать контрагента',[],()=>request('clients/'+id+'/archive',{}))}>Архивировать</button></>;
      case 'briefs':return row.approved_at?<button onClick={()=>dialog('Смета из утверждённого прайса',[
        choice('first','Позиция 1',(related.prices||[]).filter(p=>p.period==='once')),
        field('quantity','Количество',{kind:'number',value:'1'}),
        choice('second','Позиция 2',(related.prices||[]).filter(p=>p.period==='once'),{optional:true}),
        field('quantity2','Количество для позиции 2',{kind:'number',optional:true,value:'1'}),
      ],values=>request('quotes',{briefId:id,lines:[{code:values.first,quantity:Number(values.quantity)},...(values.second?[{code:values.second,quantity:Number(values.quantity2)}]:[])]}))}>Составить смету</button>:
        <button onClick={()=>dialog('Зафиксировать согласование брифа',basis,values=>request('briefs/'+id+'/approve',values))}>Согласовать</button>;
      case 'invoices': return <button onClick={()=>loadDetail('invoices',id)}>Открыть счёт-договор</button>;
      case 'payments': return !row.verified_at&&<button onClick={()=>dialog('Сверка банковской операции',basis,values=>request('payments/'+id+'/verify',values))}>Подтвердить сверку</button>;
      case 'tasks':return !row.done_at&&<button onClick={()=>run(()=>request('tasks/'+id+'/done',{}))}>Выполнено</button>;
      case 'projects':return <button onClick={()=>openProject(id)}>Открыть проект</button>;
      case 'users':return row.role!=='admin'&&<button onClick={()=>dialog('Изменить роль',[choice('role','Роль',options({client:'Заказчик',manager:'Менеджер'}),{value:row.role}),...basis],values=>request('users/'+id+'/role',values))}>Изменить роль</button>;
      case 'notifications':return row.read_at?<small>Прочитано</small>:<button onClick={()=>run(()=>request('notifications/'+id+'/read',{}))}>Прочитано</button>;
      case 'partners':return <><a href={'/?ref='+encodeURIComponent(row.code)+'#request'}>Реферальная ссылка</a><button onClick={()=>run(()=>request('partners/'+id+'/toggle',{active:!row.active}))}>{row.active?'Отключить':'Включить'}</button></>;
      case 'support':return <button onClick={()=>openTicket(row,row.project_id)}>Переписка</button>;
      case 'infrastructure':return <><button onClick={()=>renew(row)}>Изменить дату</button><a href={link('projects',row.project_id)}>Открыть проект</a></>;
      case 'archive':return <button onClick={()=>run(()=>request((row.kind==='client'?'clients/':'deals/')+id+'/restore',{}))}>Восстановить</button>;
      case 'mail':return <button onClick={()=>dialog('Редактировать черновик',[field('recipient','Получатель',{value:row.recipient}),field('subject','Тема',{value:row.subject}),field('body','Сообщение',{kind:'textarea',value:row.body})],values=>patch('mail/'+id,values))}>Редактировать</button>;
    }
  }

  function mainAction() {
    switch(active) {
      case 'partners':return <button className="os5-primary" onClick={()=>dialog('Новый партнёр',[field('name','Имя'),field('code','Реферальный код')],values=>request('partners',values))}>Добавить партнёра</button>;
      case 'clients':return <button className="os5-primary" onClick={()=>clientCreate()}><Plus size={17}/> Новый клиент</button>;
      case 'deals':return <div className="os5-actions">
        <button onClick={()=>setMode(mode==='board'?'list':'board')}>{mode==='board'?'Список':'Канбан'}</button>
        <button onClick={()=>dialog('Новый этап',[field('title','Название')],values=>request('stages',values))}>Добавить этап</button>
        <button className="os5-primary" onClick={()=>makeDeal()}><Plus size={17}/> Сделка</button>
      </div>;
      case 'tasks':return <button className="os5-primary" onClick={()=>dialog('Новая задача',[choice('dealId','Сделка',related.deals||[]),field('title','Задача'),field('dueOn','Срок',{kind:'date',optional:true})],values=>request('tasks',values))}>Добавить задачу</button>;
      case 'briefs':return <button className="os5-primary" onClick={()=>dialog('Новая версия брифа',[choice('dealId','Сделка',related.deals||[]),field('scope','Объём работ',{kind:'textarea'})],values=>request('briefs',values))}>Создать бриф</button>;
      case 'invoices':return <button className="os5-primary" onClick={()=>dialog('Черновик счёта-договора',[
        choice('quoteId','Смета',(related.quotes||[]).map(row=>({...row,title:row.deal_title+' · '+rubles(row.total)}))),
        field('start','Первый платёж, ₽',{optional:true,kind:'number'}),field('terms','Условия платежей',{optional:true,kind:'textarea'})],
        values=>request('invoices',{quoteId:values.quoteId,...(values.start?{startMinor:Math.round(Number(values.start)*100)}:{}),terms:values.terms}))}>Создать счёт-договор</button>;
      case 'payments':return <button className="os5-primary" onClick={()=>dialog('Операция по выписке',[
        choice('invoiceId','Счёт-договор',(related.invoices||[]).filter(row=>row.issued_at&&!row.revoked_at)),
        field('amount','Сумма, ₽',{kind:'number'}),field('reference','Банковский идентификатор'),field('occurredOn','Дата',{kind:'date'}),
        choice('refundOf','Исходное поступление для возврата',list.filter(row=>row.verified_at&&row.amount>0),{optional:true}),
        field('proof','Документ или строка выписки',{kind:'textarea'})],
        values=>request('payments',{...values,amount:Math.round(Number(values.amount)*100)}))}>Добавить операцию</button>;
      case 'mail':return <button className="os5-primary" onClick={()=>dialog('Черновик письма',[field('recipient','Получатель'),field('subject','Тема'),field('body','Сообщение',{kind:'textarea'})],values=>request('mail',values))}>Написать письмо</button>;
    }
  }

  function projectDetail({project,milestones,infrastructure,support,documents}:Row) {
    const count=milestones.filter((m:Row)=>m.approved_at).length;
    return <article className="os5-panel">
      <h2>{project.title}</h2><p>Заказчик · {project.client_name}</p>
      <label className="os5-progress">Готовность · {Math.round(count/milestones.length*100)}%<progress value={count} max={milestones.length}/></label>
      <div className="os5-detail-columns"><div><h3>Ход проекта</h3><ol className="os5-timeline">{milestones.map((item:Row)=><li key={item.position}>
        <strong>{item.title}</strong><span>{item.approved_at?'Согласован':item.ready_at?'На согласовании':'Впереди'}</span>
        {owner&&!item.ready_at&&<button onClick={()=>run(async()=>{await patch('projects/'+project.id+'/milestones/'+item.position,{});await openProject(project.id);})}>Передать на согласование</button>}
        {!owner&&item.ready_at&&!item.approved_at&&<button onClick={()=>run(async()=>{await request('projects/'+project.id+'/milestones/'+item.position,{});await openProject(project.id);})}>Согласовать</button>}
      </li>)}</ol></div>
      <div><h3>Документы</h3>{documents.map((item:Row)=><p key={item.id}><a href={'/api/os5/invoices/'+item.id+'/pdf'}>Скачать {item.number}</a></p>)}
        <h3>Домен и хостинг</h3>{infrastructure.length?infrastructure.map((item:Row)=><p key={item.id}>{item.title} · {item.provider} · до {item.renewed_until} {owner&&<button onClick={()=>renew(item,project.id)}>Изменить дату</button>}</p>):<p>Услуги размещения ещё не добавлены.</p>}
        <h3>Обращения</h3>{support.length?support.map((item:Row)=><p key={item.id}><strong>{item.subject}</strong><br/>{item.body} <button onClick={()=>openTicket(item,project.id)}>Переписка</button></p>):<p>Обращений пока нет.</p>}
        <div className="os5-actions"><button onClick={()=>requestSupport(project.id)}>Написать в поддержку</button>
        {owner&&<><button onClick={()=>addInfra(project.id)}>Добавить услугу размещения</button><button onClick={()=>addMember(project.id)}>Предоставить доступ</button></>}</div>
      </div></div>
    </article>;
  }

  function invoiceDetail({invoice,client,quote,signatures}:Row) {
    return <article className="os5-panel">
      <h2>Счёт-договор {invoice.number}</h2><p>{client.name} · {rubles(invoice.total)} · {invoice.issued_at?'Выпущен':'Черновик'}</p>
      <p>Порог оплаты для старта · {rubles(invoice.start_min)} {invoice.terms}</p>
      <ul>{JSON.parse(quote.lines).map((item:Row)=><li key={item.code}>{item.name} × {item.quantity} · {rubles(item.unitAmount)}</li>)}</ul>
      <div className="os5-actions">
      {!invoice.issued_at?<button onClick={()=>dialog('Зафиксировать проверенный PDF',[field('pdf','Проверенный счёт-договор PDF',{kind:'file'}),field('reviewed','Реквизиты, цены и график сверены',{kind:'checkbox'})],
        async values=>{await request('invoices/'+invoice.id+'/issue',{pdf:await pdfValue(values.pdf),reviewed:values.reviewed});await loadDetail('invoices',invoice.id);})}>Выпустить</button>:
        <><a href={'/api/os5/invoices/'+invoice.id+'/pdf'}>Скачать PDF</a><button onClick={()=>dialog('Подписанный экземпляр',[field('pdf','Подписанный PDF',{kind:'file'})],
          async values=>{await request('invoices/'+invoice.id+'/signed',{pdf:await pdfValue(values.pdf)});await loadDetail('invoices',invoice.id);})}>Загрузить подписанный PDF</button></>}
      </div>
      {signatures.map((item:Row)=><div className="os5-actions" key={item.id}>
        <a href={'/api/os5/signatures/'+item.id+'/pdf'}>Скачать экземпляр для проверки</a>
        {item.reviewed_at?<span>Подписи проверены</span>:<button onClick={()=>dialog('Проверка подписанного экземпляра',[
          field('bothParties','Подтверждены подписи обеих сторон и соответствие выпущенной версии',{kind:'checkbox'}),...basis],
          async values=>{await request('signatures/'+item.id+'/review',values);await loadDetail('invoices',invoice.id);})}>Зафиксировать проверку</button>}
      </div>)}
    </article>;
  }

  function renderTable(rows:Row[]) {
    return rows.length?<div className="os5-records">{rows.map(row=><article className="os5-row" key={idOf(row)}>
      <div><h3>{titleOf(row)}</h3><small>{[row.client_name,row.deal_title,row.contact,row.email,row.tax_id].filter(Boolean).join(' · ')}</small>
        {(row.description||row.scope||row.body)&&<p>{row.description||row.scope||row.body}</p>}
        {row.total>0&&<p>{rubles(row.total)} {row.paid>0&&'· подтверждено '+rubles(row.paid)}</p>}
        {row.amount&&<p>{active==='prices'?rubles(row.minor):rubles(row.amount)} {row.verified_at&&'· сверено'}</p>}
        {active==='prices'&&<p>{rubles(row.minor)} {row.period==='once'?'':(' / '+({month:'мес.',year:'год',hour:'час'}[row.period as 'month']||row.period))}</p>}
        {row.code&&active==='partners'&&<p>Заявок по коду · {row.referrals}</p>}
        {row.renewed_until&&<p>Оплачено до {row.renewed_until}</p>}
        {row.created&&<small>{String(row.created).slice(0,10)}</small>}
      </div><div className="os5-actions">{actions(row)}</div>
    </article>)}</div>:<p className="os5-empty">Пока нет записей в этом разделе.</p>;
  }
  function body() {
    if (!section && location.pathname!='/cabinet') return <p className="os5-empty">Раздел недоступен для вашего аккаунта.</p>;
    if(active==='preferences') return <div className="os5-detail-columns"><article className="os5-panel"><h2>Внешний вид</h2>
      {[['theme','Тема',options({light:'Светлая',dark:'Графитовая'})],['accent','Акцент',options({blue:'Синий',mint:'Мятный',violet:'Фиолетовый',graphite:'Серый'})],
        ['layout','Положение меню',options({left:'Слева',top:'Сверху',right:'Справа',bottom:'Снизу'})],['density','Плотность',options({comfortable:'Комфортная',compact:'Компактная'})],
      ].map(([key,label,values])=><div className="os5-setting" key={key as string}><h3>{label as string}</h3><div className="os5-actions">{(values as Row[]).map(item=>
        <button type="button" key={item.id} aria-pressed={prefs[key as keyof typeof prefs]===item.id} onClick={async()=>{
          const next={...prefs,[key as string]:item.id};
          try{const saved=await patch('preferences',next);setPrefs(saved.preferences);}catch(error){setError((error as Error).message);}
        }}>{item.title}</button>)}</div></div>)}
      {owner&&<button onClick={taxSettings}>Реквизиты организации</button>}
    </article><article className="os5-panel"><h2>Мой профиль</h2><p>{user.name}</p><p>{user.email}</p><a href="/account">Настройки существующего кабинета</a></article></div>;
    if(active==='overview'||active==='analytics') return <><div className="os5-metrics">{Object.entries(data.counts||{}).map(([name,value])=><article key={name}>
      <h2>{overviewLabels[name]||name}</h2><strong>{name==='billed'||name==='received'?rubles(Number(value)):String(value)}</strong>
    </article>)}</div>{active==='analytics'&&<p className="os5-empty">Веб-аналитика · источник не подключён.</p>}</>;
    if(details?.value.ticket) {
      const {ticket,messages,projectId}=details.value;
      return <article className="os5-panel"><h2>{ticket.subject}</h2><p>{ticket.body}</p>
        {messages.map((message:Row)=><p key={message.id}><strong>{message.author}</strong><br/>{message.body}</p>)}
        <button onClick={()=>dialog('Ответить',[field('body','Сообщение',{kind:'textarea'})],async values=>{
          await request('support/'+ticket.id+'/messages',values);await openTicket(ticket,projectId);
        })}>Ответить</button> <a href={link('projects',projectId)}>Проект</a>
      </article>;
    }
    if(details?.value.deal) {
      const {deal,client,request:source,project,invoices,activity}=details.value;
      return <article className="os5-panel"><h2>{deal.title}</h2><p>Этап · {related.stages?.find(s=>s.id===deal.stage_id)?.title||deal.stage_id}</p>
        <a href={link('clients',client.id)}>{client.name}</a>
        {deal.stage_id!=='won'&&<p><button onClick={()=>dialog('Назначить ответственного',[choice('userId','Сотрудник',(related.users||[]).filter(row=>['admin','manager'].includes(row.role)),{value:deal.owner_id})],async values=>{await request('deals/'+deal.id+'/assign',values);await loadDetail('deals',deal.id);})}>Назначить ответственного</button></p>}
        {source&&<p>Исходная заявка · {source.service} · {source.description}</p>}
        {project&&<p><a href={link('projects',project.id)}>{project.title}</a></p>}
        {invoices.map((item:Row)=><p key={item.id}><a href={link('invoices',item.id)}>{item.number}</a></p>)}
        <h3>История сделки</h3>{activity.map((item:Row,index:number)=><p key={index}>{item.created} · {item.action}</p>)}
      </article>;
    }
    if(details?.value.client) {
      const {client,deals,projects}=details.value;
      return <article className="os5-panel"><h2>{client.name}</h2><p>{[client.email,client.phone,client.tax_id].filter(Boolean).join(' · ')}</p>
        <h3>Сделки</h3>{deals.map((item:Row)=><p key={item.id}><a href={link('deals',item.id)}>{item.title}</a></p>)}
        <h3>Проекты</h3>{projects.map((item:Row)=><p key={item.id}><a href={link('projects',item.id)}>{item.title}</a></p>)}
      </article>;
    }
    if(details?.value.project) return projectDetail(details.value);
    if(details?.value.invoice) return invoiceDetail(details.value);
    if(active==='deals'&&mode==='board') return <div className="os5-kanban">{(related.stages||[]).map(stage=><section className="os5-lane" key={stage.id}
      onDragOver={event=>event.preventDefault()} onDrop={event=>{
        event.preventDefault();const row=list.find(item=>item.id===event.dataTransfer.getData('text/plain'));if(row)void move(row,stage.id);
      }}><header><h2>{stage.title}</h2>{owner&&!stage.terminal&&stage.id!=='new'&&<button aria-label={'Удалить этап '+stage.title} onClick={()=>dialog('Удалить пустой этап',[],()=>request('stages/'+stage.id,{},'DELETE'))}><X size={14}/></button>}</header>
      {list.filter(row=>row.stage_id===stage.id).map(row=><article draggable={row.stage_id!=='won'} key={row.id} onDragStart={event=>event.dataTransfer.setData('text/plain',row.id)}>
        <strong>{row.title}</strong><p>{row.client_name}</p><div className="os5-actions">{actions(row)}</div>
      </article>)}</section>)}</div>;
    if(!owner&&!manager&&projectViews.includes(active)) return <div className="os5-actions">{list.length?list.map(project=><button key={project.id} onClick={()=>openProject(project.id)}>{project.title}</button>):<p>Доступные проекты появятся после выдачи доступа.</p>}</div>;
    return <>{active==='mail'&&<p className="os5-empty">Почтовый транспорт не настроен. Черновики можно сохранить и отредактировать.</p>}{renderTable(list)}</>;
  }
  return <main id="main" className="os5-shell" data-theme={prefs.theme} data-accent={prefs.accent} data-layout={prefs.layout} data-density={prefs.density}>
    <aside className="os5-sidebar"><a className="os5-brand" href="/cabinet"><img src="/assets/overtake-mark-v1.svg" width="31" height="31" alt=""/><span>OVERTAKE<small>WORKSPACE 5.0</small></span></a>
      <nav aria-label="Разделы рабочего пространства">{sections.map(([label,key,Icon])=><a href={link(key)} key={key} aria-current={active===key?'page':undefined}><Icon size={18}/>{label}</a>)}</nav>
      <a className="os5-legacy" href={owner?'/admin':'/account'}>Существующий кабинет</a>
    </aside>
    <div className="os5-work">
      <header className="os5-top"><span>{permissions} <b>/</b> {section?.[0]}</span><div className="os5-actions">
        <button title="Поиск по разделам (Ctrl+K)" onClick={()=>{setDisplaySearch(!displaySearch);requestAnimationFrame(()=>searchRef.current?.focus());}}><Search size={17}/><span>Все разделы</span></button>
        {owner&&<button aria-label="Последние уведомления" aria-expanded={popped} onClick={async()=>{
          if (popped) {setPopped(false);return;}
          setPopped(true);setMailStatus('');
          try {setNotifications((await request('notifications')).items.slice(0,3));}catch{setMailStatus('Не удалось загрузить уведомления');}
        }}><Bell size={17}/></button>}
        <a href={link('preferences')} aria-label="Настройки"><Settings size={17}/></a><button onClick={logout} aria-label="Выйти"><LogOut size={17}/><span>{user.name}</span></button>
      </div></header>
      {displaySearch&&<div className="os5-directory"><label>Разделы<input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Найти раздел"/></label>
        <div>{workLinks.map(([label,key,Icon])=><a key={key} href={link(key)}><Icon size={17}/>{label}</a>)}</div></div>}
      {popped&&<aside className="os5-popover" aria-label="Последние уведомления"><strong>Новые обращения</strong>{mailStatus?<p>{mailStatus}</p>:notifications.length?notifications.map(item=><p key={item.id}>{item.service}</p>):<p>Новых обращений нет.</p>}<a href={link('notifications')}>Все уведомления</a></aside>}
      <div className="os5-content"><header className="os5-title"><div><small>OVERTAKE / {permissions.toUpperCase()}</small><h1>{section?.[0]||(owner?'Обзор':'Мои проекты')}</h1></div>{owner&&mainAction()}</header>
        {details&&<button onClick={()=>setDetails(null)}>Назад к списку</button>}
        {error&&<p className="os5-error" role="alert">{error}</p>}
        {loading?<p role="status">Загружаем данные…</p>:body()}
      </div>
    </div>
    {prompt&&<ActionDialog key={prompt.title} prompt={prompt} close={submitted=>setPrompt(current=>!submitted||current===submitted?null:current)} refresh={refresh}/>}
  </main>;
}
