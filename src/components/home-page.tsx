/// <reference types="vite/client" />
import React,{useEffect,useState} from "react";
import {useReducedMotion} from "motion/react";
import {
  ArrowUpRight, ArrowRight, AppWindow, Bot, Calculator, ChartNoAxesCombined, Check,
  CheckCircle2, Clapperboard, Code2, FileText, Globe, Headphones, Kanban,
  Layers, MessageSquare, Paintbrush, Play, Server, Sparkles, Wallet,
} from "lucide-react";
import {BlurFade} from "./magicui/blur-fade";
import {ProjectInvitation} from "./project-invitation";
import {SectionSign} from "./service-motion";
import {LiveProjects} from "./live-projects";
import {mergeServices, servicesRequest, serviceCategoryUrl, type AgencyService} from "../lib/services";
import {offerPrice, startingOffer} from "../lib/public-prices";
import type {Content} from "../lib/app-shared";
import heroImage from "../assets/soft-digital-hero.webp?inline";

const directions = [
  {category:"Сайты", name:"Разработка сайтов", text:"Лендинги, сайты компаний и интернет-магазины.", Icon:Globe, slug:"landing"},
  {category:"Боты и автоматизация", name:"Боты и автоматизация", text:"Telegram-боты для заявок, записи и продаж.", Icon:Bot, slug:"telegram"},
  {category:"CRM", name:"CRM-системы", text:"Внедрение готовой CRM и разработка под ваши процессы.", Icon:Kanban, slug:"crm-setup"},
  {category:"ИИ", name:"ИИ-решения", text:"Ассистенты, поиск по документам и обработка заявок.", Icon:Sparkles, slug:"ai-assistants"},
  {category:"Дизайн", name:"Дизайн", text:"Прототипы, интерфейсы и фирменный стиль.", Icon:Paintbrush, slug:"ui-ux"},
  {category:"Продвижение", name:"Продвижение", text:"SEO, контекстная реклама и соцсети.", Icon:ChartNoAxesCombined, slug:"seo"},
  {category:"Приложения", name:"Веб-приложения", text:"Личные кабинеты, платформы и мобильные веб-сервисы.", Icon:AppWindow, slug:"web-apps"},
  {category:"Сопровождение", name:"Техническая поддержка", text:"Обновления, диагностика и регулярные доработки.", Icon:Headphones, slug:"support"},
  {category:"Хостинг и домены", name:"Хостинг и домены", text:"Размещение сайта, регистрация и продление домена.", Icon:Server, slug:"hosting"},
  {category:"Видео и 3D", name:"Видео и медиа", text:"Монтаж, объёмная графика и анимация.", Icon:Clapperboard, slug:"video"},
];

const benefits = [
  {Icon:Layers, title:"От идеи до запуска", text:"Дизайн, разработка и внедрение"},
  {Icon:FileText, title:"Работаем по договору", text:"Фиксируем объём и сроки"},
  {Icon:Wallet, title:"Согласуем смету", text:"До начала работ"},
  {Icon:Headphones, title:"Поддерживаем проект", text:"После запуска"},
];

const FaqHighlights = React.lazy(() => import("./faq-page").then(m => ({default:m.FaqHighlights})));
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return reduced ? (
    <div className={className}>{children}</div>
  ) : (
    <BlurFade
      className={className}
      inView
      delay={delay}
      duration={0.65}
      direction="up"
      offset={16}
    >
      {children}
    </BlurFade>
  );
}

export function HomePage({content,effectsPaused,order,openLogin}:{content:Content;effectsPaused:boolean;order:(service?:string,context?:string)=>void;openLogin:()=>void}) {
  const [catalog, setCatalog] = useState<AgencyService[]>([]);
  useEffect(() => {
    let active = true;
    servicesRequest().then(result => {
      if (active) setCatalog(mergeServices(result.services));
    }).catch(() => {});
    const id = location.hash.slice(1);
    if (id && id !== "cabinet") requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    return () => { active = false; };
  }, []);

  return (
    <main id="main" className="soft-home">
      <section className="hero soft-hero" id="home">
        <div className="soft-hero-grid">
          <div className="soft-hero-copy">
            <p className="soft-hero-label">Цифровое агентство OVERTAKE</p>
            <h1>Создаём цифровые решения, которые двигают бизнес <span>вперёд</span></h1>
            <p className="soft-hero-description">Разрабатываем сайты, приложения и Telegram-ботов. Настраиваем CRM и автоматизируем работу команды.</p>
            <div className="soft-hero-actions">
              <a className="btn purple" href="/calculator"><Calculator size={18}/> Рассчитать стоимость</a>
              <a className="btn white" href="/portfolio"><Play size={16}/> Смотреть портфолио</a>
            </div>
          </div>
          <div className="soft-hero-art" aria-hidden="true">
            <img src={heroImage} alt="" width={1100} height={825} fetchPriority="high"/>
          </div>
        </div>
        <ul className="soft-benefits">
          {benefits.map(({Icon,title,text}) => <li key={title}><span><Icon size={20}/></span><div><strong>{title}</strong><small>{text}</small></div></li>)}
        </ul>
      </section>
      <section className="section soft-services" id="services">
        <div className="soft-section-heading">
          <div><h2>Что мы делаем</h2><p className="soft-service-intro">Делаем сложное понятным</p></div>
          <a className="secondary-panel" href="/services">Все услуги агентства <ArrowUpRight size={17}/></a>
        </div>
        <div className="soft-service-grid">
          {directions.map(({category,name,text,Icon,slug}) => {
            const service = catalog.find(item => item.slug === slug);
            const available = service && !['Скрыта','Временно недоступна'].includes(service.status);
            const offer = available ? startingOffer(slug, content.prices) : undefined;
            return <a key={category} className="soft-service-card" href={serviceCategoryUrl(category)}>
              <span className="soft-service-icon"><Icon size={26} strokeWidth={1.8}/></span>
              <h3>{name}</h3>
              <p>{text}</p>
              <div className="soft-card-footer"><strong>{offer ? offerPrice(offer) : "По согласованию"}</strong><span><ArrowRight size={17}/></span></div>
            </a>;
          })}
        </div>
        <div className="soft-packages">
          <span className="soft-service-icon"><Layers size={24}/></span>
          <div><h3>Готовые форматы работы</h3><p>Запуск проекта, развитие и регулярная поддержка</p></div>
          <a className="btn purple" href="/pricing#formats">Смотреть форматы <ArrowUpRight size={16}/></a>
        </div>
      </section>
      <LiveProjects projects={content.projects}/>
          <section className="cabinet-promo section">
            <Reveal className="cabinet-promo-copy">
              <span className="eyebrow">ВСЁ ПОД КОНТРОЛЕМ</span>
              <h2>
                Ваш проект
                <br />
                Без «а что там?»
              </h2>
              <p>
                Личный кабинет, где всё на своих местах: статус проекта,
                согласованная стоимость и переписка с командой.
              </p>
              <ul>
                <li>
                  <Check size={17} /> Понятный статус на каждом этапе
                </li>
                <li>
                  <Check size={17} /> Прямой диалог с командой
                </li>
                <li>
                  <Check size={17} /> История заявок в одном месте
                </li>
              </ul>
              <button className="secondary-panel" onClick={openLogin}>
                Перейти в личный кабинет <ArrowUpRight size={18} />
              </button>
            </Reveal>
            <Reveal className="dashboard-preview">
              <div className="preview-toolbar">
                <span>
                  <span className="live-dot" /> OVERTAKE / КАБИНЕТ
                </span>
                <span className="sample-badge">Пример интерфейса</span>
              </div>
              <div className="preview-content">
                <div className="preview-greeting">
                  Всё идёт по плану <span>↗</span>
                </div>
                <p>Ваш следующий большой шаг — уже в работе.</p>
                <div className="preview-project">
                  <div>
                    <span className="tag-purple">В работе</span>
                    <span className="muted tiny">Веб-разработка</span>
                  </div>
                  <h3>Новый сайт компании</h3>
                  <div className="progress-line">
                    <span />
                  </div>
                  <div className="preview-steps">
                    <span>
                      <CheckCircle2 size={15} /> Концепция
                    </span>
                    <span>
                      <CheckCircle2 size={15} /> Дизайн
                    </span>
                    <span>
                      <Code2 size={15} /> Разработка
                    </span>
                  </div>
                </div>
                <div className="preview-message">
                  <span className="avatar">O</span>
                  <div>
                    <b>Команда OVERTAKE</b>
                    <p>Дизайн согласован. Переходим к разработке!</p>
                  </div>
                  <span className="live-dot" />
                </div>
              </div>
            </Reveal>
          </section>
          <section className="section" id="approach">
            <Reveal>
              <div className="section-title">
                <div>
                  <SectionSign number="03" label="КАК МЫ РАБОТАЕМ" />
                  <h2>
                    От «есть идея»
                    <br />
                    <span className="muted">до «всё работает»</span>
                  </h2>
                </div>
                <p>
                  На каждом этапе вы понимаете,
                  <br />
                  что происходит, что будет дальше
                  <br />и за что вы платите.
                </p>
              </div>
            </Reveal>
            <div className="process-grid">
              {[
                {
                  title: "Знакомимся",
                  text: "Уточняем цели и пожелания на онлайн-встрече или лично по предварительной договорённости.",
                },
                {
                  title: "Договариваемся",
                  text: "Заполняем бриф, согласуем смету и сроки, заключаем договор и выставляем счёт.",
                },
                {
                  title: "Создаём",
                  text: "Проектируем и разрабатываем. Показываем результат по этапам, согласуем правки и подключаем интеграции.",
                },
                {
                  title: "Запускаем",
                  text: "Тестируем, публикуем, передаём доступы и инструкции. Договариваемся о поддержке после запуска.",
                },
              ].map((s, i) => (
                <Reveal key={s.title} delay={i * 0.08}>
                  <div className="process-item">
                    <div>
                      <span>0{i + 1}</span>
                      <ArrowRight size={19} />
                    </div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
          <section className="about section" id="about">
            <Reveal>
              <SectionSign number="04" label="КТО ЗА ЭТИМ СТОИТ" />
              <div className="about-layout">
                <h2>
                  Два основателя
                  <br />
                  Один подход:
                  <br />
                  <span className="gradient-text">делать с толком</span>
                </h2>
                <div>
                  <p className="large-copy">
                    OVERTAKE — независимое цифровое агентство. Объединяем
                    разработку, дизайн и продвижение, чтобы решать задачи
                    бизнеса целиком.
                  </p>
                  <p>
                    Вы общаетесь с людьми, которые погружены в ваш проект.
                    Объясняем решения простым языком и не предлагаем лишнего.
                  </p>
                  <div className="about-points">
                    <span>
                      <FileText size={20} /> Официально, через ИП
                    </span>
                    <span>
                      <MessageSquare size={20} /> На связи с вами
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </section>
          <section className="section faq-section">
            <Reveal>
              <span className="eyebrow muted">ПОЛЕЗНО ЗНАТЬ</span>
              <h2>
                Хорошие <br />
                вопросы
              </h2>
            </Reveal>
            <Reveal className="faq-list">
              <React.Suspense fallback={<p role="status">Загружаем вопросы…</p>}><FaqHighlights /></React.Suspense>
           </Reveal>
          </section>
          <section className="contact-section section" id="contacts">
            <Reveal className="contact-layout">
              <div className="contact-story">
              <span className="eyebrow">СЛЕДУЮЩИЙ ХОД — ЗА ВАМИ</span>
              <h2>
                Давайте сделаем
                <br />
                <span>что-то значимое</span>
              </h2>
              <p className="contact-intro">Расскажите, что хотите изменить в своём бизнесе. Поможем превратить идею в понятный план, дизайн и работающий продукт.</p>
              <div className="contact-promises"><span><MessageSquare size={16}/> Обсудим задачу</span><span><FileText size={16}/> Согласуем смету и договор</span></div>
              <div className="contact-office"><span>ПОЗНАКОМИМСЯ ЛИЧНО ИЛИ ОНЛАЙН</span>
              {content.contacts.address && <p>{content.contacts.address}</p>}
              <small>Встречи в офисе — по предварительной договорённости</small>
              {content.contacts.email && (
                <a
                  className="contact-email"
                  href={"mailto:" + content.contacts.email}
                >
                  {content.contacts.email}
                </a>
              )}
              </div></div>
              <ProjectInvitation onDiscuss={()=>order()} paused={effectsPaused}/>
            </Reveal>
          </section>
        </main>);}
