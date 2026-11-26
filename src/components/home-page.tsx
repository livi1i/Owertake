import {useEffect,useRef} from 'react';
import {motion,type Transition} from 'framer-motion';
import {ArrowRight} from 'lucide-react';
import {ArchiveClosingLines,ArchiveEstimator,ArchiveFilaments,ArchiveHeroOrbits,ArchiveIdeaObject,ArchiveProcess,ArchiveRibbons,useArchivePause} from './archive-home-details';
import {ArchiveServiceVisual} from './archive-service-visual';
import {projectSlug} from '../lib/portfolio';
import {LeadSection,type LeadPrefill} from './lead-section';
import {serviceCategoryUrl} from '../lib/services';
import type {Content} from '../lib/app-shared';
import heroArt from '../assets/hero-sculpture.png';
import companyArt from '../assets/redesign-company.webp';
import sitesArt from '../assets/redesign-sites.webp';
import botsArt from '../assets/redesign-bots.webp';
import crmArt from '../assets/redesign-crm.webp';
import aiArt from '../assets/redesign-ai.webp';
import integrationsArt from '../assets/redesign-integrations.webp';
import amoreternoArt from '../assets/redesign-work-amoreterno.webp';
import holodilkaArt from '../assets/redesign-work-holodilka.webp';
import wheelArt from '../assets/redesign-work-randweelore.webp';
import xploreArt from '../assets/redesign-work-xplore.webp';
import './home-layout.css';

const masters=import.meta.glob<string>('../assets/redesign-*-4k.webp',{eager:true,query:'?url',import:'default'});
const master=(name:string,preview:string)=>masters[`../assets/redesign-${name}-4k.webp`] ?? preview;
const services=[
  {kind:'sites',title:'Сайты и веб-сервисы',href:serviceCategoryUrl('Сайты'),art:sitesArt},
  {kind:'bots',title:'Telegram-боты и Mini Apps',href:serviceCategoryUrl('Боты и автоматизация'),art:botsArt},
  {kind:'crm',title:'CRM-системы',href:serviceCategoryUrl('CRM'),art:crmArt},
  {kind:'ai',title:'ИИ-решения',href:serviceCategoryUrl('ИИ'),art:aiArt},
  {kind:'integrations',title:'Интеграции',href:'/services?product=integrations',art:integrationsArt},
] as const;
const work=[
  {slug:'amoreterno',src:amoreternoArt,width:1440,height:810,description:'Сайт студии свадебных приглашений',phone:false},
  {slug:'holodilka',src:holodilkaArt,width:1440,height:810,description:'Каталог холодильного оборудования и комплектующих',phone:false},
  {slug:'randweelore',src:wheelArt,width:535,height:501,description:'Мини-приложение для случайного выбора',phone:true},
  {slug:'xplore',src:xploreArt,width:323,height:433,description:'Мини-приложение для развития навыков',phone:true},
];
const ease:Transition['ease']=[.22,1,.36,1];

export function HomePage({content,openLogin,effectsPaused,prefill,onRequest}:{
  content:Content;openLogin:()=>void;effectsPaused:boolean;prefill?:LeadPrefill;
  onRequest:(service?:string,description?:string)=>void;
}) {
  const root=useRef<HTMLElement>(null);
  const lastPrefill=useRef<LeadPrefill>(undefined);
  const reduce=useArchivePause(effectsPaused);
  const projects=work.flatMap(item=>{
    const project=content.projects.find(project=>project.confirmed===true && projectSlug(project)===item.slug);
    return project ? [{...item,title:project.title}] : [];
  });

  useEffect(()=>{
    function goToSection() {
      const anchor=location.hash.slice(1);
      if (anchor && anchor!=='cabinet') document.getElementById(anchor)?.scrollIntoView();
    }
    const frame=requestAnimationFrame(goToSection);
    window.addEventListener('hashchange',goToSection);
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener('hashchange',goToSection);};
  },[]);
  useEffect(()=>{
    const form=root.current?.querySelector('#request');
    if (!prefill || !form || lastPrefill.current===prefill) return;
    lastPrefill.current=prefill;
    form.scrollIntoView({block:'start',behavior:reduce?'instant':'smooth'});
    const name=form.querySelector<HTMLInputElement>('input[name="name"]');
    if (!name?.matches(':focus')) name?.focus({preventScroll:true});
  },[prefill,reduce]);

  const entrance=(delay=0,offset=24)=>({
    initial:reduce?false:{opacity:0,y:offset},
    animate:{opacity:1,y:0},
    transition:{duration:.85,delay,ease},
  });
  return <main className="archive-home" id="main" ref={root}>
    <section className="archive-hero" id="home" aria-labelledby="archive-title">
      <svg className="archive-outline-definitions" aria-hidden="true" width="0" height="0">
        <filter id="archive-studio-outline" x="-4%" y="-15%" width="108%" height="130%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius="1.65" result="outer"/>
          <feMorphology in="SourceAlpha" operator="erode" radius="1.65" result="inner"/>
          <feComposite in="outer" in2="inner" operator="out" result="edge"/>
          <feFlood floodColor="#dcfaff"/>
          <feComposite in2="edge" operator="in"/>
        </filter>
      </svg>
      <ArchiveFilaments variant="hero"/>
      <ArchiveHeroOrbits paused={reduce}/>
      <img className="archive-hero-art archive-hero-sculpture" src={heroArt} alt="" width="1585" height="992" fetchPriority="high"/>
      <h1 className="archive-wordmark" id="archive-title" aria-label="OVERTAKE DIGITAL STUDIO" data-enter>
        <span className="archive-wordmark-name" translate="no" aria-hidden="true">
          <motion.span {...entrance(.06)}>OVERT</motion.span>
          <motion.span className="archive-wordmark-a" {...entrance(.06)}>A</motion.span>
          <motion.span {...entrance(.06)}>KE</motion.span>
        </span>
        {' '}<motion.span className="archive-wordmark-studio" translate="no" {...entrance(.14,14)}>DIGITAL STUDIO</motion.span>
      </h1>
      <img className="archive-hero-art archive-hero-front" src={heroArt} alt="" width="1585" height="992"/>
      <motion.div className="archive-hero-end" {...entrance(.22,12)}>
        <button className="archive-action archive-mint" onClick={()=>onRequest()}>Обсудить проект</button>
        <div className="archive-hero-caption"><strong>Цифровое агентство</strong><p>Разрабатываем сайты, Telegram-ботов и CRM</p></div>
      </motion.div>
    </section>

    <div className="archive-day">
      <section className="archive-container archive-company" id="about">
        <ArchiveFilaments variant="company" paused={reduce}/>
        <div className="archive-company-grid">
          <div className="archive-company-copy">
            <h2>О компании</h2>
            <h3>Создаём цифровые продукты под задачи бизнеса</h3>
            <p>OVERTAKE — цифровое агентство из Пскова. От точечной доработки до системы с несколькими интерфейсами и интеграциями.</p>
          </div>
          <img className="archive-company-art" src={companyArt} srcSet={`${companyArt} 1280w, ${master('company',companyArt)} 3840w`}
            sizes="(max-width:670px) 85vw, 45vw" width="1280" height="1120" loading="lazy" decoding="async" alt=""/>
        </div>
        <ArchiveRibbons paused={reduce}/>
      </section>

      <section className="archive-services" id="services">
        <ArchiveFilaments variant="services" paused={reduce}/>
        <div className="archive-container">
        <div className="archive-section-heading"><h2>Что мы создаём для бизнеса</h2><a className="archive-action archive-blue" href="/services">Открыть каталог</a></div>
        <div className="archive-service-grid">{services.map(({kind,title,href,art})=>
          <a className="archive-service" key={title} href={href}>
            <h3>{title}</h3><span className="archive-service-arrow"><ArrowRight size={19} aria-hidden="true"/></span>
            <ArchiveServiceVisual kind={kind} src={master(kind,art)} preview={art} paused={reduce}/>
          </a>)}</div>
        </div>
      </section>

      <section className="archive-idea" id="project-idea">
        <ArchiveFilaments variant="idea" paused={reduce}/>
        <ArchiveIdeaObject paused={reduce}/>
        <div className="archive-idea-copy"><h2>Есть идея<br/> для проекта?</h2><p>Расскажите о задаче. Вместе определим, с чего начать.</p>
          <button className="archive-action archive-mint" onClick={()=>onRequest()}>Обсудить проект</button></div>
      </section>

      <ArchiveProcess paused={reduce}/>
    </div>

    <section className="archive-calculator" id="calculator">
      <ArchiveFilaments variant="calculator" paused={reduce}/>
      <div className="archive-container archive-calculator-inner">
        <div><h2>Рассчитайте<br/> стоимость проекта</h2><p>Выберите тип проекта, объём работ и дополнительные функции.</p>
          <div className="archive-actions">
            <a className="archive-action archive-mint" href="/calculator">Открыть калькулятор</a>
            <button className="archive-action archive-outline" onClick={openLogin}>Войти в кабинет</button>
          </div>
        </div>
        <ArchiveEstimator paused={reduce}/>
      </div>
    </section>

    <section className="archive-portfolio" id="work">
      <ArchiveFilaments variant="portfolio" paused={reduce}/>
      <div className="archive-container">
        <div className="archive-section-heading"><h2>Портфолио</h2></div>
        {projects.length>0 && <div className="archive-work-list">{projects.map(({slug,phone,src,width,height,title,description})=>
          <a className="archive-case" key={slug} data-phone={phone} data-project={slug} href={'/portfolio/'+slug}>
            <div className="archive-case-image">
              {!phone && <img className="archive-case-stack" src={src} alt="" width={width} height={height} loading="lazy" decoding="async"/>}
              <img src={src} srcSet={`${src} ${width}w, ${master('work-'+slug,src)} 3840w`}
                sizes={phone?'(max-width:670px) 45vw, 21vw':'(max-width:670px) 94vw, 54vw'}
                alt="" width={width} height={height} loading="lazy" decoding="async"/>
            </div>
            <div className="archive-case-copy"><h3>{title}</h3><p>{description}</p></div>
          </a>)}</div>}
      </div>
    </section>

    <div className="archive-contact" id="contacts">
      <ArchiveClosingLines/>
      <div className="archive-container">
        <LeadSection contacts={content.contacts} prefill={prefill} heading={<>Давайте обсудим<br/> ваш проект</>} layout="home"/>
      </div>
    </div>
  </main>;
}
