/// <reference types="vite/client" />
import {useEffect,useRef} from 'react';
import {ArrowDown,ArrowRight,Check,Mail,Phone,Send} from 'lucide-react';
import {casePreviews} from './live-projects';
import {getBotScreens} from './bot-case-media';
import {projectSlug,type PortfolioProject} from '../lib/portfolio';
import {projectUrl} from '../lib/project-url';
import {Reveal} from './reveal';
import {LeadSection,type LeadPrefill} from './lead-section';
import {ProcessSteps} from './process-steps';
import {directions} from './studio-directions';
import {CabinetPreview} from './cabinet-preview';
import {OfficeMap} from './office-map';
import {HeroShowcase} from './hero-showcase';
import {serviceCategoryUrl} from '../lib/services';
import {contactEmail,telegramContacts} from '../lib/contact-links';
import type {Content} from '../lib/app-shared';
import {PartnershipArt} from './partnership-art';
import newProject from '../assets/studio-motion-ribbon.webp?inline';
import improveProject from '../assets/studio-interface-stack.webp?inline';
import './home-layout.css';

const taskTypes=[
  {title:'Создать новый проект',description:'Сайт, Telegram-бот или CRM с нуля.',label:'Новый проект',art:newProject},
  {title:'Доработать существующий',description:'Редизайн, интеграции или новые функции.',label:'Редизайн и доработки',art:improveProject},
];
const productNames=['Сайты и веб-сервисы','Telegram-боты и Mini Apps','CRM и интеграции','AI-решения для бизнеса'];
const benefits=['Работаем по договору','Согласуем смету заранее','Поддерживаем после запуска'];

function WorkTile({project}:{project:PortfolioProject}) {
  const url=projectUrl(project.url);
  const bot=getBotScreens(url)?.[0];
  const image=bot?.src || (url && casePreviews[url.hostname]) || project.image;
  return <a className={'home-work-tile'+(bot?' home-work-bot':'')} href={'/portfolio/'+projectSlug(project)}>
    <div className="home-work-media">{image && <img src={image} alt="" loading="lazy" decoding="async"/>}</div>
    <div className="home-work-caption"><h3>{project.title}</h3><ArrowRight size={17} aria-hidden="true"/><p>{project.category}</p></div>
  </a>;
}

export function HomePage({content,openLogin,effectsPaused,prefill,onRequest}:{
  content:Content;openLogin:()=>void;effectsPaused:boolean;prefill?:LeadPrefill;
  onRequest:(service?:string,description?:string)=>void;
}) {
  const form=useRef<HTMLDetailsElement>(null);
  const email=contactEmail(content.contacts.email || '');
  const telegram=telegramContacts(content.contacts);
  const projects=content.projects.filter(project=>project.confirmed===true && !!projectUrl(project.url)).slice(0,4);

  useEffect(()=>{
    function goToSection() {
      const anchor=location.hash.slice(1);
      if (!anchor || anchor==='home' || anchor==='cabinet') return;
      if (anchor==='request' && form.current) form.current.open=true;
      document.getElementById(anchor)?.scrollIntoView({behavior:'instant'});
    }
    const frame=requestAnimationFrame(goToSection);
    window.addEventListener('hashchange',goToSection);
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener('hashchange',goToSection);};
  },[]);
  useEffect(()=>{
    if (!prefill || !form.current) return;
    form.current.open=true;
    form.current.scrollIntoView({block:'start',behavior:'instant'});
    form.current.querySelector<HTMLInputElement>('input[name="name"]')?.focus({preventScroll:true});
  },[prefill]);

  return <main id="main" className="soft-home home-layout">
    <div className="home-opening">
      <section className="studio-hero" id="home" aria-labelledby="hero-title">
        <div className="studio-hero-grid">
          <div className="studio-hero-copy" data-enter>
            <h1 id="hero-title">
              <span className="hero-line"><span>Создаём цифровые</span></span>{' '}
              <span className="hero-line"><span>решения <em>для бизнеса</em></span></span>
            </h1>
            <p>Сайты, Telegram-боты и CRM. Разрабатываем, автоматизируем работу команды и поддерживаем проекты после запуска.</p>
            <div className="studio-hero-actions">
              <button className="btn purple" onClick={()=>onRequest()}>Обсудить проект <ArrowRight size={17} aria-hidden="true"/></button>
              <a className="secondary-panel" href="/portfolio">Смотреть портфолио</a>
            </div>
            <ul className="studio-benefits">{benefits.map(text=><li key={text}><Check size={14} aria-hidden="true"/>{text}</li>)}</ul>
          </div>
          <HeroShowcase paused={effectsPaused}/>
        </div>
      </section>
    </div>

    <section className="section home-task-section" aria-labelledby="home-tasks">
      <h2 id="home-tasks">С какой задачей к нам обращаются</h2>
      <div className="home-task-options">{taskTypes.map(({title,description,label,art},index)=>
        <Reveal key={label} delay={index*95}><button className="home-task-card" type="button" onClick={()=>onRequest(label)}>
          <img src={art} alt="" loading="lazy" decoding="async"/>
          <span className="home-task-copy"><strong>{title}</strong><span>{description}</span></span>
          <ArrowRight className="home-task-arrow" size={18} aria-hidden="true"/>
        </button></Reveal>
      )}</div>
    </section>

    <div className="section home-project-board">
      <div className="home-project-main">
        <section className="home-solutions" id="services" aria-labelledby="home-solutions-title">
          <div className="home-section-title"><h2 id="home-solutions-title">Что мы делаем</h2><a className="home-text-link" href="/services">Все решения <ArrowRight size={15}/></a></div>
          <div className="home-product-grid">{directions.slice(0,4).map(({category,Icon},index)=>
            <Reveal delay={index*55} key={category}><a className="home-product-card" href={serviceCategoryUrl(category)}>
              <span className="home-product-icon"><Icon size={28} strokeWidth={1.6} aria-hidden="true"/></span>
              <h3>{productNames[index]}</h3><ArrowRight size={15} aria-hidden="true"/>
            </a></Reveal>
          )}</div>
        </section>
        {projects.length>0 && <section className="home-work" id="work" aria-labelledby="home-work-title">
          <div className="home-section-title"><h2 id="home-work-title">Портфолио</h2><a className="home-text-link" href="/portfolio">Все проекты <ArrowRight size={15}/></a></div>
          <div className="home-work-grid">{projects.map((project,index)=>
            <Reveal key={projectSlug(project)} delay={index*55}><WorkTile project={project}/></Reveal>
          )}</div>
        </section>}
      </div>
      <Reveal className="home-cabinet" delay={95}><aside id="client">
        <div className="home-cabinet-copy"><h2>Проект под контролем</h2><p>Следите за этапами, переписывайтесь с командой и согласовывайте материалы в одном месте.</p>
          <button className="secondary-panel" onClick={openLogin}>Войти в кабинет <ArrowRight size={15} aria-hidden="true"/></button>
        </div>
        <CabinetPreview paused={effectsPaused}/>
      </aside></Reveal>
    </div>

    <ProcessSteps compact/>
    <section className="section studio-about" id="about">
      <PartnershipArt/>
      <Reveal className="studio-about-copy" delay={80}>
        <h2>О компании</h2>
        <p>OVERTAKE — независимое цифровое агентство. Объединяем разработку, дизайн и продвижение, чтобы вести проект от идеи до запуска и поддержки.</p>
        <a className="home-text-link" href="/about">Познакомиться с командой <ArrowRight size={15}/></a>
      </Reveal>
    </section>

    <section className="section home-contacts" id="contacts" aria-labelledby="home-contacts-title">
      <div className="home-contact-grid">
        <div><h2 id="home-contacts-title">Контакты</h2><p>Поддержка 24/7</p>
          <div className="home-contact-links">
            <a href="tel:+79517506700"><Phone size={17}/> +7 (951) 750-67-00</a>
            {telegram.map(channel=><a key={channel.url} href={channel.url} target="_blank" rel="noopener noreferrer"><Send size={17}/> {channel.label}</a>)}
            {email && <a href={email}><Mail size={17}/> {content.contacts.email}</a>}
          </div>
          <a className="home-text-link" href="/contacts">Адрес и запись на встречу <ArrowRight size={15}/></a>
        </div>
        <OfficeMap address={content.contacts.address || ''} compact/>
      </div>
      <details className="home-request" id="request" ref={form}>
        <summary><span>Оставить заявку</span><ArrowDown size={18} aria-hidden="true"/></summary>
        <LeadSection contacts={content.contacts} prefill={prefill} heading="Обсудим ваш проект" id="home-lead-form"/>
      </details>
    </section>
  </main>;
}
