import React,{useEffect,useRef,useState} from 'react';
import {PanelsTopLeft,Building2,ShoppingBag,Bot,Workflow,Cable,BrainCircuit,Figma,PenTool,Box,Clapperboard,SearchCheck,MessagesSquare,AppWindow,Smartphone,Kanban,Wrench,Server,ArrowUpRight,Check,Play,Plus,Send,ShieldCheck,Sparkles} from 'lucide-react';
import './service-preview.css';
const illustrations = {
 landing:{Icon:PanelsTopLeft,label:'Один экран — одна цель'},
 corporate:{Icon:Building2,label:'Компания в деталях'},
 ecommerce:{Icon:ShoppingBag,label:'От выбора до заказа'},
 telegram:{Icon:Bot,label:'Диалог становится действием'},
 automation:{Icon:Workflow,label:'Процессы связаны'},
 integrations:{Icon:Cable,label:'Данные находят свой путь'},
 'ai-assistants':{Icon:BrainCircuit,label:'Знания превращаются в ответы'},
 'ui-ux':{Icon:Figma,label:'От сценария к интерфейсу'},
 branding:{Icon:PenTool,label:'Характер вашего бренда'},
 motion:{Icon:Box,label:'Идеи обретают объём'},
 video:{Icon:Clapperboard,label:'История складывается в кадр'},
 seo:{Icon:SearchCheck,label:'Вас становится проще найти'},
 smm:{Icon:MessagesSquare,label:'У бренда появляется голос'},
 'web-apps':{Icon:AppWindow,label:'Ваша идея — рабочий продукт'},
 mobile:{Icon:Smartphone,label:'Всегда под рукой'},
 crm:{Icon:Kanban,label:'Каждая задача на своём месте'},
 support:{Icon:Wrench,label:'Внимание к каждой детали'},
 hosting:{Icon:Server,label:'Готовы к запуску'},
};
export function ServiceIcon({slug}:{slug:string}){const {Icon}=illustrations[slug as keyof typeof illustrations]||{Icon:Sparkles};return <span className="catalog-icon"><Icon size={26}/></span>}
export function ServicePreview({slug}:{slug:string}){
 const ref=useRef<HTMLDivElement>(null),[visible,setVisible]=useState(false);
 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{rootMargin:'30px'});if(ref.current)observer.observe(ref.current);return()=>observer.disconnect();},[]);
 const info=illustrations[slug as keyof typeof illustrations];
 return <div ref={ref} className={'service-preview preview-'+slug+(visible?' preview-on':'')} aria-hidden="true"><div className="preview-dot-grid"/><div className="preview-story">
 {slug==='landing'?<div className="sp-window"><div className="sp-chrome">● ● ● <span>your-next.site</span></div><div className="sp-landing"><small>MADE TO STAND OUT</small><b>Большая идея<br/><em>Первый шаг</em></b><span className="sp-pill">Начнём <ArrowUpRight size={11}/></span><i/></div></div>
 :slug==='corporate'?<div className="sp-corporate"><header><b>CO®</b><span>О КОМПАНИИ ↗</span></header><strong>Создаём<br/>будущее вместе</strong><div><i/><i/><i/></div><footer><span>Стратегия</span><span>Команда</span><span>Опыт</span></footer></div>
 :slug==='ecommerce'?<div className="sp-shop"><div><i/><span>OBJECT 01<b>В корзину <Plus size={10}/></b></span></div><div><i/><span>OBJECT 02<b>В корзину <Plus size={10}/></b></span></div><em><ShoppingBag size={13}/> Корзина · 2</em></div>
 :slug==='telegram'?<div className="sp-chat"><span><Bot size={13}/> Pulse / assistant</span><p>Привет! Чем помочь?</p><p>Хочу записаться <Check size={10}/></p><div>Выбрать время <ArrowUpRight size={12}/></div><i/><i/><i/></div>
 :slug==='automation'?<div className="sp-flow"><span>01<br/><b>Заявка</b></span><i/><span>02<br/><b>Обработка</b></span><i/><span>03<br/><b>Результат</b></span><em/></div>
 :slug==='integrations'?<div className="sp-integrations"><span>1С</span><span>API</span><span>CRM</span><span>PAY</span><b><Cable size={28}/></b><i/><i/><i/><i/></div>
 :slug==='ai-assistants'?<div className="sp-ai"><BrainCircuit size={30}/><div>Что важно в этом документе?</div><section><i/><i/><i/><span><Sparkles size={10}/> Ответ по вашей базе знаний</span></section></div>
 :slug==='ui-ux'?<div className="sp-wireframes"><div><i/><i/><i/><i/></div><span>→</span><div><b/><i/><i/><em/></div><Figma size={24}/></div>
 :slug==='branding'?<div className="sp-brand"><strong>O<span>®</span></strong><span>YOUR NEXT IDENTITY</span><div><i/><i/><i/><i/></div><em>OVERTAKE / BRAND SYSTEM</em></div>
 :slug==='motion'?<div className="sp-motion"><div className="sp-cube"><i/><i/><i/></div><span>FORM / MOTION / FEEL</span><em/></div>
 :slug==='video'?<div className="sp-video"><div><Clapperboard size={22}/><Play size={27}/><span>00:12 / 00:30</span></div><section>{[1,2,3,4,5,6].map(i=><i key={i}/>)}<b/></section></div>
 :slug==='seo'?<div className="sp-seo"><div><SearchCheck size={16}/><span>ваш бизнес</span><i/></div><section><b>Ваш следующий клиент — здесь</b><i/><i/><span>site.ru / решения для бизнеса</span></section><footer>{[20,40,32,65,80,100].map((h,i)=><i key={i} style={{height:h+'%'}}/>)}</footer></div>
 :slug==='smm'?<div className="sp-social"><div><span>O®</span><b>Кажется,<br/>это ваш стиль</b><footer>♡　↗　◌</footer></div><section><i/><MessagesSquare size={22}/><span>Контент, который<br/>хочется заметить</span></section></div>
 :slug==='web-apps'?<div className="sp-app"><header><AppWindow size={16}/> Workspace <span>＋</span></header><div><section><i/><i/><i/></section><section><b/><i/><i/><em/></section></div><footer><Check size={11}/> Всё готово к работе</footer></div>
 :slug==='mobile'?<div className="sp-mobile"><div/><header>Доброе утро <span>↗</span></header><b>Всё нужное<br/>в одном месте</b><section><i/><i/><i/><i/></section><footer>⌂　○　☰</footer><em><Check size={11}/> На связи</em></div>
 :slug==='crm'?<div className="sp-kanban">{['Новые','В работе','Готово'].map((s,i)=><section key={s}><span>{s}</span><div/><div/>{i===1&&<em><Check size={10}/> Задача принята</em>}</section>)}<b/></div>
 :slug==='support'?<div className="sp-support"><i/><i/><ShieldCheck size={47}/><span><Check size={12}/> Обновлено и проверено</span><b/><b/><b/></div>
 :slug==='hosting'?<div className="sp-hosting"><div>{[0,1,2].map(i=><section key={i}><Server size={18}/><span/><i/><i/></section>)}</div><span><i/> Система готова к запуску</span><em/></div>
 :<div className="sp-custom"><Sparkles size={40}/><span>Решение под вашу задачу</span></div>}
 </div><span className="preview-caption">{info?.label||'Индивидуальная разработка'}</span></div>;
}
