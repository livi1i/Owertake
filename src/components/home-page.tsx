import React,{useEffect,useState} from "react";
import {useReducedMotion} from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Minus,
  Menu,
  X,
  Code2,
  Layers,
  Send,
  Workflow,
  MessageSquare,
  Check,
  ChevronDown,
  Command,
  Globe,
  LockKeyhole,
  LogOut,
  LayoutDashboard,
  FolderOpen,
  FileText,
  Settings,
  Calculator,
  Clock,
  CheckCircle2,
  Download,
  LoaderCircle,
  Users,
  Mail,
} from "lucide-react";
import {BlurFade} from "./magicui/blur-fade";
import {WebsiteBook} from "./website-book";
import {AllServicesLink,ProjectInvitation} from "./project-invitation";
import {ProjectVisual} from "./project-visual";
import {ServiceMotion,SectionSign} from "./service-motion";
import {projectSlug} from "../lib/portfolio";
import {WorkGallery} from "./work-gallery";
import {LiveProjects} from "./live-projects";
import {services,type Content,type Project} from "../lib/app-shared";
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

export function HomePage({content,effectsPaused,order,openLogin,showService}:{content:Content;effectsPaused:boolean;order:(service?:string,context?:string)=>void;openLogin:()=>void;showService:(name:string)=>void}){
useEffect(()=>{const id=location.hash.slice(1);if(id&&id!=="cabinet")requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView());},[]);
return (        <main id="main">
          <section className="hero" id="home">
            <div className="hero-top">
              <span className="eyebrow">
                <span className="live-dot" /> DIGITAL AGENCY · ОТ ИДЕИ ДО
                ЗАПУСКА
              </span>
              <span className="hero-coordinate">
                DEVELOPMENT / DESIGN / GROWTH
              </span>
            </div>
            <div className="hero-grid">
              <div className="hero-copy">
                <Reveal>
                  <h1>
                    Ваш бизнес
                    <br />
                    На шаг
                    <br />
                    <span className="gradient-text">впереди</span>
                    <span className="heading-dot">↗</span>
                  </h1>
                </Reveal>
                <Reveal delay={0.12}>
                  <p className="hero-description">
                    Создаём сайты, ботов и цифровые продукты,
                    <br className="desktop" /> которые помогают вашему бизнесу
                    расти.
                  </p>
                  <div className="hero-buttons">
                    <button className="btn purple" onClick={() => order()}>
                      Обсудить проект <ArrowUpRight size={18} />
                    </button>
                    <a className="text-link" href="/#work">
                      Смотреть проекты <ArrowRight size={18} />
                    </a>
                  </div>
                </Reveal>
                <Reveal delay={0.2}>
                  <div className="hero-proof">
                    <span className="mini-icon">
                      <Check size={13} />
                    </span>{" "}
                    Работаем по договору <span className="proof-divider" /> От
                    первой идеи до поддержки
                  </div>
                </Reveal>
              </div>
              <HeroArt paused={effectsPaused} />
            </div>
            <div className="hero-bottom">
              <span>Технологии, которые работают на вас.</span>
              <a href="/#services">
                Листайте, чтобы познакомиться <span>↓</span>
              </a>
            </div>
          </section>
          <div className="expertise-strip">
            <span>ДЕЛАЕМ СЛОЖНОЕ ПОНЯТНЫМ</span>
            <div>
              Сайты <i>✳</i> Telegram-боты <i>✳</i> CRM-системы <i>✳</i>{" "}
              Веб-приложения <i>✳</i> Социальные сети
            </div>
          </div>
          <section className="section services-section" id="services">
            <Reveal>
              <div className="section-title">
                <div>
                  <SectionSign number="01" label="ЧТО МЫ ДЕЛАЕМ" />
                  <h2>
                    Идея ваша
                    <br />
                    <span className="muted">Решение — наше</span>
                  </h2>
                </div>
                <p>
                  Подключаемся там, где вашему бизнесу
                  <br />
                  нужны технологии. От одной задачи
                  <br />
                  до целой цифровой экосистемы.
                </p>
              </div>
            </Reveal>
            <div className="services-grid">
              {services.map((s, i) => (
                <Reveal key={s.name} delay={(i % 3) * 0.06}>
                  <button
                    className={"service-card service-card-" + i}
                    onClick={() => showService(s.name)}
                  >
                    <ServiceMotion index={i} />
                    <div className="card-top">
                      <span className="service-icon">
                        <s.icon size={23} strokeWidth={1.5} />
                      </span>
                      <span className="card-number">0{i + 1}</span>
                    </div>
                    <h3>{s.name}</h3>
                    <p>{s.text}</p>
                    <div className="tags">
                      {s.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                    <div className="card-bottom">
                      <span>
                        {content.prices[s.name] || "Стоимость после обсуждения"}
                      </span>
                      <ArrowUpRight size={19} />
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
            <div className="all-services-placement"><Reveal><AllServicesLink paused={effectsPaused}/></Reveal></div>
          </section>
          <section className="work-section section" id="work">
            <Reveal>
              <div className="section-title">
                <div>
                  <SectionSign number="02" label="НАШИ ВОЗМОЖНОСТИ" />
                  <h2>
                    Меньше слов
                    <br />
                    <span className="muted">Больше продукта</span>
                  </h2>
                </div>
                <p>
                  Каждый проект начинается с задачи.
                  <br />
                  Показываем, как может выглядеть
                  <br />
                  её цифровое решение.
                </p>
              </div>
            </Reveal>
            <WorkGallery/>
            <p className="section-note">
              Эти примеры иллюстрируют направления работы. Реальные сайты команды — в следующем блоке.
            </p>
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
              <button className="btn white" onClick={openLogin}>
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
                  text: "Слушаем, задаём вопросы и разбираемся в вашей задаче.",
                },
                {
                  title: "Договариваемся",
                  text: "Фиксируем объём, стоимость и сроки в договоре.",
                },
                {
                  title: "Создаём",
                  text: "Проектируем, разрабатываем и показываем промежуточный результат.",
                },
                {
                  title: "Запускаем",
                  text: "Тестируем, передаём проект и обсуждаем дальнейшую поддержку.",
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
function HeroArt({ paused }: { paused: boolean }) {
  return <WebsiteBook globalPaused={paused} />;
}
