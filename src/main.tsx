import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { LoadBoundary } from "./components/load-boundary";
import {ArchiveBackground} from './components/archive-background';
import { LazyMotion, MotionConfig, m, useReducedMotion } from "framer-motion";
import {
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
  UserRound,
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
import "./style.css";
import "./premium.css";
import "./polish.css";
import "./components/catalog-common.css";
import { PageScrollbar } from "./components/page-scrollbar";
import { LegalPage, legalTitles, ConsentLabel, LEGAL_VERSION } from "./components/legal-pages";
import { PriceMatch } from "./components/price-match";
import { LEAD_HANDOFF_KEY, type LeadPrefill } from "./components/lead-section";
import { CookiePreferences } from "./components/cookie-preferences";
import { ThemePicker } from "./components/theme-picker";
import { HelpMenu } from "./components/help-menu";
import {contactTelegram} from "./lib/contact-links";
import "./soft-digital.css";
import "./studio.css";
import "./refinement.css";
const ServiceCatalog = React.lazy(() => import("./components/service-catalog").then(m=>({default:m.ServiceCatalog})));
const ProjectCalculator = React.lazy(() => import("./components/project-calculator").then(m => ({default:m.ProjectCalculator})));
const BriefWizard = React.lazy(() => import("./components/brief-wizard").then(m => ({default:m.BriefWizard})));
const FaqPage = React.lazy(() => import("./components/faq-page").then(m => ({default:m.FaqPage})));
const ContactsPage = React.lazy(() => import("./components/contacts-page").then(m => ({default:m.ContactsPage})));
const PortfolioPage = React.lazy(() => import("./components/portfolio-page").then(m => ({default:m.PortfolioPage})));
const NotFound = React.lazy(() => import("./components/not-found").then(m => ({default:m.NotFound})));
import {serviceCategoryUrl} from "./lib/services";
import {directions} from "./components/studio-directions";
import {CalculatorArt} from "./components/calculator-art";
import "./studio-finish.css";
import "./studio-navigation.css";
import "./overtake-design.css";
import {api,services,type User,type Project,type Content} from "./lib/app-shared";
import {Logo} from "./components/logo";
const AboutPage = React.lazy(() => import("./components/about-page").then(m => ({default:m.AboutPage})));
const HomePage = React.lazy(() => import("./components/home-page").then(m=>({default:m.HomePage})));
const Dashboard = React.lazy(() => import("./components/dashboard").then(m=>({default:m.Dashboard})));
const Os5Workspace=React.lazy(()=>import("./components/os5-workspace").then(m=>({default:m.Os5Workspace})));
function PublicBriefRedirect() {
  useEffect(() => { location.replace("/#request"); },[]);
  return <main id="main" className="catalog-page site-route-loading"><a href="/#request">Перейти к форме заявки</a></main>;
}
function App() {
  const [effectsPaused, setEffectsPaused] = useState(false);
  const [os5Enabled,setOs5Enabled]=useState<boolean|null>(null);
  const os5Route=/^\/cabinet(?:\/[a-z-]+)?$/.test(location.pathname);
  useEffect(()=>{api("os5/status").then(value=>setOs5Enabled(Boolean(value.enabled))).catch(()=>setOs5Enabled(false));},[]);
  useEffect(()=>{if(os5Enabled && location.pathname==="/" && location.hash==="#cabinet") location.replace("/cabinet");},[os5Enabled]);
  const serviceMenu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (event:PointerEvent) => {
      if (serviceMenu.current && !serviceMenu.current.contains(event.target as Node)) serviceMenu.current.open = false;
    };
    document.addEventListener("pointerdown",close);
    return () => document.removeEventListener("pointerdown",close);
  },[]);
  useEffect(() => {
    document.documentElement.classList.toggle("effects-paused", effectsPaused);
    return () => document.documentElement.classList.remove("effects-paused");
  }, [effectsPaused]);
  useEffect(() => {
    const update = () =>
      document.documentElement.classList.toggle("page-hidden", document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      document.documentElement.classList.remove("page-hidden");
    };
  }, []);
  const [user, setUser] = useState<User | null>(null),
    [content, setContent] = useState<Content>({
      projects: [],
      prices: {},
      contacts: {},
    }),
    [route, setRoute] = useState(location.hash || "#home"),
    [modal, setModal] = useState(""),
    [selected] = useState(services[0].name),
    [homeLead, setHomeLead] = useState<LeadPrefill>(),
    [menu, setMenu] = useState(false),
    [toast, setToast] = useState(""),
    [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    api("me")
      .then((j) => setUser(j.user))
      .catch(() => {})
      .finally(() => setAuthReady(true));
    api("content").then(setContent).catch(() => {});
    if (location.pathname === "/" && location.hash === "#request") {
      try {
        const saved = JSON.parse(sessionStorage.getItem(LEAD_HANDOFF_KEY) || "null");
        sessionStorage.removeItem(LEAD_HANDOFF_KEY);
        if (typeof saved?.service === "string" && typeof saved?.description === "string") setHomeLead(saved);
      } catch {}
    }
    const h = () => {
      setRoute(location.hash || "#home");
      setMenu(false);
    };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const order = (service = "Обсуждение проекта", context = "") => {
    const prefill = {service:typeof service === "string" ? service : "Обсуждение проекта",description:context};
    if (location.pathname === "/" && !location.hash.startsWith("#cabinet")) {
      setModal("");
      setMenu(false);
      setHomeLead(prefill);
      if (location.hash !== "#request") history.pushState(null,"","#request");
      setRoute("#request");
      return;
    }
    try { sessionStorage.setItem(LEAD_HANDOFF_KEY, JSON.stringify(prefill)); } catch {}
    location.href = "/#request";
  };
  const discussPrice = () => order("Сравнение стоимости", "Есть предложение от другого исполнителя. Хочу сравнить состав работ и обсудить стоимость.");
  const openLogin = () =>
    user ? (location.href = os5Enabled?"/cabinet":"/#cabinet") : setModal("auth");
  const logout = async () => {
    await api("logout", {});
    setUser(null);
    if(os5Route) location.href="/";
    else location.hash = "#home";
  };
  const catalogPath = location.pathname === "/services" || location.pathname.startsWith("/services/");
  const dashboard = route.startsWith("#cabinet") || ["/account","/admin"].includes(location.pathname);
  const isHome = location.pathname === "/" && !dashboard;
  const knownRoute = os5Route || ["/","/about","/account","/admin","/contacts","/faq","/brief","/calculator","/services","/portfolio",...Object.keys(legalTitles)].includes(location.pathname) || /^\/(services|portfolio)\/[a-z0-9-]+$/.test(location.pathname);
  const legalPath = legalTitles[location.pathname] ? location.pathname : "";
  if(os5Route) {
    if(!authReady||os5Enabled===null) return <main id="main" className="catalog-page"><p role="status">Загружаем рабочее пространство…</p></main>;
    if(os5Enabled && user) return <React.Suspense fallback={<p role="status">Загружаем CRM…</p>}><Os5Workspace user={user} logout={logout}/></React.Suspense>;
    return <main id="main" className="catalog-page"><a href="/">На сайт OVERTAKE</a><h1>Рабочее пространство OVERTAKE</h1>
      {user?<p>CRM 5.0 пока недоступна. <a href={user.role==="admin"?"/admin":"/account"}>Перейти в существующий кабинет</a></p>:
        <button className="btn purple" onClick={()=>setModal("auth")}>Войти в кабинет</button>}
      {modal==="auth"&&<Modal effectsPaused={effectsPaused} close={()=>setModal("")} title="Вход"><Auth onSuccess={async()=>{const data=await api("me");setUser(data.user);setModal("");}}/></Modal>}
    </main>;
  }
  return (
    <MotionConfig reducedMotion={effectsPaused ? "always" : "user"}>
      <PageScrollbar />
      <a className="skip" href="#main">
        Перейти к содержимому
      </a>
      <header className={isHome ? "header archive-nav" : "header overtake-nav"}>
        <a href="/#home" aria-label="OVERTAKE — главная">
          <Logo />
        </a>
        <nav className={menu ? "nav open" : "nav"} aria-label="Главное меню">
          <div className="product-nav">
            <a href="/services" aria-current={catalogPath?"page":undefined}>{isHome ? "Продукты" : "Продукты и решения"}</a>
            <details className="service-menu" ref={serviceMenu} onKeyDown={event => {
            if (event.key === "Escape" && event.currentTarget.open) {
              event.currentTarget.open = false;
              event.currentTarget.querySelector("summary")?.focus();
            }
          }}>
            <summary aria-label="Открыть направления"><span>Направления и калькулятор</span><ChevronDown size={15} aria-hidden="true"/></summary>
            <div className="service-menu-panel">
              <div className="service-menu-catalog">
                <div className="service-menu-heading"><strong>Направления</strong><a className="menu-catalog-link" href="/services">Весь каталог</a></div>
                <div className="service-menu-grid">{directions.map(({category,name,text,Icon}) => <a key={category} href={serviceCategoryUrl(category)}>
                  <span className="service-menu-icon"><Icon size={19} strokeWidth={1.75} aria-hidden="true"/></span><span><strong>{name}</strong><small>{text}</small></span>
                </a>)}</div>
              </div>
              <a href="/services#calculator" className="menu-calculator">
                <CalculatorArt/>
                <span><Calculator size={17}/> Калькулятор проекта</span>
                <small>Подберите объём и функции. Смета обновится на экране.</small>
                <b>Рассчитать стоимость</b>
              </a>
            </div>
            </details>
          </div>
          <a href="/portfolio" aria-current={location.pathname.startsWith("/portfolio")?"page":undefined}>
            <span>Портфолио</span>
          </a>
          <a href="/about" aria-current={location.pathname==="/about"?"page":undefined}>
            <span>О компании</span>
          </a>
          <a className="nav-contacts" href="/contacts" aria-current={location.pathname==="/contacts"?"page":undefined}>
            <span>Контакты</span>
          </a>
        </nav>
        <div className="header-actions">
          <ThemePicker />
          {!isHome && <HelpMenu contacts={content.contacts} onRequest={()=>order()} onOpen={()=>{
            setMenu(false);
            if (serviceMenu.current) serviceMenu.current.open=false;
          }}/>}
          <button className="login-link" aria-label={user ? "Личный кабинет" : "Вход"} onClick={openLogin}>
            <UserRound size={16} aria-hidden="true"/><span className="login-label">{user ? "Кабинет" : "Вход"}</span>
          </button>
          {isHome && <a className="archive-header-contact" href="/contacts">Связаться с нами</a>}
          <button
            className="menu-toggle"
            aria-label={menu ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {!knownRoute ? <React.Suspense fallback={<main id="main" className="catalog-page">Страница не найдена</main>}><NotFound /></React.Suspense> : (location.pathname === "/admin" && user && user.role!=="admin") ? <main className="catalog-page" id="main"><h1>Доступ только для команды</h1><a className="catalog-home-link" href="/account">Открыть свой кабинет →</a></main> : (location.pathname === "/portfolio" || location.pathname.startsWith("/portfolio/")) ? <React.Suspense fallback={<main id="main" className="catalog-page site-route-loading" role="status">Загружаем портфолио…</main>}><PortfolioPage contacts={content.contacts} /></React.Suspense> : location.pathname === "/about" ? <React.Suspense fallback={<main id="main" className="catalog-page site-route-loading" role="status">Загружаем страницу…</main>}><AboutPage contacts={content.contacts} /></React.Suspense> : location.pathname === "/contacts" ? <React.Suspense fallback={<main id="main" className="catalog-page site-route-loading" role="status">Загружаем контакты…</main>}><ContactsPage contacts={content.contacts} /></React.Suspense> : location.pathname === "/faq" ? <React.Suspense fallback={<main id="main" className="catalog-page site-route-loading" role="status">Загружаем вопросы…</main>}><FaqPage /></React.Suspense> : location.pathname === "/brief" ? (!authReady ? <main id="main" className="catalog-page site-route-loading" role="status">Загружаем страницу…</main> : user ? <React.Suspense fallback={<main id="main" className="catalog-page site-route-loading" role="status">Загружаем бриф…</main>}><BriefWizard user={user} /></React.Suspense> : <PublicBriefRedirect/>) : location.pathname === "/calculator" ? <React.Suspense fallback={<main id="main" className="catalog-page site-route-loading" role="status">Загружаем параметры проекта…</main>}><ProjectCalculator prices={content.prices} contacts={content.contacts} /></React.Suspense> : catalogPath ? <React.Suspense fallback={<main id="main" className="catalog-page site-route-loading" role="status">Загружаем продукты и решения…</main>}><ServiceCatalog path={location.pathname} order={order} prices={content.prices} contacts={content.contacts} /></React.Suspense> : legalPath ? <LegalPage path={legalPath} contacts={content.contacts} /> : dashboard ? (!authReady ? <main id="main" className="cabinet-entry site-route-loading" role="status">Загружаем личный кабинет…</main> :
        <React.Suspense fallback={<main id="main" className="catalog-page site-route-loading" role="status">Загружаем кабинет…</main>}><Dashboard
          user={user}
          content={content}
          setContent={setContent}
          order={order}
          login={() => setModal("auth")}
          logout={logout}
          notify={setToast}
        /></React.Suspense>
      ) : (
        <React.Suspense fallback={<main id="main" className="catalog-page site-route-loading" role="status">Загружаем главную…</main>}><HomePage content={content} openLogin={openLogin} effectsPaused={effectsPaused} prefill={homeLead} onRequest={order}/></React.Suspense>
      )}
      <footer className={isHome ? "studio-footer overtake-footer archive-footer" : "studio-footer overtake-footer"}>
        {isHome && <ArchiveBackground variant="footer"/>}
        <div className="studio-footer-main">
          <div className="footer-brand"><a href="/" aria-label="OVERTAKE — главная"><Logo/></a><p>Цифровое агентство</p></div>
          <nav aria-label="Агентство"><h2>Агентство</h2><a href="/services">Продукты и решения</a><a href="/portfolio">Портфолио</a><a href="/about">О компании</a></nav>
          <nav aria-label="Начать проект"><h2>Начать проект</h2><a href="/calculator">Калькулятор</a><a href="/#request">Оставить заявку</a><a href="/account">Личный кабинет</a></nav>
          <div className="footer-connect"><h2>Связаться</h2><a href="tel:+79517506700">+7 (951) 750-67-00</a><a href="/contacts">Контакты</a><a href="/faq">Вопросы и ответы</a><a href="/legal">Реквизиты</a></div>
        </div>
        <div className="studio-footer-legal">
          <span>© {new Date().getFullYear()} OVERTAKE</span>
          <a href="/privacy">Политика обработки персональных данных</a>
          <a href="/personal-data-consent">Согласие на обработку данных</a>
          <a href="/terms">Пользовательское соглашение</a>
          <a href="/cookies">Файлы cookie</a>
          <button className="motion-control" aria-pressed={effectsPaused} onClick={() => setEffectsPaused(!effectsPaused)}>{effectsPaused ? "Включить анимации" : "Приостановить анимации"}</button>
        </div>
      </footer>
      <div className="notice-dock">
        <CookiePreferences/>
      </div>
      <PriceMatch allowed={!isHome && !dashboard && !modal && !legalPath && location.pathname !== "/brief" && knownRoute} onDiscuss={discussPrice}/>
      {modal && (
        <Modal
          effectsPaused={effectsPaused}
          close={() => setModal("")}
          title={
            modal === "auth"
              ? "Вход"
              : modal === "service"
                  ? selected
                  : modal === "case"
                    ? "Концепция проекта"
                    : modal === "privacy"
                      ? "Обработка персональных данных"
                      : "Официальная информация"
          }
        >
          {modal === "auth" ? (
            <Auth
              onSuccess={async () => {
                const j = await api("me");
                setUser(j.user);
                setModal("");
                if(!os5Route) location.href = os5Enabled?"/cabinet":"/#cabinet";
              }}
            />
          ) : modal === "service" ? (
            <div className="service-detail">
              <p>{services.find((s) => s.name === selected)?.text}</p>
              <h3>Что входит в работу</h3>
              <ul>
                <li>Обсуждение задачи и согласование требований</li>
                <li>Проектирование и подготовка решения</li>
                <li>Реализация и промежуточные согласования</li>
                <li>Тестирование, передача и запуск</li>
              </ul>
              <p className="muted">
                Стоимость и сроки фиксируются в договоре после обсуждения объёма
                работ.
              </p>
              <button className="btn purple" onClick={() => order(selected)}>
                Обсудить задачу
              </button>
            </div>
          ) : modal === "case" ? (
            <CaseDetail project={JSON.parse(selected)} order={() => order()} />
          ) : modal === "privacy" ? (
            <div className="legal-copy">
              <p>
                Сайт находится на этапе подготовки к запуску. Не отправляйте
                чувствительные данные.
              </p>
              <p>
                При отправке формы сохраняются имя, контакт, описание задачи и
                время обращения. При регистрации также сохраняются адрес почты и
                защищённый хеш пароля. Данные используются для работы с
                обращениями и предоставления доступа к кабинету.
              </p>
              <p>
                Для входа используется необходимый cookie сессии. Рекламные
                cookie не используются.
              </p>
              <p>
                До коммерческого запуска владелец должен указать сведения об
                операторе, сроки хранения, порядок отзыва согласия и контакт для
                обращений. Окончательная редакция политики требует утверждения
                владельцем.
              </p>
            </div>
          ) : (
            <div className="legal-copy">
              <p>
                OVERTAKE готовится к запуску. Работа с клиентами планируется
                через ИП по договору.
              </p>
              <p>
                {content.contacts.legal ||
                  "ФИО индивидуального предпринимателя, ИНН и ОГРНИП ещё не добавлены владельцем."}
              </p>
              <p>
                {content.contacts.address ||
                  "Адрес офиса и график работы будут опубликованы после подтверждения."}
              </p>
              <p>
                Договоры, условия оплаты и реквизиты согласуются до начала
                работ. Онлайн-оплата и электронное подписание пока не
                подключены.
              </p>
            </div>
          )}
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={20} />
          {toast}
          <button aria-label="Закрыть уведомление" onClick={() => setToast("")}>
            <X size={17} />
          </button>
        </div>
      )}
    </MotionConfig>
  );
}
function CaseDetail({
  project,
  order,
}: {
  project: Project;
  order: () => void;
}) {
  return (
    <div className="case-detail">
      <span className="eyebrow muted">{project.category}</span>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      {project.image && <img src={project.image} alt={project.title} />}
      <p>
        Фокус решения: выразительный интерфейс, удобство на мобильных
        устройствах и возможность дальнейшего развития.
      </p>
      {project.url && (
        <a
          className="text-link"
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Открыть проект
        </a>
      )}
      <button className="btn purple" onClick={order}>
        Хочу обсудить похожий проект
      </button>
    </div>
  );
}
const loadDialogMotion = () => import("./components/dialog-motion").then(module => module.dialogMotion);

function Modal({
  title,
  close,
  children,
  effectsPaused,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
  effectsPaused: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() || effectsPaused;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const list = ref.current?.querySelectorAll<HTMLElement>(
          'button,a[href],input,select,textarea,[tabindex="0"]',
        );
        if (!list?.length) return;
        const first = list[0],
          last = list[list.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", h);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", h);
      previous?.focus();
    };
  }, []);
  return (
    <LazyMotion features={loadDialogMotion}><m.div
      className="modal-backdrop"
      initial={reduce ? false : {opacity:0}}
      animate={{opacity:1}}
      transition={{duration:.18}}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <m.div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal"
        initial={reduce ? false : {y:12,scale:.985}}
        animate={{y:0,scale:1}}
        transition={{duration:.28,ease:[.22,1,.36,1]}}
      >
        <button
          className="modal-close"
          aria-label="Закрыть окно"
          onClick={close}
        >
          <X />
        </button>
        <h2 id="modal-title">{title}</h2>
        {children}
      </m.div>
    </m.div></LazyMotion>
  );
}
function Auth({ onSuccess }: { onSuccess: () => void }) {
  const [tab, setTab] = useState("login"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [info, setInfo] = useState("");
  return (
    <>
      <div className="auth-tabs">
        <button
          className={tab === "login" ? "active" : ""}
          onClick={() => {
            setTab("login");
            setError("");
          }}
        >
          Войти
        </button>
        <button
          className={tab === "register" ? "active" : ""}
          onClick={() => {
            setTab("register");
            setError("");
          }}
        >
          Создать аккаунт
        </button>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setBusy(true);
          const f = Object.fromEntries(new FormData(e.currentTarget));
          try {
            if (tab === "register") {
              await api("register", { ...f, consent: !!f.consent, consentVersion: LEGAL_VERSION });
              setInfo(
                "Аккаунт создан. Теперь войдите с вашей почтой и паролем.",
              );
              setTab("login");
            } else {
              await api("login", f);
              onSuccess();
            }
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {tab === "register" && (
          <label>
            Ваше имя
            <input name="name" autoComplete="name" required maxLength={80} />
          </label>
        )}
        <label>
          Электронная почта
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Пароль
          <input
            name="password"
            type="password"
            autoComplete={tab === "login" ? "current-password" : "new-password"}
            required
            minLength={tab === "register" ? 10 : 1}
            maxLength={128}
          />
        </label>
        {tab === "register" && (
          <>
            <small className="muted">Не менее 10 символов.</small>
            <ConsentLabel purpose="для создания аккаунта" />
          </>
        )}
        {info && (
          <p className="success" role="status">
            {info}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="btn purple full" disabled={busy}>
          {busy ? (
            <LoaderCircle className="spin" size={18} />
          ) : tab === "login" ? (
            "Войти в кабинет"
          ) : (
            "Зарегистрироваться"
          )}
          <ArrowRight size={17} />
        </button>
        <p className="form-note">
          <LockKeyhole size={14} /> Доступ только к вашим проектам и переписке.
        </p>
        <p className="form-note">
          Подтверждение почты и восстановление пароля будут доступны после
          подключения почтового сервиса.
        </p>
      </form>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LoadBoundary><App /></LoadBoundary>
  </React.StrictMode>,
);
