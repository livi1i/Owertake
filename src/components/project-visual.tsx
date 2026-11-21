import React,{useRef} from 'react';
import {useInView} from 'motion/react';
import {ArrowUpRight,Send,Check,Plus} from 'lucide-react';
import './project-visual.css';

export function ProjectVisual({index=0}:{index?:number}) {
 const ref=useRef<HTMLDivElement>(null);
 const visible=useInView(ref,{amount:.15});
 const kind=index%3;
 return <div ref={ref} className={'project-scene scene-'+['aura','crm','bot'][kind]+(visible?' is-visible':'')} aria-label={['Превью AURA Studio','Превью Flow CRM','Превью Pulse Bot'][kind]}>
 {kind===0?<div className="scene-frame scene-site">
  <div className="scene-browser"><span>● ● ●</span><span>aura.studio</span><ArrowUpRight size={12}/></div>
  <div className="scene-site-nav"><b>AURA®</b><span>ПРОЕКТЫ　 СТУДИЯ ↗</span></div>
  <div className="scene-site-copy"><small>ARCHITECTURE OF TOMORROW</small><strong>За пределами<br/><em>привычного</em></strong></div>
  <div className="scene-architecture"><i/><i/><i/><span/></div>
  <div className="scene-site-bottom"><span>Пространства,<br/>которые меняют взгляд</span><ArrowUpRight size={24}/></div>
 </div>:kind===1?<div className="scene-frame scene-app">
  <div className="scene-browser"><span>● ● ●</span><span>flow / workspace</span><span>⌘ K</span></div>
  <div className="scene-crm-layout"><div className="scene-crm-nav"><b>f /</b><span>Обзор</span><span>Сделки</span><span>Клиенты</span><span>Задачи</span><i>＋</i></div>
  <div className="scene-crm-main"><div className="scene-crm-heading"><b>Обзор</b><span>Этот месяц</span></div>
  <div className="scene-stats"><div><small>Выручка</small><strong>1 280 000 ₽</strong><span>↗ 18,6%</span></div><div><small>Новые сделки</small><strong>24</strong><span>↗ 12,4%</span></div></div>
  <div className="scene-chart"><span>Динамика продаж</span><div>{[32,48,39,61,55,76,68,90,80,100].map((h,i)=><i key={i} style={{height:h+'%','--bar-delay':i*.09+'s'} as React.CSSProperties}/>)}</div></div>
  <div className="scene-pipeline">{['Новые','В работе','Готово'].map((s,i)=><div key={s}><span><i/>{s}</span><b>{[8,12,4][i]}</b><em/><em/></div>)}</div>
  <div className="scene-app-note"><Check size={12}/> Все данные в одном пространстве</div>
  </div></div>
 </div>:<div className="scene-frame scene-phone">
  <div className="scene-phone-top"><span>9:41</span><i/><span>●●●</span></div>
  <div className="scene-chat-header"><b>p</b><span>Pulse Bot<small>бот · на связи</small></span><span>⋮</span></div>
  <div className="scene-chat"><div>Привет! Давайте найдём время для вашей записи 👋</div><div className="scene-chat-right">Хочу записаться <Check size={11}/></div><div>Отлично! Выберите услугу:</div><div className="scene-chat-options"><span>Консультация <ArrowUpRight size={12}/></span><span>Первая встреча <ArrowUpRight size={12}/></span><span>Мои записи <ArrowUpRight size={12}/></span></div><div className="scene-chat-ready"><Check size={13}/> Всё под рукой</div></div>
  <div className="scene-chat-input"><Plus size={14}/><span>Сообщение</span><Send size={14}/></div>
 </div>}
 </div>;
}
