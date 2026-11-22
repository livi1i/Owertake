import {useEffect,useLayoutEffect,useRef,useState,type FormEvent,type ReactNode} from 'react';
import {CheckCircle2,ClipboardList,MessageSquare,Send,Phone} from 'lucide-react';
import {api} from '../lib/app-shared';
import {contactEmail,contactTelegram} from '../lib/contact-links';
import {ConsentLabel,LEGAL_VERSION} from './legal-pages';
import {StudioSelect} from './studio-select';

const projectTypes = ['Лендинг','Корпоративный сайт','Интернет-магазин','Telegram-бот','CRM и автоматизация','Редизайн и доработки','Хостинг и домены','Индивидуальная задача'];
const budgets = ['Нужна оценка','До 30 000 ₽','30 000–70 000 ₽','70 000–150 000 ₽','150 000–300 000 ₽','От 300 000 ₽','Бюджет не ограничен'];
const methods = ['Телефон','Почта','Telegram','ВКонтакте'] as const;
type Method = typeof methods[number];
export type LeadPrefill = {service:string;description:string};
export const LEAD_HANDOFF_KEY = 'overtake:lead-handoff';

function validContact(method:Method,value:string) {
  if (method === 'Телефон') return /^[+()\d .-]+$/.test(value) && /^(?:\d{10,15})$/.test(value.replace(/\D/g,''));
  if (method === 'Почта') return !!contactEmail(value);
  if (method === 'Telegram') return !!contactTelegram(value.startsWith('t.me/') ? 'https://'+value : value);
  return /^(?:(?:https:\/\/)?(?:m\.)?vk\.com\/|@)?[a-z\d_.-]{2,80}\/?$/i.test(value);
}

export function LeadSection({contacts={},prefill,heading='Обсудим ваш проект',introExtra}:{
  contacts?:Record<string,string>;prefill?:LeadPrefill;heading?:string;introExtra?:ReactNode;
}) {
  const [method,setMethod] = useState<Method>('Телефон');
  const [service,setService] = useState('');
  const [budget,setBudget] = useState(budgets[0]);
  const [description,setDescription] = useState('');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [result,setResult] = useState('');
  const sending = useRef(false);
  const lastPrefill = useRef('');
  const status = useRef<HTMLDivElement>(null);
  const telegram = [contacts.telegram,contacts.telegram2].find(value => value && contactTelegram(value));

  useLayoutEffect(() => {
    if (!prefill) return;
    setService(prefill.service);
    const previous = lastPrefill.current;
    setDescription(current => {
      const remainder = previous && current.startsWith(previous) ? current.slice(previous.length).trimStart() : current;
      return [prefill.description,remainder].filter(Boolean).join('\n\n').slice(0,4400);
    });
    lastPrefill.current = prefill.description;
  },[prefill]);

  useEffect(() => { if (result) status.current?.focus(); },[result]);

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    setError('');
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '').trim();
    const contact = String(data.get('contact') || '').trim();
    if (!name || !validContact(method,contact)) {
      setError('Проверьте имя и контакт для выбранного способа связи.');
      return;
    }
    if (!service) {
      setError('Выберите услугу или индивидуальную задачу.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Опишите задачу хотя бы в нескольких словах.');
      return;
    }
    sending.current = true;
    setBusy(true);
    try {
      const payload = `Способ связи: ${method}\nБюджет: ${String(data.get('budget'))}\n\n${description.trim()}`;
      const response = await api('leads',{name,contact,service,description:payload,consent:data.has('consent'),consentVersion:LEGAL_VERSION});
      setResult(response.id);
      window.dispatchEvent(new Event('overtake:leads'));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не удалось отправить заявку. Попробуйте ещё раз.');
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  const selectOptions = service && !projectTypes.includes(service) ? [service,...projectTypes] : projectTypes;
  return <section className="lead-section" id="request" aria-labelledby="request-title">
    <div className="lead-intro">
      <h2 id="request-title">{heading}</h2>
      <p>Расскажите, что хотите изменить. Подберём решение и уточним, сколько займёт работа.</p>
      <ol className="lead-steps">
        <li><MessageSquare size={20}/><div><strong>Уточним задачу</strong><span>Свяжемся удобным для вас способом.</span></div></li>
        <li><ClipboardList size={20}/><div><strong>Подготовим предложение</strong><span>Опишем состав работ, стоимость и сроки.</span></div></li>
        <li><CheckCircle2 size={20}/><div><strong>Согласуем старт</strong><span>Зафиксируем договорённости и начнём работу.</span></div></li>
      </ol>
      {introExtra}
    </div>
    <div className="lead-surface">
      {result ? <div className="lead-success" ref={status} tabIndex={-1} role="status">
        <CheckCircle2 size={31}/><h3>Заявка принята</h3><p>Мы свяжемся с вами по указанному контакту.</p><small>Номер обращения {result}</small>
      </div> :
      <form className="lead-fields" onSubmit={submit}>
        <div className="lead-fields-grid">
          <label>Имя<input name="name" autoComplete="name" maxLength={80} required placeholder="Как к вам обращаться"/></label>
          <StudioSelect label="Способ связи" value={method} onChange={value => setMethod(value as Method)} groups={[{choices:methods.map(value => ({value,label:value}))}]}/>
        </div>
        <label>{method === 'Почта' ? 'Электронная почта' : method === 'Телефон' ? 'Номер телефона' : 'Логин или ссылка на профиль'}
          <input key={method} name="contact" required maxLength={160} type={method === 'Почта' ? 'email' : method === 'Телефон' ? 'tel' : 'text'}
            autoComplete={method === 'Почта' ? 'email' : method === 'Телефон' ? 'tel' : 'off'}
            placeholder={{Телефон:'+7 (___) ___-__-__',Почта:'name@example.ru',Telegram:'@имя',ВКонтакте:'vk.com/id'}[method]}/>
        </label>
        <div className="lead-fields-grid">
          <StudioSelect label="Что нужно" value={service} onChange={setService} placeholder="Выберите услугу" groups={[{choices:selectOptions.map(value => ({value,label:value}))}]}/>
          <StudioSelect label="Ориентир по бюджету" name="budget" value={budget} onChange={setBudget} groups={[{choices:budgets.map(value => ({value,label:value}))}]}/>
        </div>
        <label>Коротко о задаче<textarea name="description" rows={prefill ? 7 : 4} minLength={10} maxLength={4400} value={description}
          onChange={event => setDescription(event.target.value)} placeholder="Что должно получиться и когда это нужно?" required/></label>
        <ConsentLabel purpose="для ответа на обращение"/>
        {error && <p role="alert" className="error">{error}</p>}
        <button className="btn purple" type="submit" disabled={busy}>{busy ? 'Отправляем…' : 'Отправить заявку'}</button>
      </form>}
      <div className="lead-contact"><span>Удобнее позвонить или написать?</span><a href="tel:+79517506700"><Phone size={13}/> +7 (951) 750-67-00</a>
        {telegram && <a href={contactTelegram(telegram)!} target="_blank" rel="noopener noreferrer"><Send size={13}/> Telegram</a>}
      </div>
    </div>
  </section>;
}
