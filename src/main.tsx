import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { LoadBoundary } from "./components/load-boundary";
import { MotionConfig } from "motion/react";
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
import "./style.css";
import "./premium.css";
import "./polish.css";
import "./components/catalog-common.css";
import { PageScrollbar } from "./components/page-scrollbar";
import { LegalPage, legalTitles, ConsentLabel, LEGAL_VERSION } from "./components/legal-pages";
import { PriceMatch } from "./components/price-match";
import { CookiePreferences } from "./components/cookie-preferences";
import { ThemePicker } from "./components/theme-picker";
import {contactTelegram} from "./lib/contact-links";
import "./soft-digital.css";
import "./studio.css";
const ServiceCatalog = React.lazy(() => import("./components/service-catalog").then(m=>({default:m.ServiceCatalog})));
const PricingPage = React.lazy(() => import("./components/pricing-page").then(m => ({default:m.PricingPage})));
const ProjectCalculator = React.lazy(() => import("./components/project-calculator").then(m => ({default:m.ProjectCalculator})));
const BriefWizard = React.lazy(() => import("./components/brief-wizard").then(m => ({default:m.BriefWizard})));
const FaqPage = React.lazy(() => import("./components/faq-page").then(m => ({default:m.FaqPage})));
const ContactsPage = React.lazy(() => import("./components/contacts-page").then(m => ({default:m.ContactsPage})));
const PortfolioPage = React.lazy(() => import("./components/portfolio-page").then(m => ({default:m.PortfolioPage})));
const NotFound = React.lazy(() => import("./components/not-found").then(m => ({default:m.NotFound})));
import {serviceCategories, serviceCategoryUrl} from "./lib/services";
import {api,services,type User,type Project,type Content} from "./lib/app-shared";
const AboutPage = React.lazy(() => import("./components/about-page").then(m => ({default:m.AboutPage})));
const HomePage = React.lazy(() => import("./components/home-page").then(m=>({default:m.HomePage})));
const Dashboard = React.lazy(() => import("./components/dashboard").then(m=>({default:m.Dashboard})));
function Logo() {
  return (
    <span className="logo">
      <span className="logo-mark">
        <i />
        <i />
      </span>
      OVERTAKE<span className="logo-dot">®</span>
    </span>
  );
}
function App() {
  const [effectsPaused, setEffectsPaused] = useState(false);
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
    [selected, setSelected] = useState(services[0].name),
    [briefContext, setBriefContext] = useState(""),
    [menu, setMenu] = useState(false),
    [toast, setToast] = useState("");
  useEffect(() => {
    api("me")
      .then((j) => setUser(j.user))
      .catch(() => {});
    const needsPublicContent = (location.pathname === "/" && !location.hash.startsWith("#cabinet")) || ["/contacts","/services","/pricing","/calculator","/about","/portfolio"].includes(location.pathname) || /^\/(services|portfolio)\//.test(location.pathname) || Object.hasOwn(legalTitles,location.pathname);
    if(needsPublicContent) api("content").then(setContent).catch(() => {});
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
    service = typeof service === "string" ? service : "Обсуждение проекта";
    try { sessionStorage.setItem("overtake:brief-handoff", JSON.stringify({service,context})); location.href = "/brief"; return; } catch { setToast("Не удалось перенести параметры. Можно отправить короткую заявку в этом окне."); }
    setBriefContext(context);
    setSelected(service);
    setModal("brief");
  };
  const discussPrice = () => order("Сравнение стоимости", "Есть предложение от другого исполнителя. Хочу сравнить состав работ и обсудить стоимость.");
  const openLogin = () =>
    user ? (location.href = "/#cabinet") : setModal("auth");
  const logout = async () => {
    await api("logout", {});
    setUser(null);
    location.hash = "#home";
  };
  const catalogPath = location.pathname === "/services" || location.pathname.startsWith("/services/");
  const dashboard = route.startsWith("#cabinet") || ["/account","/admin"].includes(location.pathname);
  const knownRoute = ["/","/about","/account","/admin","/contacts","/faq","/brief","/calculator","/pricing","/services","/portfolio",...Object.keys(legalTitles)].includes(location.pathname) || /^\/(services|portfolio)\/[a-z0-9-]+$/.test(location.pathname);
  const legalPath = legalTitles[location.pathname] ? location.pathname : "";
  return (
    <MotionConfig reducedMotion="user">
      <PageScrollbar />
      <a className="skip" href="#main">
        Перейти к содержимому
      </a>
      <header className="header">
        <a href="/#home" aria-label="OVERTAKE — главная">
          <Logo />
        </a>
        <nav className={menu ? "nav open" : "nav"} aria-label="Главное меню">
          <details className="service-menu" ref={serviceMenu} onKeyDown={event => {
            if (event.key === "Escape" && event.currentTarget.open) {
              event.currentTarget.open = false;
              event.currentTarget.querySelector("summary")?.focus();
            }
          }}>
            <summary>Услуги <ChevronDown size={14} aria-hidden="true"/></summary>
            <div className="service-menu-panel">
              {serviceCategories.map(category => <a key={category} href={serviceCategoryUrl(category)}>{category}</a>)}
              <a href="/services" className="menu-action">Все услуги</a>
              <a href="/calculator" className="menu-action"><Calculator size={16}/> Калькулятор</a>
            </div>
          </details>
          <a href="/portfolio">
            <span>Портфолио</span>
          </a>
          <a href="/pricing">
            <span>Цены</span>
          </a>
          <a href="/about">
            <span>О нас</span>
          </a>
          <a href="/contacts">
            <span>Контакты</span>
          </a>
        </nav>
        <div className="header-actions">
          <ThemePicker />
          <button className="login-link" aria-label={user ? `Личный кабинет: ${user.name}` : "Личный кабинет"} onClick={openLogin}>
            <LockKeyhole size={15} aria-hidden="true"/><span className="login-label">{user ? user.name : "Личный кабинет"}</span>
          </button>
          <button className="btn small dark" onClick={() => order()}>
            <ArrowUpRight size={15} /> Обсудить проект
          </button>
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
      {!knownRoute ? <React.Suspense fallback={<main id="main" className="catalog-page">Страница не найдена</main>}><NotFound /></React.Suspense> : (location.pathname === "/admin" && user && user.role!=="admin") ? <main className="catalog-page" id="main"><h1>Доступ только для команды</h1><a className="catalog-home-link" href="/account">Открыть свой кабинет →</a></main> : (location.pathname === "/portfolio" || location.pathname.startsWith("/portfolio/")) ? <React.Suspense fallback={<main id="main" className="catalog-page" role="status">Загружаем портфолио…</main>}><PortfolioPage order={order} contacts={content.contacts} /></React.Suspense> : location.pathname === "/about" ? <React.Suspense fallback={<main id="main" className="catalog-page" role="status">Загружаем страницу…</main>}><AboutPage contacts={content.contacts} /></React.Suspense> : location.pathname === "/contacts" ? <React.Suspense fallback={<main id="main" className="catalog-page" role="status">Загружаем контакты…</main>}><ContactsPage contacts={content.contacts} order={order} /></React.Suspense> : location.pathname === "/faq" ? <React.Suspense fallback={<main id="main" className="catalog-page" role="status">Загружаем вопросы…</main>}><FaqPage /></React.Suspense> : location.pathname === "/brief" ? <React.Suspense fallback={<main id="main" className="catalog-page" role="status">Загружаем бриф…</main>}><BriefWizard user={user} /></React.Suspense> : location.pathname === "/calculator" ? <React.Suspense fallback={<main id="main" className="catalog-page" role="status">Загружаем параметры проекта…</main>}><ProjectCalculator prices={content.prices} contacts={content.contacts} /></React.Suspense> : location.pathname === "/pricing" ? <React.Suspense fallback={<main id="main" className="catalog-page" role="status">Загружаем страницу стоимости…</main>}><PricingPage order={order} prices={content.prices} contacts={content.contacts} /></React.Suspense> : catalogPath ? <React.Suspense fallback={<main id="main" className="catalog-page" role="status">Загружаем услуги…</main>}><ServiceCatalog path={location.pathname} order={order} prices={content.prices} contacts={content.contacts} /></React.Suspense> : legalPath ? <LegalPage path={legalPath} contacts={content.contacts} /> : dashboard ? (
        <React.Suspense fallback={<main id="main" className="catalog-page" role="status">Загружаем кабинет…</main>}><Dashboard
          user={user}
          content={content}
          setContent={setContent}
          order={order}
          login={() => setModal("auth")}
          logout={logout}
          notify={setToast}
        /></React.Suspense>
      ) : (
        <React.Suspense fallback={<main id="main" className="catalog-page" role="status">Загружаем главную…</main>}><HomePage content={content} openLogin={openLogin} /></React.Suspense>
      )}
      <footer className="studio-footer">
        <div className="studio-footer-main">
          <div><a href="/" aria-label="OVERTAKE — главная"><Logo/></a><p>Цифровое агентство из Пскова.</p></div>
          <nav aria-label="Разделы сайта"><strong>Агентство</strong><a href="/services">Услуги</a><a href="/portfolio">Портфолио</a><a href="/pricing">Цены</a><a href="/about">О нас</a></nav>
          <nav aria-label="Связь с агентством"><strong>Контакты</strong><a href="tel:+79517506700">+7 (951) 750-67-00</a>
            {contactTelegram(content.contacts.telegram || content.contacts.telegram2 || "") && <a href={contactTelegram(content.contacts.telegram || content.contacts.telegram2 || "")!} target="_blank" rel="noopener noreferrer">Telegram</a>}
            <a href="/contacts">Как добраться</a><a href="/faq">Вопрос — ответ</a></nav>
          <div><strong>Реквизиты</strong><p>ИП Игнатенко Илья Анатольевич<br/>ИНН 511007182150<br/>ОГРНИП 325600000016430</p></div>
        </div>
        <div className="studio-footer-legal">
          <span>© {new Date().getFullYear()} OVERTAKE</span>
          <a href="/privacy">Политика обработки персональных данных</a>
          <a href="/personal-data-consent">Согласие на обработку данных</a>
          <a href="/cookies">Файлы cookie</a>
          <button className="motion-control" aria-pressed={effectsPaused} onClick={() => setEffectsPaused(!effectsPaused)}>{effectsPaused ? "Включить анимации" : "Приостановить анимации"}</button>
        </div>
      </footer>
      <div className="notice-dock">
        <CookiePreferences/>
        {!dashboard && !modal && ["/", "/services", "/pricing", "/calculator"].includes(location.pathname) && <PriceMatch onDiscuss={discussPrice}/>}
      </div>
      {modal && (
        <Modal
          close={() => setModal("")}
          title={
            modal === "auth"
              ? "Личный кабинет"
              : modal === "brief"
                ? "Обсудим ваш проект"
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
                location.href = "/#cabinet";
              }}
            />
          ) : modal === "brief" ? (
            <Brief
              user={user}
              service={selected}
              context={briefContext}
              onSuccess={() => {
                setModal("");
                window.dispatchEvent(new Event("overtake:leads"));
                setToast("Заявка получена. Спасибо за вашу идею!");
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
                Обсудить задачу <ArrowUpRight size={18} />
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
          Открыть проект <ArrowUpRight size={17} />
        </a>
      )}
      <button className="btn purple" onClick={order}>
        Хочу обсудить похожий проект <ArrowUpRight size={18} />
      </button>
    </div>
  );
}
function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
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
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal"
      >
        <button
          className="modal-close"
          aria-label="Закрыть окно"
          onClick={close}
        >
          <X />
        </button>
        <span className="eyebrow muted">OVERTAKE / НАЧНЁМ С ГЛАВНОГО</span>
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </div>
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
function Brief({
  user,
  service,
  context = "",
  onSuccess,
}: {
  user: User | null;
  service: string;
  context?: string;
  onSuccess: () => void;
}) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const f = Object.fromEntries(new FormData(e.currentTarget));
        try {
          await api("leads", { ...f, description: context ? context + "\n\nЗадача клиента:\n" + String(f.description) : f.description, consent: !!f.consent, consentVersion: LEGAL_VERSION });
          onSuccess();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="muted">Не нужно готовое ТЗ. Начнём с вашей идеи.</p>
      {context && <div className="pricing-brief-context"><b>Вы выбрали</b><p>{context}</p></div>}
      <div className="form-grid">
        <label>
          Как вас зовут
          <input
            name="name"
            defaultValue={user?.name}
            placeholder="Ваше имя"
            required
            maxLength={80}
          />
        </label>
        <label>
          Почта или Telegram
          <input
            name="contact"
            defaultValue={user?.email}
            placeholder="mail@example.ru или @username"
            required
            maxLength={200}
          />
        </label>
      </div>
      <label>
        Что нужно сделать
        <select name="service" defaultValue={service}>
          {!services.some(s => s.name === service) && <option value={service}>{service}</option>}
          {services.map((s) => (
            <option key={s.name}>{s.name}</option>
          ))}
        </select>
      </label>
      <label>
        Расскажите о задаче
        <textarea
          name="description"
          placeholder="Что хотите создать и какую задачу это должно решить?"
          required
          minLength={10}
          maxLength={context ? 4000 : 5000}
          rows={4}
        />
      </label>
      <ConsentLabel purpose="для ответа на обращение и обсуждения проекта" />
      {!user && (
        <p className="form-note">
          Для отслеживания проекта в кабинете войдите до отправки заявки. Без
          входа заявка будет доступна только команде.
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="btn purple full" disabled={busy}>
        {busy ? "Отправляем…" : "Отправить заявку"}
        <ArrowUpRight size={18} />
      </button>
      <p className="form-note">Отправка заявки ни к чему вас не обязывает.</p>
    </form>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LoadBoundary><App /></LoadBoundary>
  </React.StrictMode>,
);
