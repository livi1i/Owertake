import React,{useRef} from 'react';
import {useInView,useReducedMotion} from 'framer-motion';
import {ArrowUpRight,Sparkles,MoveUpRight} from 'lucide-react';
import {BorderBeam} from './magicui/border-beam';
import './project-invitation.css';
import {OrbitStars} from './orbit-stars';

export function AllServicesLink({paused}:{paused:boolean}){
 const ref=useRef<HTMLAnchorElement>(null),visible=useInView(ref,{amount:.2}),reduced=useReducedMotion();
 return <a ref={ref} className={'all-services-link'+(visible?' invitation-visible':'')} href="/services"><OrbitStars/><span><small>НА ГЛАВНОЙ — ТОЛЬКО НАЧАЛО</small><strong>Все услуги агентства</strong><span>Больше решений для вашего бизнеса — в полном каталоге</span></span><span className="all-services-arrow"><ArrowUpRight size={29}/></span>{visible&&!paused&&!reduced&&<BorderBeam size={110} duration={10} colorFrom="#ad83e3" colorTo="#7fbde8"/>}</a>;
}
export function ProjectInvitation({onDiscuss,paused}:{onDiscuss:()=>void;paused:boolean}){
 const ref=useRef<HTMLDivElement>(null),visible=useInView(ref,{amount:.25,once:true}),reduced=useReducedMotion();
 return <div ref={ref} className={'invitation-scene'+(visible?' invitation-visible':'')}>
  <div className="invitation-sheet">
   <div className="invitation-browser" aria-hidden="true"><span><i/><i/><i/></span><span>overtake / your next project</span><MoveUpRight size={12}/></div>
   <div className="invitation-landing"><span className="invitation-wordmark" aria-hidden="true">OVERTAKE® <Sparkles size={16}/></span><span className="invitation-caption" aria-hidden="true">ХОРОШИЕ ИДЕИ СТАНОВЯТСЯ РЕАЛЬНОСТЬЮ</span><strong aria-hidden="true">Ваш следующий<br/><em>большой шаг</em></strong><button className="invitation-button" onClick={onDiscuss}>Обсудить проект <ArrowUpRight size={23}/></button><div className="invitation-tiles" aria-hidden="true"><span><i/>DESIGN</span><span><i/>DEVELOPMENT</span><span><i/>GROWTH</span></div></div>
   {visible&&!paused&&!reduced&&<BorderBeam duration={12} size={120} colorFrom="#c2a2ed" colorTo="#94c7e7"/>}
  </div>
 </div>;
}
