import React,{useId,useState} from 'react';
import {motion,useReducedMotion} from 'framer-motion';
import {ArrowUpRight,Plus} from 'lucide-react';
import {portfolioConcepts,projectSlug} from '../lib/portfolio';
import {ConceptVisual} from './concept-visual';
import './work-gallery.css';

export function WorkGallery(){const [filter,setFilter]=useState('Все'),[limit,setLimit]=useState(6),[revision,setRevision]=useState(0);const id=useId(),reduced=useReducedMotion();const cats=['Все',...new Set(portfolioConcepts.map(p=>p.category))];const list=portfolioConcepts.filter(p=>filter==='Все'||p.category===filter);return <>
 <div className="work-filters" role="group" aria-label="Направления примеров">{cats.map(c=><button key={c} aria-pressed={filter===c} onClick={()=>{if(filter===c)return;setFilter(c);setLimit(6);setRevision(n=>n+1);}}>{filter===c&&<motion.span className="work-filter-highlight" layoutId={'work-filter-'+id} transition={{type:'spring',stiffness:350,damping:32,duration:reduced?0:.4}}/>}<span>{c}</span><small>{c==='Все'?portfolioConcepts.length:portfolioConcepts.filter(p=>p.category===c).length}</small></button>)}</div>
 <p className="work-result" aria-live="polite">{filter==='Все'?'По одному примеру на каждую из 18 услуг':filter+' · Примеров: '+list.length} · Авторские концепции</p>
 <div className="portfolio-grid work-gallery-grid" key={revision}>{list.slice(0,limit).map((p,i)=><motion.a key={p.slug} href={'/portfolio/'+projectSlug(p)} className="project-card" initial={reduced?false:{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.4,delay:Math.min(i*.045,.18)}}><div className="project-image"><ConceptVisual project={p}/><span className="project-open"><ArrowUpRight size={21}/></span></div><div className="project-info"><h3>{p.title}</h3><span>{p.category}</span></div></motion.a>)}</div>
 {list.length>limit&&<button className="work-show-more" onClick={()=>setLimit(n=>n+6)}><Plus size={18}/> Показать ещё {Math.min(6,list.length-limit)} примеров <span>{limit} / {list.length}</span></button>}
 </>}
