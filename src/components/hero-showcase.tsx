/// <reference types="vite/client" />
import {useEffect,useRef,type PointerEvent} from 'react';
import {Bot,Kanban} from 'lucide-react';
import calculator from '../assets/hero-calculator.webp?inline';
import amoreterno from '../assets/hero-amoreterno.webp?inline';
import holodilka from '../assets/hero-holodilka.webp?inline';
import './hero-showcase.css';

const windows = [
  {layer:'back',title:'OVERTAKE · Калькулятор',src:calculator,width:900,height:361},
  {layer:'middle',title:'AMORETERNO',src:amoreterno,width:940,height:653},
  {layer:'front',title:'Холодилка',src:holodilka,width:940,height:529},
] as const;

export function HeroShowcase({paused}:{paused:boolean}) {
  const pending = useRef(0);
  useEffect(() => () => cancelAnimationFrame(pending.current),[]);

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

  return <div className="hero-showcase" role="img"
    aria-label="Превью проектов «Холодилка», AMORETERNO и калькулятора OVERTAKE. Демо услуг: Telegram-боты и CRM-системы."
    onPointerMove={aim} onPointerLeave={reset} onPointerCancel={reset}>
    <div className="showcase-halo" aria-hidden="true"/>
    <div className="showcase-space" aria-hidden="true">
      {windows.map(({layer,title,src,width,height})=><div key={layer} className={'showcase-layer showcase-'+layer}>
        <div className="showcase-window">
          <div className="showcase-bar"><span className="showcase-dots"><i/><i/><i/></span><span>{title}</span></div>
          <img src={src} alt="" width={width} height={height} decoding="sync" fetchPriority={layer==='front'?'high':undefined} draggable={false}/>
        </div>
      </div>)}
      <div className="showcase-layer showcase-notice showcase-notice-bot">
        <div className="showcase-chip"><span className="showcase-chip-icon"><Bot size={18}/></span><span><strong>Заявки в Telegram</strong><small>Демо · Telegram-боты</small></span></div>
      </div>
      <div className="showcase-layer showcase-notice showcase-notice-crm">
        <div className="showcase-chip"><span className="showcase-chip-icon"><Kanban size={18}/></span><span><strong>Клиенты и сделки</strong><small>Демо · CRM-системы</small></span></div>
      </div>
    </div>
  </div>;
}
