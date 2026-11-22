/// <reference types="vite/client" />
import React,{useEffect,useState} from 'react';
import {
  ArrowUpRight, AppWindow, Bot, Calculator, ChartNoAxesCombined, CircleHelp, Clapperboard,
  Code2, FileCheck2, Globe, Headphones, Kanban, LayoutDashboard, MessageSquare, Paintbrush,
  Plus, Server, Sparkles, Workflow,
} from 'lucide-react';
import {LiveProjects} from './live-projects';
import {Reveal} from './reveal';
import {LeadSection} from './lead-section';
import {ProcessSteps} from './process-steps';
import {mergeServices,servicesRequest,serviceCategoryUrl,defaultAgencyServices,type AgencyService} from '../lib/services';
import {offerPrice,startingOffer} from '../lib/public-prices';
import type {Content} from '../lib/app-shared';
import heroImage from '../assets/studio-motion-ribbon.webp?inline';
import togetherImage from '../assets/studio-together.webp?inline';

const directions = [
  {category:'Сайты',name:'Разработка сайтов',text:'Лендинги, сайты компаний и магазины.',Icon:Globe,slug:'landing'},
  {category:'Боты и автоматизация',name:'Боты и автоматизация',text:'Заявки, запись и продажи в Telegram.',Icon:Bot,slug:'telegram'},
  {category:'CRM',name:'CRM-системы',text:'Внедрение CRM и учёт под ваши процессы.',Icon:Kanban,slug:'crm-setup'},
  {category:'ИИ',name:'ИИ-решения',text:'Ассистенты, документы и обработка заявок.',Icon:Sparkles,slug:'ai-assistants'},
  {category:'Дизайн',name:'Дизайн',text:'Интерфейсы, логотипы и фирменный стиль.',Icon:Paintbrush,slug:'ui-ux'},
  {category:'Продвижение',name:'Продвижение',text:'SEO, реклама и ведение соцсетей.',Icon:ChartNoAxesCombined,slug:'seo'},
  {category:'Приложения',name:'Приложения',text:'Личные кабинеты, платформы и PWA.',Icon:AppWindow,slug:'web-apps'},
  {category:'Сопровождение',name:'Поддержка',text:'Диагностика, обновления и доработки.',Icon:Headphones,slug:'support'},
  {category:'Хостинг и домены',name:'Хостинг и домены',text:'Размещение, регистрация и продление.',Icon:Server,slug:'hosting'},
  {category:'Видео и 3D',name:'Видео и 3D',text:'Монтаж, объёмная графика и анимация.',Icon:Clapperboard,slug:'video'},
];
const benefits = ['Работаем по договору','Согласуем смету заранее','Ведём от идеи до запуска','Поддерживаем после запуска'];
const FaqHighlights = React.lazy(() => import('./faq-page').then(module => ({default:module.FaqHighlights})));

export function HomePage({content,openLogin}:{content:Content;openLogin:()=>void}) {
  const [catalog,setCatalog] = useState<AgencyService[]>(defaultAgencyServices);
  useEffect(() => {
    let active = true;
    servicesRequest().then(result => { if (active) setCatalog(mergeServices(result.services)); }).catch(() => {});
    const anchor = location.hash.slice(1);
    if (anchor && anchor !== 'cabinet') requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView());
    return () => { active = false; };
  },[]);
  return <main id="main" className="soft-home">
    <section className="studio-hero" id="home" aria-labelledby="hero-title">
      <div className="studio-hero-grid">
        <div className="studio-hero-copy" data-enter>
          <h1 id="hero-title">
            <span className="hero-line"><span>Создаём цифровые</span></span>{' '}
            <span className="hero-line"><span>решения, которые</span></span>{' '}
            <span className="hero-line"><span>двигают бизнес <em>вперёд</em></span></span>
          </h1>
          <p>Сайты, Telegram-боты и CRM, которые упрощают работу команды. Проектируем, запускаем и поддерживаем.</p>
          <div className="studio-hero-actions">
            <a className="btn purple" href="/calculator"><ArrowUpRight size={19}/> Рассчитать стоимость</a>
            <a className="secondary-panel" href="/portfolio"><ArrowUpRight size={18}/> Смотреть портфолио</a>
          </div>
          <ul className="studio-benefits">{benefits.map(text => <li key={text}><Plus size={14} aria-hidden="true"/>{text}</li>)}</ul>
        </div>
        <div className="studio-hero-stage" aria-hidden="true">
          <div className="studio-hero-gridlines"/>
          <div className="studio-hero-track"><i/><i/></div><div className="studio-hero-sweep"/>
          <div className="studio-hero-art"><img src={heroImage} alt="" width={1080} height={810} fetchPriority="high"/></div>
          <span className="studio-hero-orbit orbit-code"><Code2 size={21}/></span>
          <span className="studio-hero-orbit orbit-flow"><Workflow size={20}/></span>
        </div>
      </div>
    </section>
    <section className="section studio-services" id="services">
      <Reveal><div className="studio-section-head">
        <div><h2>Что мы делаем</h2><p className="studio-service-tagline">{['Делаем','сложное','понятным'].map(word => <span key={word}>{word}</span>)}</p></div>
        <a className="secondary-panel" href="/services"><ArrowUpRight size={18}/> Все услуги агентства</a>
      </div></Reveal>
      <div className="studio-service-grid">
        {directions.map(({category,name,text,Icon,slug},index) => {
          const active = catalog.some(item => item.category === category && !['Скрыта','Временно недоступна'].includes(item.status));
          if (!active) return null;
          const service = catalog.find(item => item.slug === slug && !['Скрыта','Временно недоступна'].includes(item.status));
          const offer = service && startingOffer(slug,content.prices);
          return <Reveal key={category} delay={(index%5)*36}>
            <a className="studio-service-card" href={serviceCategoryUrl(category)}>
              <div className="studio-card-top"><span className="studio-glyph"><Icon size={25}/></span><Icon className="studio-card-watermark" size={70} strokeWidth={1} aria-hidden="true"/><ArrowUpRight size={19} className="studio-card-arrow"/></div>
              <h3>{name}</h3><p>{text}</p><strong>{offer ? offerPrice(offer) : 'По согласованию'}</strong>
            </a>
          </Reveal>;
        })}
      </div>
      <Reveal><div className="studio-bundle"><span className="studio-glyph"><Calculator size={23}/></span>
        <div><h3>Готовые пакеты под ключ</h3><p>Выберите базовый пакет и добавьте нужные функции.</p></div>
        <a className="secondary-panel" href="/pricing#formats"><ArrowUpRight size={17}/> Пакеты и цены</a>
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
        <button className="secondary-panel" onClick={openLogin}><ArrowUpRight size={17}/> Перейти в личный кабинет</button>
      </Reveal>
      <Reveal className="studio-cabinet-stage" delay={85}>
        <div className="studio-product-frame" aria-label="Пример интерфейса личного кабинета">
          <div className="studio-product-toolbar"><span><i/><i/><i/></span><b>Личный кабинет</b><small>Пример</small></div>
          <div className="studio-product-body">
            <div className="studio-product-sidebar" aria-hidden="true"><LayoutDashboard size={17}/><MessageSquare size={17}/><FileCheck2 size={17}/></div>
            <div className="studio-product-content">
              <div><strong>Сайт компании</strong><span className="studio-status"><i/> В разработке</span></div>
              <ol><li>Структура</li><li>Дизайн</li><li>Разработка</li></ol>
              <div className="studio-product-message"><MessageSquare size={17}/><span>Макеты согласованы. Собираем страницы.</span></div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
    <ProcessSteps/>
    <section className="section studio-about" id="about">
      <Reveal className="studio-about-photo">
        <img src={togetherImage} alt="" width={720} height={540} loading="lazy" decoding="async"/>
      </Reveal>
      <Reveal className="studio-about-copy" delay={80}>
        <h2>Кто за этим стоит</h2>
        <p>OVERTAKE — независимое цифровое агентство. Объединяем разработку, дизайн и продвижение, чтобы решать задачи бизнеса целиком.</p>
        <p>Вы общаетесь с людьми, которые погружены в ваш проект. Объясняем решения простым языком и не предлагаем лишнего.</p>
        <a className="secondary-panel" href="/about"><ArrowUpRight size={17}/> Об агентстве</a>
      </Reveal>
    </section>
    <section className="section studio-faq" id="questions">
      <Reveal className="studio-faq-title"><span className="studio-glyph" aria-hidden="true"><CircleHelp size={28}/></span><h2>Вопрос — ответ</h2><p>О цене, сроках и работе над проектом.</p></Reveal>
      <Reveal delay={75}><React.Suspense fallback={<p role="status">Загружаем вопросы…</p>}><FaqHighlights/></React.Suspense></Reveal>
    </section>
    <div className="section studio-last" id="contacts">
      <LeadSection contacts={content.contacts} heading="Следующий ход за вами"/>
    </div>
  </main>;
}
