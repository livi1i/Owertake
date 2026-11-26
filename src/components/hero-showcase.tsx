/// <reference types="vite/client" />
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {useInView,useReducedMotion} from 'framer-motion';
import {Bot,CalendarCheck,FileCheck2,Kanban,LayoutDashboard,Workflow} from 'lucide-react';
import calculator from '../assets/hero-calculator.webp?inline';
import amoreterno from '../assets/hero-amoreterno.webp?inline';
import holodilka from '../assets/hero-holodilka.webp?inline';
import './hero-showcase.css';

const windows = [
  {layer:'back',title:'OVERTAKE · Калькулятор',src:calculator,width:900,height:361},
  {layer:'middle',title:'AMORETERNO',src:amoreterno,width:940,height:653},
  {layer:'front',title:'Холодилка',src:holodilka,width:940,height:529},
] as const;
const demoNotices = [
  {Icon:Bot,title:'Заявки в Telegram',service:'Telegram-боты'},
  {Icon:Kanban,title:'Клиенты и сделки',service:'CRM-системы'},
  {Icon:CalendarCheck,title:'Запись на услуги',service:'Telegram-боты'},
  {Icon:Workflow,title:'Подключение к CRM',service:'Автоматизация'},
  {Icon:FileCheck2,title:'Материалы проекта',service:'Личный кабинет'},
  {Icon:LayoutDashboard,title:'Статус заявки',service:'Сопровождение'},
];

export function HeroShowcase({paused}:{paused:boolean}) {
  const pending = useRef(0);
  const root = useRef<HTMLDivElement>(null);
  const visible = useInView(root,{amount:.4});
  const reduced = useReducedMotion();
  const [step,setStep] = useState(0);
  useEffect(() => () => cancelAnimationFrame(pending.current),[]);
  useEffect(()=>{
    if (!visible || paused || reduced || step>=4) return;
    const timer=window.setInterval(()=>{if(!document.hidden) setStep(step+1);},step===0?2800:1400);
    return ()=>window.clearInterval(timer);
  },[visible,paused,reduced,step]);

  function aim(event:PointerEvent<HTMLDivElement>) {
    if (paused || event.pointerType !== 'mouse' || !matchMedia('(min-width: 831px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
    const scene = event.currentTarget;
    const rect = scene.getBoundingClientRect();
    const x = Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));
    const y = Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));
    cancelAnimationFrame(pending.current);
    pending.current=requestAnimationFrame(() => {
      scene.dataset.tracking='true';
      scene.style.setProperty('--scene-x',x.toFixed(3));
      scene.style.setProperty('--scene-y',y.toFixed(3));
    });
  }

  function reset(event:PointerEvent<HTMLDivElement>) {
    cancelAnimationFrame(pending.current);
    const scene=event.currentTarget;
    delete scene.dataset.tracking;
    scene.style.removeProperty('--scene-x');
    scene.style.removeProperty('--scene-y');
  }

  return <div ref={root} className="hero-showcase" role="img"
    aria-label="Превью проектов «Холодилка», AMORETERNO и калькулятора OVERTAKE с демонстрационными уведомлениями."
    onPointerMove={aim} onPointerLeave={reset} onPointerCancel={reset}>
    <div className="showcase-halo" aria-hidden="true"/>
    <div className="showcase-space" aria-hidden="true">
      {windows.map(({layer,title,src,width,height})=><div key={layer} className={'showcase-layer showcase-'+layer}>
        <div className="showcase-window">
          <div className="showcase-bar"><span className="showcase-dots"><i/><i/><i/></span><span>{title}</span></div>
          <img src={src} alt="" width={width} height={height} decoding="sync" fetchPriority={layer==='front'?'high':undefined} draggable={false}/>
        </div>
      </div>)}
      {[2*Math.ceil(step/2),2*Math.floor(step/2)+1].map((index,slot)=>{
        const {Icon,title,service}=demoNotices[index];
        return <div key={slot} className={'showcase-layer showcase-notice '+(slot===0?'showcase-notice-bot':'showcase-notice-crm')} data-updated={index>1||undefined}>
          <div className="showcase-chip" key={title}><span className="showcase-chip-icon"><Icon size={18}/></span><span><strong>{title}</strong><small>Демо · {service}</small></span></div>
        </div>;
      })}
    </div>
  </div>;
}
