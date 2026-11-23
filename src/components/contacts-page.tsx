import {ArrowLeft,Clock3,FileText,Mail,Phone,Send} from 'lucide-react';
import {OperatorDetails} from './legal-pages';
import {contactEmail,telegramContacts} from '../lib/contact-links';
import {LeadSection} from './lead-section';
import {OfficeMap} from './office-map';
import {MeetingForm} from './meeting-form';
import {Reveal} from './reveal';
import './contacts-page.css';

export function ContactsPage({contacts}:{contacts:Record<string,string>}) {
  const email = contactEmail(contacts.email || '');
  const telegram=telegramContacts(contacts);
  return <main className="contacts-page" id="main">
    <a className="catalog-back" href="/"><ArrowLeft size={17}/> На главную</a>
    <header className="page-banner" data-enter><div><h1>Контакты</h1><p>На связи круглосуточно. Для встречи в Пскове выберите удобный формат и время.</p></div><div className="contact-support"><Clock3 size={27} aria-hidden="true"/><strong>Поддержка 24/7</strong><a href="tel:+79517506700">+7 (951) 750-67-00</a></div></header>
    <div className="studio-contact-board">
      <Reveal className="studio-contact-info">
        <div className="studio-contact-list">
          <a href="tel:+79517506700"><span className="studio-glyph"><Phone size={19}/></span><span><small>Телефон</small><strong>+7 (951) 750-67-00</strong></span></a>
          {email && <a href={email}><span className="studio-glyph"><Mail size={19}/></span><span><small>Почта</small><strong>{contacts.email}</strong></span></a>}
          {telegram.map(item => <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer"><span className="studio-glyph"><Send size={19}/></span><span><small>Telegram</small><strong>{item.label}</strong></span></a>)}

          {contacts.hours && <p>Часы приёма · {contacts.hours}</p>}
        </div>
        <OfficeMap address={contacts.address || ''}/>
      </Reveal>
      <Reveal delay={90}><MeetingForm/></Reveal>
    </div>
    <section className="catalog-panel contact-requisites" aria-labelledby="contact-requisites-title">
      <div className="contact-requisites-heading"><span className="studio-glyph"><FileText size={23}/></span><h2 id="contact-requisites-title">Реквизиты исполнителя</h2><a className="secondary-panel" href="/legal">Документы</a></div>
      <OperatorDetails showPhone={false}/>
    </section>
    <LeadSection contacts={contacts}/>
  </main>;
}
