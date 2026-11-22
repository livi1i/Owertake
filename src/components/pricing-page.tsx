import React,{useEffect,useState} from 'react';
import {ArrowLeft,ArrowUpRight,Calculator,Check,Printer} from 'lucide-react';
import {mergeServices,serviceCategories,servicesRequest,type AgencyService} from '../lib/services';
import {offerPrice,offersFor,type PriceOverrides} from '../lib/public-prices';
import './pricing-page.css';
import {packages} from '../lib/project-packages';
import {LeadSection} from './lead-section';
import {InterfaceArt} from './interface-art';
import {Reveal} from './reveal';


export function PricingPage({order,prices,contacts}:{order:(name:string,description?:string)=>void;prices:PriceOverrides;contacts:Record<string,string>}) {
  const [items,setItems] = useState<AgencyService[]>([]);
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(true);
  const [category,setCategory] = useState('Все');

  const load = () => {
    setLoading(true);
    setError('');
    servicesRequest()
      .then(result => setItems(mergeServices(result.services).filter(service => service.status !== 'Скрыта')))
      .catch(error => setError(error.message))
      .finally(() => setLoading(false));
  };
  useEffect(load,[]);
  useEffect(() => {
    const anchor=location.hash.slice(1);
    if (!loading && ['formats','extra-prices','request'].includes(anchor)) document.getElementById(anchor)?.scrollIntoView();
  },[loading]);

  return <main id="main" className="pricing-page">
    <a className="catalog-back" href="/services"><ArrowLeft size={17}/> Каталог услуг</a>
    <div className="pricing-heading page-banner" data-enter>
      <div><h1>Цены и пакеты услуг</h1><p>Стоимость за базовый объём. Согласуем смету до начала работ.</p><a className="secondary-panel" href="/calculator"><Calculator size={18}/> Рассчитать стоимость</a></div><InterfaceArt/>
    </div>
    {loading && <p role="status">Загружаем прайс…</p>}
    {error && <div className="catalog-empty" role="alert"><p>{error}</p><button className="btn purple" onClick={load}>Повторить загрузку</button></div>}
    {!loading && !error && <>
      <section className="pricing-section" id="formats">
        <h2>Готовые решения</h2>
        <div className="pricing-packages">
          {packages.map(bundle => {
            const service = items.find(item => item.slug === bundle.slug && item.status !== 'Временно недоступна');
            const offer = offersFor(bundle.slug, prices).find(item => item.code === bundle.code);
            if (!service || !offer) return null;
            return <Reveal key={bundle.code} delay={(packages.indexOf(bundle)%3)*45}><article className="pricing-package">
              <h3>{bundle.name}</h3>
              <p>{bundle.audience}</p>
              <strong>{offerPrice(offer)}</strong>
              <ul>{bundle.included.map(item => <li key={item}><Check size={16}/>{item}</li>)}</ul>
              <small>Сроки согласуем по задаче. Дополнительные работы и сторонние расходы считаем отдельно.</small>
              <button className="btn purple full" type="button" onClick={() => order(service.name, `Пакет «${bundle.name}» · ${offerPrice(offer)}. ${offer.scope}`)}>Обсудить пакет <ArrowUpRight size={17}/></button>
              <a className="secondary-panel" href={'/calculator?' + new URLSearchParams({service:bundle.slug,offer:bundle.code})}>Уточнить параметры</a>
            </article></Reveal>;
          })}
        </div>
      </section>
      <section className="pricing-section">
        <div className="pricing-section-title">
          <h2>Прайс основных услуг</h2>
          <button className="pricing-print" type="button" onClick={() => window.print()}><Printer size={16}/> Печать / PDF</button>
        </div>
        <div className="catalog-filters" aria-label="Категории стоимости">
          {['Все',...serviceCategories,'Допработы'].map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <div className="pricebook">
          {(category === 'Все' || category === 'Допработы') && <section className="catalog-panel pricebook-group" id="extra-prices">
            <h3>Дополнительные работы</h3>
            <ul className="public-offers">{offersFor('extra-work',prices).map(offer => <li key={offer.code}><div><strong>{offer.name}</strong><p>{offer.scope}</p></div><b>{offerPrice(offer)}</b></li>)}</ul>
          </section>}
          {serviceCategories.filter(item => category === 'Все' || category === item).map(group => {
            const services = items.filter(service => service.category === group);
            if (!services.length) return null;
            return <section className="catalog-panel pricebook-group" key={group}>
              <h3>{group}</h3>
              <ul className="public-offers">
                {services.flatMap(service => {
                  const offers = offersFor(service.slug, prices);
                  if (service.status === 'Временно недоступна' || !offers.length) {
                    return <li key={service.slug}><div><a href={'/services/' + service.slug}>{service.name}</a></div><b>{service.status === 'Временно недоступна' ? 'Временно недоступна' : 'По согласованию'}</b></li>;
                  }
                  return offers.map(offer => <li key={offer.code}>
                    <div><a href={'/services/' + service.slug}>{offer.name}</a><p>{offer.scope}</p></div>
                    <b>{offerPrice(offer)}</b>
                  </li>);
                })}
              </ul>
            </section>;
          })}
        </div>
      </section>
    </>}
    <section className="pricing-section pricing-faq">
      <h2>Что влияет на стоимость</h2>
      {[
        ['Объём и сложность','На цену влияют количество экранов и сценариев, интеграции, перенос материалов, готовность контента и сроки. Минимум отдельного разового заказа — 500 ₽.'],
        ['Лицензии и инфраструктура','Согласуем, какие домены, хостинг, лицензии и сторонние сервисы нужны для проекта и кто их оплачивает.'],
        ['Оплата и правки','Состав результата, порядок согласования правок, приёмку и оплату фиксируем в договоре.'],
      ].map(([question,answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
    </section>
    <LeadSection contacts={contacts}/>
    <div className="pricing-print-footer">OVERTAKE · ИП Игнатенко Илья Анатольевич · ИНН 511007182150 · ОГРНИП 325600000016430 · +7 (951) 750-67-00. Цены за базовый объём работ.</div>
  </main>;
}
