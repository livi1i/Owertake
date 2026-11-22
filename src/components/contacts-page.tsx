import {ArrowLeft,ArrowUpRight,FileText,Mail,MapPin,Phone,Send} from 'lucide-react';
import {OperatorDetails} from './legal-pages';
import {contactEmail,contactTelegram} from '../lib/contact-links';
import {LeadSection} from './lead-section';
import {OfficeMap} from './office-map';
import {MeetingForm} from './meeting-form';
import './contacts-page.css';

export function ContactsPage({contacts}:{contacts:Record<string,string>}) {
  const email = contactEmail(contacts.email || '');
  const telegram = [contacts.telegram,contacts.telegram2].flatMap(value => {
    const url = contactTelegram(value || '');
    return url ? [{value,url}] : [];
  });
  return <main className="contacts-page" id="main">
    <a className="catalog-back" href="/"><ArrowLeft size={17}/> На главную</a>
    <header className="page-banner" data-enter><div><h1>Контакты</h1><p>Позвоните, напишите или договоритесь о встрече в Пскове.</p></div><span className="page-illustration" aria-hidden="true"><MapPin size={50}/></span></header>
    <div className="studio-contact-board">
      <div className="studio-contact-info">
        <div className="studio-contact-list">
          <a href="tel:+79517506700"><span className="studio-glyph"><Phone size={19}/></span><span><small>Телефон</small><strong>+7 (951) 750-67-00</strong></span><ArrowUpRight size={18}/></a>
          {email && <a href={email}><span className="studio-glyph"><Mail size={19}/></span><span><small>Почта</small><strong>{contacts.email}</strong></span><ArrowUpRight size={18}/></a>}
          {telegram.map(item => <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer"><span className="studio-glyph"><Send size={19}/></span><span><small>Telegram</small><strong>{item.value}</strong></span><ArrowUpRight size={18}/></a>)}
          {contacts.hours && <p>Часы приёма · {contacts.hours}</p>}
        </div>
        <OfficeMap address={contacts.address || ''}/>
      </div>
      <MeetingForm/>
    </div>
    <section className="catalog-panel contact-requisites" aria-labelledby="contact-requisites-title">
      <div className="contact-requisites-heading"><span className="studio-glyph"><FileText size={23}/></span><h2 id="contact-requisites-title">Реквизиты исполнителя</h2><a className="secondary-panel" href="/legal"><ArrowUpRight size={16}/> Документы</a></div>
      <OperatorDetails showPhone={false}/>
    </section>
    <LeadSection contacts={contacts}/>
  </main>;
}
