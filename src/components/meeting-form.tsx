import {useEffect,useRef,useState,type FormEvent} from 'react';
import {ArrowUpRight,Building2,CheckCircle2,Users,Video} from 'lucide-react';
import {api} from '../lib/app-shared';
import {contactEmail,contactTelegram} from '../lib/contact-links';
import {ConsentLabel,LEGAL_VERSION} from './legal-pages';
import {MeetingDate} from './meeting-date';

const formats = [
  {label:'Онлайн',Icon:Video},{label:'В офисе',Icon:Building2},{label:'У заказчика',Icon:Users},
] as const;

export function MeetingForm() {
  const [format,setFormat] = useState<string>(formats[0].label);
  const [date,setDate] = useState('');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [sent,setSent] = useState(false);
  const request = useRef(false);
  const result = useRef<HTMLDivElement>(null);
  useEffect(()=>{if(sent) result.current?.focus();},[sent]);

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.current) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name')||'').trim();
    const contact = String(data.get('contact')||'').trim();
    const time = String(data.get('time')||'');
    const phone = /^[+()\d .-]+$/.test(contact) && /^\d{10,15}$/.test(contact.replace(/\D/g,''));
    const telegram = contactTelegram(contact.startsWith('t.me/') ? 'https://'+contact : contact);
    if (!name || !(phone || contactEmail(contact) || telegram)) {
      setError('Укажите имя и действующий телефон, почту или Telegram.');
      return;
    }
    setError('');
    setBusy(true);
    request.current=true;
    try {
      const [year,month,day] = date.split('-');
      const description = [
        'Формат встречи: '+format+'.',
        date && 'Желаемая дата: '+[day,month,year].join('.')+'.',
        time && 'Желаемое время по Москве: '+time+'.',
        !date && !time && 'Дату и время согласуем при подтверждении.',
      ].filter(Boolean).join('\n');
      await api('leads',{name,contact,service:'Запрос встречи',description,consent:data.has('consent'),consentVersion:LEGAL_VERSION});
      setSent(true);
      window.dispatchEvent(new Event('overtake:leads'));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не удалось отправить запрос. Попробуйте ещё раз.');
    } finally {
      request.current=false;
      setBusy(false);
    }
  }

  return <section className="catalog-panel contacts-meeting" aria-labelledby="meeting-title">
    <h2 id="meeting-title">Договориться о встрече</h2>
    <p>Оставьте контакт. Подтвердим время встречи по Москве.</p>
    {sent ? <div ref={result} className="lead-success" role="status" tabIndex={-1}><CheckCircle2 size={26}/><h3>Запрос отправлен</h3><p>Свяжемся с вами и подтвердим встречу.</p></div> :
      <form className="lead-fields meeting-fields" onSubmit={submit}>
        <fieldset><legend>Формат встречи</legend><div className="meeting-formats">{formats.map(({label,Icon})=><label key={label}>
          <input type="radio" name="meeting-format" checked={format===label} onChange={()=>setFormat(label)}/>
          <Icon size={19} aria-hidden="true"/><span>{label}</span>
        </label>)}</div></fieldset>
        <div className="lead-fields-grid">
          <MeetingDate value={date} onChange={setDate}/>
          <label>Желаемое время<input type="time" name="time"/></label>
        </div>
        <div className="lead-fields-grid">
          <label>Имя<input name="name" autoComplete="name" placeholder="Как к вам обращаться" maxLength={80} required/></label>
          <label>Контакт<input name="contact" placeholder="Телефон, почта или Telegram" maxLength={160} required/></label>
        </div>
        <ConsentLabel purpose="для согласования встречи"/>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn purple" type="submit" disabled={busy}><ArrowUpRight size={17}/>{busy?'Отправляем…':'Запросить встречу'}</button>
      </form>}
  </section>;
}
