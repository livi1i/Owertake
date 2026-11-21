import React,{useState,useEffect} from "react";
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
import {api,services,statuses,money,type User,type Lead,type Content} from "../lib/app-shared";
import {defaultAgencyServices} from "../lib/services";
import {offersFor, offerPrice} from "../lib/public-prices";
const ProjectDocuments = React.lazy(() => import("./project-documents").then(m => ({default:m.ProjectDocuments})));
const ProjectMaterials = React.lazy(() => import("./project-materials").then(m => ({default:m.ProjectMaterials})));
const MaterialsHub = React.lazy(() => import("./project-materials").then(m => ({default:m.MaterialsHub})));
const CrmWorkspace = React.lazy(() => import("./crm-workspace").then(m => ({default:m.CrmWorkspace})));
const SeoEditor = React.lazy(() => import("./seo-editor").then(m => ({default:m.SeoEditor})));
const FaqEditor = React.lazy(() => import("./faq-page").then(m => ({default:m.FaqEditor})));
const ServiceEditor = React.lazy(() => import("./service-editor").then(m=>({default:m.ServiceEditor})));
export function Dashboard({
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
    { id: "materials", label: "Материалы", icon: FolderOpen },
    ...(admin
      ? [
          { id: "clients", label: "Клиенты", icon: Users },
          { id: "analytics", label: "Сводка заявок", icon: LayoutDashboard },
          { id: "calculator", label: "Калькулятор", icon: Calculator },
          { id: "content", label: "Управление сайтом", icon: Settings },
          { id: "services", label: "Каталог услуг", icon: Layers },
          { id: "faq", label: "Вопросы и ответы", icon: MessageSquare },
          { id: "seo", label: "SEO страниц", icon: Globe },
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
                ? `Здравствуйте, ${user.name}`
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
                        l.status === "В работе",
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
          ) : tab === "projects" && admin ? (<React.Suspense fallback={<p role="status">Загружаем CRM…</p>}><CrmWorkspace mode="projects" leads={leads} open={setSelected} refresh={refresh} /></React.Suspense>) : leads.length ? (
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
        {admin && (tab === "clients" || tab === "analytics") && <React.Suspense fallback={<p role="status">Загружаем CRM…</p>}><CrmWorkspace key={tab} mode={tab} leads={leads} open={l=>{setTab("projects");setSelected(l);}} refresh={refresh} /></React.Suspense>}
        {tab === "materials" && <React.Suspense fallback={<p role="status">Загружаем материалы…</p>}><MaterialsHub leads={leads} /></React.Suspense>}
        {tab === "documents" && <React.Suspense fallback={<p role="status">Загружаем документы…</p>}><ProjectDocuments admin={admin} leads={leads} /></React.Suspense>}
        {tab === "calculator" && admin && <Estimate notify={notify} />}{" "}
        {tab === "services" && admin && <React.Suspense fallback={<p role="status">Загружаем редактор…</p>}><ServiceEditor /></React.Suspense>}
        {tab === "seo" && admin && <React.Suspense fallback={<p role="status">Загружаем SEO…</p>}><SeoEditor /></React.Suspense>}
        {tab === "faq" && admin && <React.Suspense fallback={<p role="status">Загружаем редактор…</p>}><FaqEditor /></React.Suspense>}
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
      <React.Suspense fallback={<p role="status">Загружаем материалы…</p>}><ProjectMaterials key={lead.id} leadId={lead.id} /></React.Suspense>
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
    [error, setError] = useState(""), [ready, setReady] = useState(false);
  useEffect(() => { api("admin/content").then(setDraft).then(() => setReady(true)).catch(e => setError(e.message)); }, []);
  if (!ready) return <p role="status">{error || "Загружаем редактор…"}</p>;
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
          ["telegram", "Telegram — @username или https://t.me/username"],
          ["telegram2", "Второй Telegram-контакт"],
          ["officeName", "Название офиса"],
          ["address", "Адрес офиса"],
          ["hours", "Часы приёма"],
          ["legal", "Реквизиты ИП"],
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              value={draft.contacts[key] || ""}
              maxLength={1000}
              type={key === "email" ? "email" : "text"}
              placeholder="Пока не указан"
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
      <p className="muted">Укажите сумму в рублях. Пустое поле возвращает цену из исходной таблицы. Период оплаты и состав работ указаны в прайсе.</p>
      {[...defaultAgencyServices,{slug:"extra-work",name:"Дополнительные работы"}].map(service => {
        const offers = offersFor(service.slug);
        if (!offers.length) return null;
        return <details key={service.slug} className="operator-price-group">
          <summary>{service.name}</summary>
          <div className="form-grid">
            {offers.map(offer => <label key={offer.code}>
              {offer.name} · {offer.code}
              <input type="number" min="0.01" max="99999999.99" step="0.01"
                value={draft.prices[offer.code] || ""}
                placeholder={offerPrice(offer)}
                onChange={event => setDraft(previous => ({
                  ...previous,
                  prices: { ...previous.prices, [offer.code]: event.target.value },
                }))}
              />
            </label>)}
          </div>
        </details>;
      })}
      <h3>Реальные сайты и проекты</h3>
      <p className="muted">Для живого просмотра достаточно названия, описания и HTTPS-ссылки. Скриншот не обязателен; внешний сайт загружается только по нажатию посетителя. Некоторые сайты запрещают встраивание — прямая ссылка остаётся доступной.</p>
      <p className="muted">
        После подтверждения работы появятся в отдельной витрине реальных сайтов. Публикуйте
        только согласованные материалы. До отметки подтверждения проект виден только команде.
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
                    "Изображение (https://, необязательно)",
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
          {([['slug','Адрес страницы (латиница, необязательно)'],['task','Задача'],['result','Результат — только подтверждённые сведения'],['technologies','Технологии — через запятую']] as const).map(([key,label])=><label key={key}>{label}<input maxLength={key==='slug'?60:1500} pattern={key==='slug'?'[a-z0-9]+(-[a-z0-9]+)*':undefined} value={p[key]||''} onChange={e=>setDraft({...draft,projects:draft.projects.map((v,j)=>i===j?{...v,[key]:e.target.value}:v)})}/></label>)}
          <label className="checkbox"><input type="checkbox" checked={!!p.confirmed} onChange={e=>setDraft({...draft,projects:draft.projects.map((v,j)=>i===j?{...v,confirmed:e.target.checked}:v)})}/> Подтверждаю реальность проекта и согласование публикации материалов</label>
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
