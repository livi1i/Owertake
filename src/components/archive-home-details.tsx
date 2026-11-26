import {useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import {animate,motion,useInView,useMotionValue,useReducedMotion} from 'framer-motion';
import {ClipboardCheck,Code2,MessageCircle,Rocket} from 'lucide-react';
import ideaOriginal from '../assets/idea-original.png';
import {ArchiveBackground} from './archive-background';

export function ArchiveIdeaObject({paused}:{paused:boolean}) {
  return <div className="archive-idea-object" aria-hidden="true">
    <div className="archive-idea-reflection"><img src={ideaOriginal} width="1456" height="1080" alt="" loading="lazy"/></div>
    <img className="archive-idea-original" src={ideaOriginal} width="1456" height="1080" alt="" loading="lazy"/>
  </div>;
}

export function ArchiveFilaments({variant}:{variant:'hero'|'company'|'services'|'process'|'portfolio'|'idea'|'calculator';paused?:boolean}) {
  return <ArchiveBackground variant={variant}/>;
}

const orbits=[
  'M561.122 47.45 A275 112 -43 1 1 158.878 422.55 A275 112 -43 1 1 561.122 47.45Z',
  'M553.078 343.671 A230 109 28 1 1 146.922 127.329 A230 109 28 1 1 553.078 343.671Z',
];
export function ArchiveHeroOrbits({paused}:{paused:boolean}) {
  const id=useId();
  const ref=useRef<SVGSVGElement>(null);
  const visible=useInView(ref);
  return <svg ref={ref} className="archive-hero-art archive-hero-orbits" width="1585" height="992"
    viewBox="0 0 720 451" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <radialGradient id={id+'spark'}>
        <stop stopColor="#d3ffff" stopOpacity=".9"/>
        <stop offset=".2" stopColor="#65fff2" stopOpacity=".65"/>
        <stop offset=".48" stopColor="#18eceb" stopOpacity=".2"/>
        <stop offset="1" stopColor="#18eceb" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id={id+'tail'} x1="-18" y1="0" x2="0" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#29f6ed" stopOpacity="0"/>
        <stop offset="1" stopColor="#c6fff9" stopOpacity=".85"/>
      </linearGradient>
    </defs>
    {orbits.map((d,index)=><g key={d}>
      <path className="archive-orbit-curve" d={d}/>
      {visible&&!paused && <motion.g className="archive-orbit-particle"
      style={{offsetPath:`path('${d}')`,offsetRotate:'auto',offsetAnchor:'0px 0px'}}
      initial={{offsetDistance:'0%',opacity:0}}
      animate={{offsetDistance:['0%','100%'],opacity:[0,1,1,0]}}
      transition={{duration:11+index*2,delay:index*1.35,ease:'linear',repeat:Infinity}}>
        <circle r="12" fill={`url(#${id}spark)`}/>
        <path d="M-18 0H0" stroke={`url(#${id}tail)`} strokeWidth="1.4" strokeLinecap="round"/>
        <path className="archive-spark-glint" d="M-5.5 0H5.5M0-5.5V5.5"/>
        <circle className="archive-spark-core" r="1.8"/>
      </motion.g>}
    </g>)}
  </svg>;
}
export function ArchiveClosingLines() {
  return <ArchiveBackground variant="contact"/>;
}

const reels=['Сайты　　Telegram-боты　　CRM','Автоматизация　　Интеграции'];
export function ArchiveRibbons({paused}:{paused:boolean}) {
  const ref=useRef<SVGSVGElement>(null);
  const visible=useInView(ref);
  const id=useId();
  const [width,setWidth]=useState(1200);
  const [periods,setPeriods]=useState([780,820]);
  const labels=useRef<(SVGTextElement|null)[]>([]);
  const offsets=useRef<(SVGTextPathElement|null)[]>([]);
  useLayoutEffect(()=>{
    const svg=ref.current;
    if (!svg) return;
    const measure=()=>{
      setWidth(svg.clientWidth||1200);
      setPeriods(labels.current.map(node=>node?.getComputedTextLength()||780));
    };
    const observer=new ResizeObserver(measure);
    observer.observe(svg);
    measure();
    document.fonts.ready.then(measure);
    return ()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    if (paused||!visible) return;
    const controls=offsets.current.map((node,index)=>animate(index?periods[index]:0,index?0:periods[index],{
      duration:index?15:19,repeat:Infinity,ease:'linear',
      onUpdate:value=>node?.setAttribute('startOffset',String(value)),
    }));
    return ()=>controls.forEach(control=>control.stop());
  },[periods,paused,visible]);
  return <svg ref={ref} className="archive-ribbons" aria-hidden="true" viewBox={`0 0 ${width} 160`} preserveAspectRatio="none">
    {reels.map((label,index)=>{
      const period=periods[index];
      const copies=Math.ceil((width+period*2)/period)+2;
      const baseline=index?114:47;
      const shape=(bend:number)=>`M-${period} ${baseline} H0 C${width*.24} ${baseline-bend} ${width*.72} ${baseline+bend} ${width} ${baseline} H${width+period*2}`;
      const pathId=id+index;
      return <g key={label} className="archive-ribbon" data-reel={index}>
        <text visibility="hidden" ref={node=>{labels.current[index]=node;}}>{label+'　　'}</text>
        <defs>
          <motion.path id={pathId} d={shape(index?-27:27)} initial={false}
            animate={{d:visible&&!paused?[shape(index?-27:27),shape(index?-47:47),shape(index?-27:27)]:shape(index?-27:27)}}
            transition={visible&&!paused?{duration:7,repeat:Infinity,ease:'easeInOut'}:{duration:0}}/>
        </defs>
        <use href={`#${pathId}`} className="archive-ribbon-band"/>
        <text dy=".35em">
          <textPath href={`#${pathId}`} startOffset={period*.5} ref={node=>{offsets.current[index]=node;}}>
            {`${label}　　`.repeat(copies)}
          </textPath>
        </text>
      </g>;
    })}
  </svg>;
}
const process=[
  {Icon:MessageCircle,title:'Знакомимся',text:'Уточняем цели и задачу.'},
  {Icon:ClipboardCheck,title:'Договариваемся',text:'Согласуем смету, сроки и договор.'},
  {Icon:Code2,title:'Создаём',text:'Разрабатываем и показываем результат.'},
  {Icon:Rocket,title:'Запускаем',text:'Передаём проект и помогаем развивать.'},
];
type Route={d:string;stops:number[];nodeRadius:number};
export function ArchiveProcess({paused}:{paused:boolean}) {
  const list=useRef<HTMLOListElement>(null);
  const path=useRef<SVGPathElement>(null);
  const icons=useRef<(HTMLSpanElement|null)[]>([]);
  const visible=useInView(list,{amount:.4,once:true});
  const [route,setRoute]=useState<Route>();
  const [active,setActive]=useState(-1);
  const x=useMotionValue(0);
  const y=useMotionValue(0);
  const signalOpacity=useMotionValue(0);
  const finished=useRef(false);
  useLayoutEffect(()=>{
    const parent=list.current;
    if (!parent) return;
    function measure() {
      const bounds=parent!.getBoundingClientRect();
      const points=icons.current.flatMap(icon=>{
        if (!icon) return [];
        const rect=icon.getBoundingClientRect();
        return [{x:Math.round(rect.left-bounds.left+rect.width/2),y:Math.round(rect.top-bounds.top+rect.height/2)}];
      });
      if (points.length!==4) return;
      const [a,b,c,d]=points;
      const desktop=b.x>a.x+10;
      const nodeRadius=(icons.current[0]?.getBoundingClientRect().width ?? 0)/2;
      let next:Route;
      if (desktop) {
        const radius=(c.y-b.y)/2;
        const turn=Math.max(b.x,Math.round(bounds.width-radius-4));
        const first=turn-a.x;
        const curve=Math.PI*radius;
        next={d:`M${a.x},${a.y} H${turn} A${radius},${radius} 0 0 1 ${turn},${c.y} H${d.x}`,
          stops:[0,b.x-a.x,first+curve+turn-c.x,first+curve+turn-d.x],nodeRadius};
      } else {
        next={d:`M${a.x},${a.y} V${d.y}`,stops:points.map(p=>p.y-a.y),nodeRadius};
      }
      setRoute(previous=>previous?.d===next.d && previous.nodeRadius===next.nodeRadius ? previous : next);
    }
    const observer=new ResizeObserver(measure);
    observer.observe(parent);
    icons.current.forEach(icon=>{if(icon) observer.observe(icon);});
    measure();
    return ()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const line=path.current;
    if (!line || !route || !visible || paused || finished.current) return;
    const length=line.getTotalLength();
    setActive(0);
    const controls=animate(0,3,{duration:5.7,delay:.22,ease:'linear',onUpdate:progress=>{
      const leg=Math.min(2,Math.floor(progress));
      const phase=progress-leg;
      const from=route.stops[leg];
      const to=Math.min(length,route.stops[leg+1]);
      const inset=Math.min((to-from)*.42,route.nodeRadius+3);
      const traveled=Math.max(0,Math.min(1,(phase-.2)/.62));
      const point=line.getPointAtLength(from+inset+traveled*(to-from-2*inset));
      x.set(point.x);
      y.set(point.y);
      signalOpacity.set(Math.max(0,Math.min(1,(phase-.2)*28,(.82-phase)*28)));
      setActive(leg+(phase>=.82?1:0));
    },onComplete:()=>{finished.current=true;signalOpacity.set(0);setActive(3);}});
    return ()=>{controls.stop();signalOpacity.set(0);};
  },[route,visible,paused,x,y,signalOpacity]);
  return <section className="archive-container archive-process" id="approach">
    <ArchiveFilaments variant="process" paused={paused}/>
    <h2>Как мы работаем</h2>
    <div className="archive-step-map">
      <svg className="archive-step-route" aria-hidden="true">
        {route && <path ref={path} d={route.d}/>}
      </svg>
      {!paused && <motion.span className="archive-step-signal" style={{x,y,opacity:signalOpacity}} aria-hidden="true"/>}
      <ol className="archive-steps" ref={list}>{process.map(({Icon,title,text},index)=>
        <li key={title} data-active={paused||index<=active}>
          <span className="archive-step-icon" ref={node=>{icons.current[index]=node;}}><Icon size={28} aria-hidden="true"/></span>
          <h3><span aria-hidden="true">0{index+1} </span>{title}</h3><p>{text}</p>
        </li>)}</ol>
    </div>
  </section>;
}

const config=[
  ['const ', 'проект = {'],
  ['  тип: ', '"Сайт для бизнеса",'],
  ['  функции: ', '["Каталог", "Заявки"],'],
  ['  смета: ', '"По объёму работ"'],
  ['', '}'],
];
const letters=config.reduce((length,line)=>length+line.join('').length,0);
export function ArchiveEstimator({paused}:{paused:boolean}) {
  const ref=useRef<HTMLDivElement>(null);
  const seen=useInView(ref,{once:true,amount:.5});
  const [typed,setTyped]=useState(0);
  const finished=useRef(false);
  useEffect(()=>{
    if (paused || finished.current || !seen) return;
    const controls=animate(0,letters,{duration:4.1,delay:.3,ease:'linear',onUpdate:value=>setTyped(Math.floor(value)),
      onComplete:()=>{finished.current=true;setTyped(letters);}});
    return ()=>controls.stop();
  },[paused,seen]);
  let remaining=paused ? letters : typed;
  return <div className="archive-code" ref={ref} aria-hidden="true">
    <div className="archive-code-title">Конфигурация проекта</div>
    <div className="archive-code-body">{config.map(([label,value],index)=>{
      const count=Math.max(0,remaining);
      remaining-=label.length+value.length;
      return <div key={index}><span>{index+1}</span><code>
        <b>{label.slice(0,count)}</b><em>{value.slice(0,Math.max(0,count-label.length))}</em>
        {seen && !paused && count>0 && remaining<=0 && typed<letters && <i className="archive-cursor"/>}
      </code></div>;
    })}</div>
  </div>;
}

export function useArchivePause(paused:boolean) {
  const reduced=useReducedMotion();
  const [hidden,setHidden]=useState(document.hidden);
  useEffect(()=>{
    const update=()=>setHidden(document.hidden);
    document.addEventListener('visibilitychange',update);
    return ()=>document.removeEventListener('visibilitychange',update);
  },[]);
  return paused || hidden || !!reduced;
}
