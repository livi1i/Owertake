import {useState} from 'react';
import {ArrowLeft,ArrowUpRight,Building2,FileText,Mail,MapPin,Phone,Send,Users,Video} from 'lucide-react';
import {OperatorDetails} from './legal-pages';
import {contactEmail,contactTelegram} from '../lib/contact-links';
import {LeadSection} from './lead-section';
import {OfficeMap} from './office-map';
import './contacts-page.css';

export function ContactsPage({contacts,order}:{contacts:Record<string,string>;order:(name:string,context?:string)=>void}) {
  const [format,setFormat] = useState('Онлайн');
  const [date,setDate] = useState('');
  const [time,setTime] = useState('');
  const email = contactEmail(contacts.email || '');
  const telegram = [contacts.telegram,contacts.telegram2].flatMap(value => {
    const url = contactTelegram(value || '');
    return url ? [{value,url}] : [];
  });
  return <main className="contacts-page" id="main">
    <a className="catalog-back" href="/"><ArrowLeft size={17}/> На главную</a>
    <header className="page-banner" data-enter><div><h1>Контакты</h1><p>Позвоните, напишите или договоритесь о встрече в Пскове.</p></div><span className="page-illustration" aria-hidden="true"><MapPin size={50}/></span></header>
    <div className="studio-contact-grid">
      <div className="studio-contact-list">
        <a href="tel:+79517506700"><span className="studio-glyph"><Phone size={19}/></span><span><small>Телефон</small><strong>+7 (951) 750-67-00</strong></span><ArrowUpRight size={18}/></a>
        {email && <a href={email}><span className="studio-glyph"><Mail size={19}/></span><span><small>Почта</small><strong>{contacts.email}</strong></span><ArrowUpRight size={18}/></a>}
        {telegram.map(item => <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer"><span className="studio-glyph"><Send size={19}/></span><span><small>Telegram</small><strong>{item.value}</strong></span><ArrowUpRight size={18}/></a>)}
        {contacts.hours && <p>Часы приёма · {contacts.hours}</p>}
      </div>
      <OfficeMap address={contacts.address || ''}/>
    </div>
    <div className="studio-contact-details">
      <section className="catalog-panel"><span className="studio-glyph"><FileText size={23}/></span><h2>Реквизиты исполнителя</h2><OperatorDetails showPhone={false}/><a className="secondary-panel" href="/legal"><ArrowUpRight size={16}/> Документы</a></section>
      <section className="catalog-panel contacts-meeting"><h2>Договориться о встрече</h2><p>Укажите удобное время по Москве. Команда уточнит детали и подтвердит встречу.</p>
        <fieldset><legend>Формат встречи</legend><div className="meeting-formats">{[{label:'Онлайн',detail:'Видеозвонок',Icon:Video},{label:'В офисе',detail:'Псков',Icon:Building2},{label:'У заказчика',detail:'Приедем к вам',Icon:Users}].map(({label,detail,Icon}) => <label key={label}><input type="radio" name="meeting-format" checked={format === label} onChange={() => setFormat(label)}/><Icon size={20} aria-hidden="true"/><span><strong>{label}</strong><small>{detail}</small></span></label>)}</div></fieldset>
        <div className="form-grid"><label>Желаемая дата<input type="date" value={date} onChange={event => setDate(event.target.value)}/></label><label>Желаемое время<input type="time" value={time} onChange={event => setTime(event.target.value)}/></label></div>
        <button className="btn purple" onClick={() => order('Консультация по проекту',`Формат встречи: ${format}.${date ? ' Желаемая дата: '+date+'.' : ''}${time ? ' Желаемое время по Москве: '+time+'.' : ''}`)}><ArrowUpRight size={17}/> Запросить встречу</button>
      </section>
    </div>
    <LeadSection contacts={contacts}/>
  </main>;
}
