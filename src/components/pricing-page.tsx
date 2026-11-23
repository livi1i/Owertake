import React,{useEffect,useState} from 'react';
import {ArrowLeft,Bot,Calculator,Check,FileCheck2,Globe,Layers3,LifeBuoy,Network,Server,ShoppingBag,PanelsTopLeft} from 'lucide-react';
import {mergeServices,servicesRequest,type AgencyService} from '../lib/services';
import {offerPrice,offersFor,type PriceOverrides} from '../lib/public-prices';
import './pricing-page.css';
import {packages} from '../lib/project-packages';
import {LeadSection} from './lead-section';
import packageArt from '../assets/studio-packages.webp?inline';
import {Reveal} from './reveal';
import {Pricebook} from './pricebook';

const packageIcons = [PanelsTopLeft,Globe,ShoppingBag,Bot,Network,LifeBuoy];
const priceFactors = [
  {Icon:Layers3,title:'Объём и сложность',text:'Считаем экраны, сценарии, интеграции и подготовку контента. Учитываем срок запуска. Минимум отдельного разового заказа — 500 ₽.'},
  {Icon:Server,title:'Лицензии и инфраструктура',text:'Заранее согласуем, нужны ли домен, хостинг, лицензии или сторонние сервисы и кто их оплачивает.'},
  {Icon:FileCheck2,title:'Оплата и правки',text:'Фиксируем состав работ, порядок правок, приёмку и оплату в договоре.'},
];


export function PricingPage({order,prices,contacts}:{order:(name:string,description?:string)=>void;prices:PriceOverrides;contacts:Record<string,string>}) {
  const [items,setItems] = useState<AgencyService[]>([]);
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(true);

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
    if (!loading && ['formats','pricebook','extra-prices','request'].includes(anchor)) document.getElementById(anchor)?.scrollIntoView();
  },[loading]);

  return <main id="main" className="pricing-page">
    <a className="catalog-back" href="/"><ArrowLeft size={17}/> На главную</a>
    <div className="pricing-heading page-banner" data-enter>
      <div><h1>Цены и пакеты услуг</h1><p>Стоимость и состав конкретных работ. Подберите готовое решение или соберите смету под свой проект.</p><div className="pricing-heading-actions"><a className="btn purple" href="#pricebook">Смотреть прайс</a><a className="secondary-panel" href="/calculator"><Calculator size={18}/> Рассчитать проект</a></div></div><img className="package-hero-art" src={packageArt} alt="" width={950} height={633}/>
    </div>
    {loading && <p role="status">Загружаем прайс…</p>}
    {error && <div className="catalog-empty" role="alert"><p>{error}</p><button className="btn purple" onClick={load}>Повторить загрузку</button></div>}
    {!loading && !error && <>
      <section className="pricing-section" id="formats">
        <h2>Готовые решения</h2>
        <div className="pricing-packages">
          {packages.map((bundle,index) => {
            const service = items.find(item => item.slug === bundle.slug && item.status !== 'Временно недоступна');
            const offer = offersFor(bundle.slug, prices).find(item => item.code === bundle.code);
            if (!service || !offer) return null;
            const Icon=packageIcons[index];
            return <Reveal key={bundle.code} delay={(index%3)*120}><article className="pricing-package">
              <div className="package-emblem" aria-hidden="true"><Icon size={36} strokeWidth={1.5}/></div>
              <h3>{bundle.name}</h3>
              <p>{bundle.audience}</p>
              <strong>{offerPrice(offer)}</strong>
              <ul>{bundle.included.map(item => <li key={item}><Check size={16}/>{item}</li>)}</ul>
              <button className="btn purple full" type="button" onClick={() => order(service.name, `Пакет «${bundle.name}» · ${offerPrice(offer)}. ${offer.scope}`)}>Обсудить пакет </button>
              <a className="secondary-panel" href={'/calculator?' + new URLSearchParams({service:bundle.slug,offer:bundle.code})}>Уточнить параметры</a>
            </article></Reveal>;
          })}
        </div>
        <p className="pricing-package-note">Сроки, дополнительные работы и сторонние расходы согласуем отдельно.</p>
      </section>
    </>}
    <Pricebook prices={prices}/>

    <section className="pricing-section" aria-labelledby="price-factors-title">
      <h2 id="price-factors-title">Что влияет на стоимость</h2>
      <div className="price-factors">{priceFactors.map(({Icon,title,text})=><article key={title}>
        <span className="studio-glyph" aria-hidden="true"><Icon size={23}/></span><h3>{title}</h3><p>{text}</p>
      </article>)}</div>
    </section>
    <LeadSection contacts={contacts}/>
  </main>;
}
