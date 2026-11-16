import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig, useReducedMotion, motion } from "motion/react";
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
import { BlurFade } from "./components/magicui/blur-fade";
import { BorderBeam } from "./components/magicui/border-beam";
import "./style.css";
type User = { id: string; name: string; email: string; role: string };
type Project = {
  title: string;
  category: string;
  description: string;
  url?: string;
  image?: string;
};
type Content = {
  projects: Project[];
  prices: Record<string, string>;
  contacts: Record<string, string>;
};
type Lead = {
  id: string;
  name: string;
  contact: string;
  service: string;
  description: string;
  status: string;
  price: number;
  due: string;
  created: string;
};
const services = [
  {
    name: "Сайты и интернет-магазины",
    short: "Сайты",
    text: "От первого впечатления до первого заказа. Быстрые сайты, которые раскрывают ваш бренд и помогают продавать.",
    icon: Globe,
    tags: ["Лендинги", "Корпоративные сайты", "E-commerce"],
  },
  {
    name: "Telegram-боты",
    short: "Telegram-боты",
    text: "Запись, продажи и поддержка — прямо в мессенджере. Освобождаем команду от повторяющихся задач.",
    icon: Send,
    tags: ["Продажи", "Поддержка", "Интеграции"],
  },
  {
    name: "CRM и автоматизация",
    short: "CRM-системы",
    text: "Клиенты, сделки и процессы в одной системе. Разрабатываем инструменты под логику вашего бизнеса.",
    icon: Workflow,
    tags: ["CRM", "API", "Бизнес-процессы"],
  },
  {
    name: "Веб-приложения",
    short: "Веб-приложения",
    text: "Ваша идея в работающем продукте. Личные кабинеты, сервисы и платформы с возможностью развития.",
    icon: Layers,
    tags: ["SaaS", "Платформы", "Кабинеты"],
  },
  {
    name: "Социальные сети",
    short: "Соцсети",
    text: "Помогаем бренду говорить своим голосом. Контент, оформление и регулярное ведение социальных сетей.",
    icon: MessageSquare,
    tags: ["Контент", "Дизайн", "SMM"],
  },
  {
    name: "Разработка под задачу",
    short: "Другое",
    text: "Не нашли подходящую категорию? Обсудим вашу задачу и подберём решение, которое имеет смысл.",
    icon: Code2,
    tags: ["Индивидуальные решения", "Поддержка"],
  },
];
const statuses = [
  "Заявка получена",
  "Обсуждение",
  "Подготовка предложения",
  "Согласование договора",
  "В работе",
  "На проверке",
  "Завершён",
  "На сопровождении",
];
const money = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
async function api(path: string, body?: unknown, method?: string) {
  const r = await fetch("/api/" + path, {
    method: method || (body ? "POST" : "GET"),
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Не удалось выполнить запрос");
  return j;
}
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
function App() {
  const [user, setUser] = useState<User | null>(null),
    [content, setContent] = useState<Content>({
      projects: [],
      prices: {},
      contacts: {},
    }),
    [route, setRoute] = useState(location.hash || "#home"),
    [modal, setModal] = useState(""),
    [selected, setSelected] = useState(services[0].name),
    [menu, setMenu] = useState(false),
    [toast, setToast] = useState("");
  useEffect(() => {
    api("me")
      .then((j) => setUser(j.user))
      .catch(() => {});
    api("content")
      .then(setContent)
      .catch(() => {});
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
  const order = (service = services[0].name) => {
    setSelected(service);
    setModal("brief");
  };
  const openLogin = () =>
    user ? (location.hash = "#cabinet") : setModal("auth");
  const logout = async () => {
    await api("logout", {});
    setUser(null);
    location.hash = "#home";
  };
  const dashboard = route.startsWith("#cabinet");
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip" href="#main">
        Перейти к содержимому
      </a>
      <header className="header">
        <a href="#home" aria-label="OVERTAKE — главная">
          <Logo />
        </a>
        <nav className={menu ? "nav open" : "nav"} aria-label="Главное меню">
          <a href="#services">Услуги</a>
          <a href="#work">Проекты</a>
          <a href="#approach">Подход</a>
          <a href="#about">О нас</a>
          <a href="#contacts">Контакты</a>
        </nav>
        <div className="header-actions">
          <button className="login-link" onClick={openLogin}>
            {user ? user.name : "Личный кабинет"} <ArrowUpRight size={14} />
          </button>
          <button className="btn small dark" onClick={() => order()}>
            Обсудить проект <ArrowUpRight size={15} />
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
      {dashboard ? (
        <Dashboard
          user={user}
          content={content}
          setContent={setContent}
          order={order}
          login={() => setModal("auth")}
          logout={logout}
          notify={setToast}
        />
      ) : (
        <main id="main">
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
                    Ваш бизнес.
                    <br />
                    На шаг
                    <br />
                    <span className="gradient-text">впереди.</span>
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
                    <a className="text-link" href="#work">
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
              <HeroArt />
            </div>
            <div className="hero-bottom">
              <span>Технологии, которые работают на вас.</span>
              <a href="#services">
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
          <section className="section" id="services">
            <Reveal>
              <div className="section-title">
                <div>
                  <span className="eyebrow muted">01 / ЧТО МЫ ДЕЛАЕМ</span>
                  <h2>
                    Идея ваша.
                    <br />
                    <span className="muted">Решение — наше.</span>
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
                    className="service-card"
                    onClick={() => {
                      setSelected(s.name);
                      setModal("service");
                    }}
                  >
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
          </section>
          <section className="work-section section" id="work">
            <Reveal>
              <div className="section-title">
                <div>
                  <span className="eyebrow muted">02 / НАШИ ВОЗМОЖНОСТИ</span>
                  <h2>
                    Меньше слов.
                    <br />
                    <span className="muted">Больше продукта.</span>
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
            <Portfolio
              projects={content.projects}
              onSelect={(p) => {
                setSelected(JSON.stringify(p));
                setModal("case");
              }}
            />
            <p className="section-note">
              Концепты иллюстрируют направления работы. Реальные клиентские
              кейсы появятся после согласования публикации.
            </p>
          </section>
          <section className="cabinet-promo section">
            <Reveal className="cabinet-promo-copy">
              <span className="eyebrow">ВСЁ ПОД КОНТРОЛЕМ</span>
              <h2>
                Ваш проект.
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
                  <span className="eyebrow muted">03 / КАК МЫ РАБОТАЕМ</span>
                  <h2>
                    От «есть идея»
                    <br />
                    <span className="muted">до «всё работает».</span>
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
              <span className="eyebrow muted">04 / КТО ЗА ЭТИМ СТОИТ</span>
              <div className="about-layout">
                <h2>
                  Два основателя.
                  <br />
                  Один подход:
                  <br />
                  <span className="gradient-text">делать с толком.</span>
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
            <div>
              <span className="eyebrow muted">ПОЛЕЗНО ЗНАТЬ</span>
              <h2>
                Хорошие <br />
                вопросы.
              </h2>
            </div>
            <div className="faq-list">
              {[
                {
                  q: "Сколько стоит разработка?",
                  a: "Стоимость зависит от объёма, функций и интеграций. Расскажите о задаче — подготовим индивидуальное предложение. Итоговую сумму согласуем до начала работы.",
                },
                {
                  q: "Можно прийти только с идеей?",
                  a: "Да. Необязательно иметь готовое техническое задание. Поможем определить главное, выбрать формат продукта и составить план запуска.",
                },
                {
                  q: "Как мы будем заключать договор?",
                  a: "Работаем через ИП. Состав работ, сроки, стоимость и порядок оплаты фиксируются в договоре до старта проекта. Реквизиты предоставляются при согласовании.",
                },
                {
                  q: "Вы поддерживаете проекты после запуска?",
                  a: "Да, формат поддержки и развития обсуждается отдельно. Можем продолжить развитие продукта и сопровождать его в рамках согласованных условий.",
                },
                {
                  q: "Можно встретиться лично?",
                  a: content.contacts.address
                    ? "Да. Адрес офиса: " +
                      content.contacts.address +
                      ". Оставьте заявку, чтобы согласовать время встречи."
                    : "Планируем очные встречи в офисе. Адрес и график будут опубликованы после открытия. Пока можно оставить заявку на обсуждение проекта.",
                },
              ].map((f) => (
                <details key={f.q}>
                  <summary>
                    {f.q}
                    <Plus size={20} />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
          <section className="contact-section section" id="contacts">
            <Reveal>
              <span className="eyebrow">СЛЕДУЮЩИЙ ХОД — ЗА ВАМИ</span>
              <h2>
                Давайте сделаем
                <br />
                <span>что-то значимое.</span>
                <ArrowUpRight />
              </h2>
              <div className="contact-bottom">
                <p>
                  Расскажите о вашей идее.
                  <br />
                  Вместе найдём способ воплотить её в жизнь.
                </p>
                <button className="btn white" onClick={() => order()}>
                  Обсудить проект <ArrowUpRight size={20} />
                </button>
              </div>
              {content.contacts.email && (
                <a
                  className="contact-email"
                  href={"mailto:" + content.contacts.email}
                >
                  {content.contacts.email}
                </a>
              )}
              {content.contacts.address && <p>{content.contacts.address}</p>}
            </Reveal>
          </section>
        </main>
      )}
      <footer className="footer">
        <div className="footer-top">
          <a href="#home">
            <Logo />
          </a>
          <p>Помогаем бизнесу быть впереди.</p>
          <a href="#contacts">
            Начнём с разговора <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} OVERTAKE · Digital agency</span>
          <button onClick={() => setModal("privacy")}>
            Политика конфиденциальности
          </button>
          <button onClick={() => setModal("legal")}>
            Реквизиты и документы
          </button>
          <a href="#home">Наверх ↑</a>
        </div>
      </footer>
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
                location.hash = "#cabinet";
              }}
            />
          ) : modal === "brief" ? (
            <Brief
              user={user}
              service={selected}
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
function HeroArt() {
  const reduced = useReducedMotion();
  return (
    <div className="hero-art" aria-label="Цифровая экосистема OVERTAKE">
      <div className="art-grid" />
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit orbit-three" />
      <div className="art-cross cross-one">+</div>
      <div className="art-cross cross-two">+</div>
      <motion.div
        className="sculpture"
        animate={reduced ? {} : { y: [0, -13, 0], rotateZ: [-13, -9, -13] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="sculpture-shadow" />
        <div className="metal-ring ring-back" />
        <div className="metal-ring ring-front" />
        <div className="ring-gloss" />
      </motion.div>
      <div className="float-label label-top">
        <span className="code-icon">
          <Code2 size={17} />
        </span>{" "}
        Идея становится продуктом <span className="live-dot" />
      </div>
      <div className="float-label label-bottom">
        <span className="small-orb" />
        <div>
          <b>Ваш следующий уровень</b>
          <span>Ближе, чем кажется</span>
        </div>
        <ArrowUpRight size={22} />
        {!reduced && (
          <BorderBeam
            colorFrom="#8b5cf6"
            colorTo="#38bdf8"
            size={70}
            duration={9}
          />
        )}
      </div>
      <span className="art-caption">BUILT TO MOVE YOU FORWARD.</span>
    </div>
  );
}
const concepts: Project[] = [
  {
    title: "Forma",
    category: "Сайты",
    description:
      "Концепция интернет-магазина предметов интерьера. Спокойный дизайн, каталог и короткий путь к покупке.",
  },
  {
    title: "Flow CRM",
    category: "CRM-системы",
    description:
      "Концепция рабочего пространства для команды: сделки, клиенты и задачи без лишних переключений.",
  },
  {
    title: "Pulse Bot",
    category: "Telegram-боты",
    description:
      "Концепция Telegram-бота для записи: выбор услуги, удобного времени и подтверждение визита.",
  },
];
function ProjectVisual({ index = 0 }: { index?: number }) {
  return index % 3 === 0 ? (
    <div className="mock-store">
      <div className="mock-nav">
        <b>forma.</b>
        <span>Коллекция　 О бренде　 ☰</span>
      </div>
      <div className="mock-store-body">
        <div>
          <span>ЖИТЬ В СВОЁМ РИТМЕ</span>
          <h4>
            Пространство
            <br />
            для жизни.
          </h4>
          <small>
            Предметы с характером.
            <br />
            Для дома с историей.
          </small>
          <span className="mock-shop-button">Смотреть коллекцию ↗</span>
        </div>
        <div className="lamp">
          <i />
          <b />
          <span />
        </div>
      </div>
    </div>
  ) : index % 3 === 1 ? (
    <div className="mock-crm">
      <div className="mock-sidebar">
        <b>f /</b>
        <span>Обзор</span>
        <span>Сделки</span>
        <span>Контакты</span>
        <span>Задачи</span>
      </div>
      <div className="mock-crm-body">
        <div className="mock-crm-title">
          Обзор <span>Этот месяц ⌄</span>
        </div>
        <div className="mock-stats">
          <div>
            Выручка<b>1 280 000 ₽</b>
            <small>↑ 18,6%</small>
          </div>
          <div>
            Новые сделки<b>24</b>
            <small>↑ 12,4%</small>
          </div>
        </div>
        <div className="chart-label">Динамика продаж</div>
        <div className="bar-chart">
          {[30, 45, 37, 60, 48, 70, 65, 83, 72, 90, 79, 100].map((h, i) => (
            <i key={i} style={{ height: h + "%" }} />
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div className="mock-bot">
      <div className="phone">
        <div className="phone-notch" />
        <div className="phone-title">
          <span>p</span>
          <b>
            Pulse Bot<small>бот</small>
          </b>
          <i>⋮</i>
        </div>
        <div className="chat-bubble">
          Привет! Давайте найдём
          <br />
          время для вашей записи 👋
        </div>
        <div className="chat-bubble right">Хочу записаться</div>
        <div className="chat-bubble">Отлично! Выберите услугу:</div>
        <div className="chat-buttons">
          <span>Консультация　↗</span>
          <span>Первая встреча　↗</span>
          <span>Мои записи　↗</span>
        </div>
      </div>
      <span className="bot-caption">
        <Send size={17} /> Всегда на связи.
      </span>
    </div>
  );
}
function Portfolio({
  projects,
  onSelect,
}: {
  projects: Project[];
  onSelect: (p: Project) => void;
}) {
  const [filter, setFilter] = useState("Все");
  const list = projects.length ? projects : concepts;
  const cats = ["Все", ...new Set(list.map((p) => p.category))];
  return (
    <>
      <div className="filters" aria-label="Категории проектов">
        {cats.map((c) => (
          <button
            key={c}
            className={filter === c ? "active" : ""}
            onClick={() => setFilter(c)}
          >
            {c}
            {c === "Все" && (
              <span>{list.length.toString().padStart(2, "0")}</span>
            )}
          </button>
        ))}
      </div>
      <div className="portfolio-grid">
        {list.map((p, i) =>
          filter !== "Все" && p.category !== filter ? null : (
            <Reveal key={p.title} delay={i * 0.05}>
              <button
                className={"project-card project-" + (i % 3)}
                onClick={() => onSelect(p)}
              >
                <div className="project-image">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={"Интерфейс " + p.title}
                      loading="lazy"
                    />
                  ) : (
                    <ProjectVisual index={i} />
                  )}
                  <span className="project-open">
                    <ArrowUpRight size={22} />
                  </span>
                </div>
                <div className="project-info">
                  <h3>{p.title}</h3>
                  <span>
                    {p.category} / {projects.length ? "Проект" : "Концепт"}
                  </span>
                </div>
              </button>
            </Reveal>
          ),
        )}
      </div>
    </>
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
        Фокус решения: понятный интерфейс, удобство на мобильных устройствах и
        возможность дальнейшего развития.
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
              await api("register", { ...f, consent: !!f.consent });
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
            <label className="checkbox">
              <input type="checkbox" name="consent" required />
              Согласен на обработку данных для создания аккаунта. Сайт находится
              на этапе подготовки к запуску.
            </label>
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
  onSuccess,
}: {
  user: User | null;
  service: string;
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
          await api("leads", { ...f, consent: !!f.consent });
          onSuccess();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="muted">Не нужно готовое ТЗ. Начнём с вашей идеи.</p>
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
          maxLength={5000}
          rows={4}
        />
      </label>
      <label className="checkbox">
        <input type="checkbox" required name="consent" />
        Согласен на обработку имени, контакта и описания задачи для ответа на
        обращение.
      </label>
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
function Dashboard({
  user,
  content,
  setContent,
  order,
  login,
  logout,
  notify,
}: {
  user: User | null;
  content: Content;
  setContent: (c: Content) => void;
  order: () => void;
  login: () => void;
  logout: () => void;
  notify: (s: string) => void;
}) {
  const [tab, setTab] = useState("overview"),
    [leads, setLeads] = useState<Lead[]>([]),
    [selected, setSelected] = useState<Lead | null>(null),
    [error, setError] = useState("");
  const refresh = () =>
    api("leads")
      .then((j) => {
        setLeads(j.leads);
        setSelected((old) =>
          old ? j.leads.find((l: Lead) => l.id === old.id) || null : null,
        );
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    if (user) refresh();
    const update = () => {
      if (user) refresh();
    };
    window.addEventListener("overtake:leads", update);
    return () => window.removeEventListener("overtake:leads", update);
  }, [user, tab]);
  const admin = user?.role === "admin";
  if (!user)
    return (
      <main className="cabinet-login">
        <LockKeyhole size={36} />
        <h1>Ваше рабочее пространство</h1>
        <p>Войдите, чтобы видеть свои проекты и общаться с командой.</p>
        <button className="btn purple" onClick={login}>
          Войти в кабинет <ArrowRight size={18} />
        </button>
      </main>
    );
  const tabs = [
    { id: "overview", label: "Обзор", icon: LayoutDashboard },
    {
      id: "projects",
      label: admin ? "Заявки и проекты" : "Мои проекты",
      icon: FolderOpen,
    },
    { id: "documents", label: "Документы", icon: FileText },
    ...(admin
      ? [
          { id: "calculator", label: "Калькулятор", icon: Calculator },
          { id: "content", label: "Управление сайтом", icon: Settings },
        ]
      : []),
    { id: "profile", label: "Профиль", icon: Users },
  ];
  return (
    <main className="dashboard" id="main">
      <aside className="dashboard-sidebar">
        <span className="eyebrow muted">
          {admin ? "ПРОСТРАНСТВО КОМАНДЫ" : "ЛИЧНЫЙ КАБИНЕТ"}
        </span>
        <nav>
          {tabs.map((t) => (
            <button
              className={tab === t.id ? "active" : ""}
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setSelected(null);
              }}
            >
              <t.icon size={18} />
              {t.label}
            </button>
          ))}
        </nav>
        <button className="logout" onClick={logout}>
          <LogOut size={17} /> Выйти
        </button>
      </aside>
      <div className="dashboard-main">
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow muted">
              OVERTAKE / {admin ? "КОМАНДА" : "КАБИНЕТ"}
            </span>
            <h1>
              {tab === "overview"
                ? `Здравствуйте, ${user.name}.`
                : tabs.find((t) => t.id === tab)?.label}
            </h1>
            <p className="muted">Ваш следующий большой шаг начинается здесь.</p>
          </div>
          <button className="btn purple" onClick={order}>
            Новая заявка <Plus size={17} />
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {tab === "overview" && (
          <>
            <div className="dashboard-stats">
              <div>
                <FolderOpen size={20} />
                <span>Всего проектов</span>
                <b>{leads.length}</b>
              </div>
              <div>
                <Clock size={20} />
                <span>В работе</span>
                <b>
                  {
                    leads.filter(
                      (l) =>
                        !["Завершён", "Заявка получена"].includes(l.status),
                    ).length
                  }
                </b>
              </div>
              <div>
                <CheckCircle2 size={20} />
                <span>Завершено</span>
                <b>{leads.filter((l) => l.status === "Завершён").length}</b>
              </div>
            </div>
            <h3>Последние проекты</h3>
          </>
        )}
        {["overview", "projects"].includes(tab) &&
          (selected ? (
            <ProjectPanel
              lead={selected}
              admin={admin}
              back={() => setSelected(null)}
              refresh={refresh}
            />
          ) : leads.length ? (
            <div className="lead-list">
              {leads.map((l) => (
                <button
                  className="lead-row"
                  key={l.id}
                  onClick={() => setSelected(l)}
                >
                  <span className="lead-icon">
                    <Layers size={22} />
                  </span>
                  <span>
                    <b>{l.service}</b>
                    <small>
                      {admin
                        ? l.name
                        : new Date(l.created).toLocaleDateString("ru-RU")}
                    </small>
                  </span>
                  <span className="tag-purple">{l.status}</span>
                  <span>{l.price ? money(l.price) : "Оценка готовится"}</span>
                  <ArrowUpRight size={19} />
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FolderOpen size={36} />
              <h3>Здесь начнётся ваша история</h3>
              <p>
                Отправьте первую заявку. Её статус и обсуждение появятся здесь.
              </p>
              <button className="btn dark" onClick={order}>
                Обсудить проект <ArrowUpRight size={17} />
              </button>
            </div>
          ))}
        {tab === "documents" && (
          <div className="empty-state">
            <FileText size={36} />
            <h3>Документы по проектам</h3>
            <p>
              Раздел подготовлен для договоров, счетов и актов.
              <br />
              Загрузка файлов и электронное подписание пока не подключены.
              <br />
              Документы согласуются с командой отдельно.
            </p>
          </div>
        )}
        {tab === "calculator" && admin && <Estimate notify={notify} />}{" "}
        {tab === "content" && admin && (
          <ContentEditor
            content={content}
            save={(c) => {
              setContent(c);
              notify("Содержимое сайта сохранено");
            }}
          />
        )}
        {tab === "profile" && (
          <form
            className="profile-form"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api(
                  "profile",
                  Object.fromEntries(new FormData(e.currentTarget)),
                  "PUT",
                );
                notify(
                  "Имя сохранено. Обновите страницу, чтобы увидеть изменения в приветствии.",
                );
              } catch (e) {
                notify((e as Error).message);
              }
            }}
          >
            <label>
              Имя
              <input name="name" required defaultValue={user.name} />
            </label>
            <label>
              Электронная почта
              <input value={user.email} readOnly />
            </label>
            <p className="muted">Роль: {admin ? "администратор" : "клиент"}</p>
            <button className="btn purple">
              Сохранить изменения <Check size={17} />
            </button>
            {!admin && (
              <details className="setup-details">
                <summary>
                  Настройка агентства <ChevronDown size={16} />
                </summary>
                <p className="muted">
                  Только для основателей. Используйте одноразовый ключ
                  настройки.
                </p>
                <input
                  id="admin-key"
                  aria-label="Ключ настройки"
                  type="password"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="btn dark"
                  onClick={async () => {
                    try {
                      await api("admin/claim", {
                        key: (
                          document.getElementById(
                            "admin-key",
                          ) as HTMLInputElement
                        ).value,
                      });
                      location.reload();
                    } catch (e) {
                      notify((e as Error).message);
                    }
                  }}
                >
                  Активировать кабинет команды
                </button>
              </details>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
function ProjectPanel({
  lead,
  admin,
  back,
  refresh,
}: {
  lead: Lead;
  admin: boolean;
  back: () => void;
  refresh: () => void;
}) {
  const [messages, setMessages] = useState<
      {
        id: string;
        name: string;
        text: string;
        created: string;
        role: string;
      }[]
    >([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const load = () =>
    api("leads/" + lead.id + "/messages")
      .then((j) => setMessages(j.messages))
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, [lead.id]);
  return (
    <div className="project-panel">
      <button className="text-link" onClick={back}>
        ← Все проекты
      </button>
      <div className="panel-title">
        <h2>{lead.service}</h2>
        <span className="tag-purple">{lead.status}</span>
      </div>
      <p className="project-description">{lead.description}</p>
      <div className="project-facts">
        <span>
          Стоимость<b>{lead.price ? money(lead.price) : "После обсуждения"}</b>
        </span>
        <span>
          Срок<b>{lead.due || "На согласовании"}</b>
        </span>
        {admin && (
          <span>
            Контакт<b>{lead.contact}</b>
          </span>
        )}
      </div>
      {admin && (
        <form
          className="admin-project-form"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const f = Object.fromEntries(new FormData(e.currentTarget));
              await api(
                "leads/" + lead.id,
                { ...f, price: Number(f.price) },
                "PATCH",
              );
              refresh();
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <label>
            Статус
            <select name="status" defaultValue={lead.status}>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Согласованная стоимость, ₽
            <input
              type="number"
              min="0"
              step="1"
              name="price"
              defaultValue={lead.price}
            />
          </label>
          <label>
            Согласованный срок
            <input
              name="due"
              defaultValue={lead.due}
              placeholder="Например, 20 декабря"
            />
          </label>
          <button className="btn dark">Сохранить</button>
        </form>
      )}
      <h3>Обсуждение проекта</h3>
      <div className="messages">
        {messages.length ? (
          messages.map((m) => (
            <div
              className={"message " + (m.role === "admin" ? "team" : "")}
              key={m.id}
            >
              <b>
                {m.name} {m.role === "admin" && <small>· Команда</small>}
              </b>
              <p>{m.text}</p>
              <time>{new Date(m.created).toLocaleString("ru-RU")}</time>
            </div>
          ))
        ) : (
          <p className="muted">
            Сообщений пока нет. Здесь можно уточнить детали проекта.
          </p>
        )}
      </div>
      <form
        className="message-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          setBusy(true);
          try {
            await api(
              "leads/" + lead.id + "/messages",
              Object.fromEntries(new FormData(form)),
            );
            form.reset();
            await load();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Сообщение
          <textarea
            name="text"
            required
            maxLength={3000}
            rows={3}
            placeholder="Напишите команде…"
          />
        </label>
        <button className="btn purple" disabled={busy}>
          Отправить <Send size={17} />
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
function Estimate({ notify }: { notify: (s: string) => void }) {
  const [hours, setHours] = useState(40),
    [rate, setRate] = useState(2000),
    [factor, setFactor] = useState(1),
    [costs, setCosts] = useState(0),
    [margin, setMargin] = useState(25),
    [discount, setDiscount] = useState(0),
    [title, setTitle] = useState("Новый проект"),
    [saved, setSaved] = useState<
      { id: string; title: string; total: number }[]
    >([]);
  const total = Math.max(
    0,
    Math.round(
      (hours * rate * factor + costs) *
        (1 + margin / 100) *
        (1 - discount / 100),
    ),
  );
  const load = () => api("estimates").then((j) => setSaved(j.estimates));
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="estimate">
      <p className="notice">
        <LockKeyhole size={17} /> Внутренний инструмент. Клиенты не видят
        расчёты и себестоимость.
      </p>
      <div className="estimate-grid">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api("estimates", {
                title,
                total,
                data: { hours, rate, factor, costs, margin, discount },
              });
              notify("Расчёт сохранён");
              load();
            } catch (e) {
              notify((e as Error).message);
            }
          }}
        >
          <label>
            Название проекта
            <input
              value={title}
              required
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <div className="form-grid">
            {[
              { name: "Трудозатраты, часов", v: hours, set: setHours, min: 1 },
              { name: "Ставка, ₽ / час", v: rate, set: setRate, min: 0 },
              {
                name: "Сложность / срочность",
                v: factor,
                set: setFactor,
                min: 1,
                step: 0.1,
              },
              { name: "Внешние расходы, ₽", v: costs, set: setCosts, min: 0 },
              { name: "Наценка, %", v: margin, set: setMargin, min: 0 },
              {
                name: "Скидка, %",
                v: discount,
                set: setDiscount,
                min: 0,
                max: 100,
              },
            ].map((f) => (
              <label key={f.name}>
                {f.name}
                <input
                  type="number"
                  value={f.v}
                  min={f.min}
                  max={f.max}
                  step={f.step || 1}
                  required
                  onChange={(e) => f.set(Number(e.target.value))}
                />
              </label>
            ))}
          </div>
          <button className="btn purple">
            Сохранить расчёт <Check size={17} />
          </button>
        </form>
        <div className="estimate-result">
          <span className="eyebrow muted">ИТОГОВАЯ СТОИМОСТЬ</span>
          <h2>{money(total)}</h2>
          <p>Затраты: {money(hours * rate * factor + costs)}</p>
          <p className="muted">
            Расчёт предварительный. Стоимость для клиента фиксируется после
            согласования.
          </p>
          <button
            className="btn dark"
            onClick={() => {
              const text = `OVERTAKE — коммерческое предложение\n${title}\nПредварительная стоимость: ${money(total)}\nСостав работ и сроки согласуются отдельно.\n`;
              const u = URL.createObjectURL(
                new Blob([text], { type: "text/plain;charset=utf-8" }),
              );
              const a = document.createElement("a");
              a.href = u;
              a.download = "OVERTAKE-предложение.txt";
              a.click();
              setTimeout(() => URL.revokeObjectURL(u), 1000);
            }}
          >
            <Download size={17} /> Скачать предложение
          </button>
        </div>
      </div>
      <h3>Сохранённые расчёты</h3>
      {saved.map((s) => (
        <div className="saved-estimate" key={s.id}>
          <span>{s.title}</span>
          <b>{money(s.total)}</b>
        </div>
      ))}
    </div>
  );
}
function ContentEditor({
  content,
  save,
}: {
  content: Content;
  save: (c: Content) => void;
}) {
  const [draft, setDraft] = useState<Content>(structuredClone(content)),
    [error, setError] = useState("");
  return (
    <form
      className="content-editor"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await api("content", draft, "PUT");
          save(draft);
        } catch (e) {
          setError((e as Error).message);
        }
      }}
    >
      <h3>Контакты и реквизиты</h3>
      <div className="form-grid">
        {[
          ["email", "Электронная почта"],
          ["address", "Адрес офиса"],
          ["legal", "Реквизиты ИП"],
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              value={draft.contacts[key] || ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  contacts: { ...draft.contacts, [key]: e.target.value },
                })
              }
            />
          </label>
        ))}
      </div>
      <h3>Публичные цены</h3>
      <p className="muted">
        Оставьте поле пустым, чтобы показать «Стоимость после обсуждения».
      </p>
      <div className="form-grid">
        {services.map((s) => (
          <label key={s.name}>
            {s.name}
            <input
              value={draft.prices[s.name] || ""}
              placeholder="Например, от 80 000 ₽"
              onChange={(e) =>
                setDraft({
                  ...draft,
                  prices: { ...draft.prices, [s.name]: e.target.value },
                })
              }
            />
          </label>
        ))}
      </div>
      <h3>Реальные проекты</h3>
      <p className="muted">
        После добавления работ они заменят демонстрационные концепты. Публикуйте
        только согласованные материалы.
      </p>
      {draft.projects.map((p, i) => (
        <div className="editor-project" key={i}>
          {(["title", "category", "description", "url", "image"] as const).map(
            (key, k) => (
              <label key={key}>
                {
                  [
                    "Название",
                    "Категория",
                    "Описание",
                    "Ссылка (https://)",
                    "Изображение (https://)",
                  ][k]
                }
                <input
                  value={p[key] || ""}
                  required={k < 3}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      projects: draft.projects.map((v, j) =>
                        i === j ? { ...v, [key]: e.target.value } : v,
                      ),
                    })
                  }
                />
              </label>
            ),
          )}
          <button
            type="button"
            className="text-link"
            onClick={() =>
              setDraft({
                ...draft,
                projects: draft.projects.filter((_, j) => i !== j),
              })
            }
          >
            Удалить проект <X size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn light"
        onClick={() =>
          setDraft({
            ...draft,
            projects: [
              ...draft.projects,
              { title: "", category: "Сайты", description: "" },
            ],
          })
        }
      >
        Добавить проект <Plus size={17} />
      </button>
      {error && <p className="error">{error}</p>}
      <button className="btn purple">
        Сохранить содержимое <Check size={17} />
      </button>
    </form>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
