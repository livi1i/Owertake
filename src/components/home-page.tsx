/// <reference types="vite/client" />
import React,{useEffect,useState} from 'react';
import {
  Calculator, Check, CircleHelp, FileCheck2, LayoutDashboard, MessageSquare,
} from 'lucide-react';
import {LiveProjects} from './live-projects';
import {Reveal} from './reveal';
import {LeadSection,type LeadPrefill} from './lead-section';
import {ProcessSteps} from './process-steps';
import {directions} from './studio-directions';
import {CabinetPreview} from './cabinet-preview';
import {OfficeMap} from './office-map';
import {HeroShowcase} from './hero-showcase';
import {mergeServices,servicesRequest,serviceCategoryUrl,defaultAgencyServices,type AgencyService} from '../lib/services';
import {offerPrice,startingOffer} from '../lib/public-prices';
import type {Content} from '../lib/app-shared';
import togetherImage from '../assets/studio-partnership.webp?inline';

const benefits = ['Работаем по договору','Согласуем смету заранее','Ведём от идеи до запуска','Поддерживаем после запуска'];
const FaqHighlights = React.lazy(() => import('./faq-page').then(module => ({default:module.FaqHighlights})));

export function HomePage({content,openLogin,effectsPaused,prefill}:{content:Content;openLogin:()=>void;effectsPaused:boolean;prefill?:LeadPrefill}) {
  const [catalog,setCatalog] = useState<AgencyService[]>(defaultAgencyServices);
  useEffect(() => {
    let active = true;
    servicesRequest().then(result => { if (active) setCatalog(mergeServices(result.services)); }).catch(() => {});
    const anchor = location.hash.slice(1);
    if (anchor && anchor !== 'cabinet') requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({behavior:anchor==='request'?'instant':'auto'}));
    return () => { active = false; };
  },[]);
  useEffect(() => {
    if (!prefill || location.hash!=='#request') return;
    const frame=requestAnimationFrame(()=>document.getElementById('request')?.scrollIntoView({block:'start',behavior:'instant'}));
    return () => cancelAnimationFrame(frame);
  },[prefill]);
  return <main id="main" className="soft-home">
    <section className="studio-hero" id="home" aria-labelledby="hero-title">
      <div className="studio-hero-grid">
        <div className="studio-hero-copy" data-enter>
          <h1 id="hero-title">
            <span className="hero-line"><span>Создаём цифровые</span></span>{' '}
            <span className="hero-line"><span>решения, которые</span></span>{' '}
            <span className="hero-line"><span><em>привлекают клиентов</em></span></span>
          </h1>
          <p>Сайты, Telegram-боты и CRM, которые упрощают работу команды. Проектируем, запускаем и поддерживаем.</p>
          <div className="studio-hero-actions">
            <a className="btn purple" href="/calculator">Рассчитать стоимость</a>
            <a className="secondary-panel" href="/portfolio">Смотреть портфолио</a>
          </div>
          <ul className="studio-benefits">{benefits.map(text => <li key={text}><Check size={14} aria-hidden="true"/>{text}</li>)}</ul>
        </div>
        <HeroShowcase paused={effectsPaused}/>
      </div>
    </section>
    <section className="section studio-services" id="services">
      <Reveal><div className="studio-section-head">
        <div><h2>Что мы делаем</h2><p className="studio-service-tagline">{['Делаем','сложное','понятным'].map(word => <span key={word}>{word}</span>)}</p></div>
        <a className="btn purple studio-catalog-cta" href="/services"><span>Все услуги агентства</span></a>
      </div></Reveal>
      <div className="studio-service-grid">
        {directions.map(({category,name,text,Icon,slug},index) => {
          const active = catalog.some(item => item.category === category && !['Скрыта','Временно недоступна'].includes(item.status));
          if (!active) return null;
          const service = catalog.find(item => item.slug === slug && !['Скрыта','Временно недоступна'].includes(item.status));
          const offer = service && startingOffer(slug,content.prices);
          return <Reveal key={category} delay={(index%5)*36}>
            <a className="studio-service-card" href={serviceCategoryUrl(category)}>
              <div className="studio-card-top"><span className="studio-glyph"><Icon size={25}/></span><Icon className="studio-card-watermark" size={70} strokeWidth={1} aria-hidden="true"/></div>
              <h3>{name}</h3><p>{text}</p><strong>{offer ? offerPrice(offer) : 'По согласованию'}</strong>
            </a>
          </Reveal>;
        })}
      </div>
      <Reveal><div className="studio-bundle"><span className="studio-glyph"><Calculator size={23}/></span>
        <div><h3>Готовые пакеты под ключ</h3><p>Выберите базовый пакет и добавьте нужные функции.</p></div>
        <a className="secondary-panel studio-package-cta" href="/pricing#formats">Пакеты и цены</a>
      </div></Reveal>
    </section>
    <LiveProjects projects={content.projects}/>
    <section className="section studio-cabinet" id="client">
      <Reveal className="studio-cabinet-copy">
        <h2>Всё под контролем</h2><p>Статус, согласованная стоимость и разговор с командой в одном окне.</p>
        <ul>
          <li><LayoutDashboard size={19}/> Этапы и история заявок</li>
          <li><MessageSquare size={19}/> Переписка по проекту</li>
          <li><FileCheck2 size={19}/> Согласованные материалы и документы</li>
        </ul>
        <button className="secondary-panel" onClick={openLogin}>Перейти в личный кабинет</button>
      </Reveal>
      <Reveal className="studio-cabinet-stage" delay={85}>
        <CabinetPreview paused={effectsPaused}/>
      </Reveal>
    </section>
    <ProcessSteps/>
    <section className="section studio-about" id="about">
      <Reveal className="studio-about-photo">
        <img src={togetherImage} alt="" width={900} height={600} loading="lazy" decoding="async"/>
      </Reveal>
      <Reveal className="studio-about-copy" delay={80}>
        <h2>Кто за этим стоит</h2>
        <p>OVERTAKE — независимое цифровое агентство. Объединяем разработку, дизайн и продвижение, чтобы решать задачи бизнеса целиком.</p>
        <p>Вы общаетесь с людьми, которые погружены в ваш проект. Объясняем решения простым языком и не предлагаем лишнего.</p>
        <a className="secondary-panel" href="/about">Об агентстве</a>
      </Reveal>
    </section>
    <section className="section studio-faq" id="questions">
      <Reveal className="studio-faq-title"><h2>Вопрос — ответ</h2><p>О цене, сроках и работе над проектом.</p>
        <div className="faq-illustration" aria-hidden="true"><span className="faq-illustration-orbit"/><span className="faq-illustration-main"><CircleHelp size={65}/></span><span className="faq-illustration-reply"><MessageSquare size={20}/><i/><i/><i/></span><span className="faq-illustration-check"><Check size={23}/></span></div>
      </Reveal>
      <Reveal delay={75}><React.Suspense fallback={<p role="status">Загружаем вопросы…</p>}><FaqHighlights/></React.Suspense></Reveal>
    </section>
    <div className="section studio-last" id="contacts">
      <LeadSection contacts={content.contacts} heading="Следующий ход за вами" prefill={prefill}
        introExtra={<OfficeMap address={content.contacts.address || ''} compact/>}/>
    </div>
  </main>;
}
