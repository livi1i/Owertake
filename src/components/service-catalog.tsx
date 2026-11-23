import React,{useEffect,useRef,useState} from 'react';
import {ArrowLeft,Calculator,ChevronDown} from 'lucide-react';
import {defaultAgencyServices,filterServices,mergeServices,serviceCategories,serviceCategoryUrl,servicesRequest,type AgencyService} from '../lib/services';
import {offerPrice,offersFor,type PriceOverrides} from '../lib/public-prices';
import {ServicePreview,ServiceIcon} from './service-preview';
import {LeadSection} from './lead-section';
import {InterfaceArt} from './interface-art';
import {ProductPricing} from './pricing-page';
import {ProductDialog,type ProductDetails} from './product-dialog';
import './service-catalog.css';

const featuredProducts=['landing','telegram','crm-setup','ai-assistants','ui-ux','web-apps'];
const EmbeddedCalculator=React.lazy(()=>import('./project-calculator').then(module=>({default:module.ProjectCalculator})));

export function ServiceCatalog({path,order,prices,contacts}:{
  path:string;order:(name:string,description?:string)=>void;prices:PriceOverrides;contacts:Record<string,string>;
}) {
  const [items,setItems]=useState(defaultAgencyServices);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [category,setCategory]=useState(()=>{
    const selected=new URLSearchParams(location.search).get('category');
    return serviceCategories.find(item=>item===selected) || 'Все';
  });
  const [showAll,setShowAll]=useState(false);
  const [calculatorOpen,setCalculatorOpen]=useState(location.hash==='#calculator');
  const [product,setProduct]=useState<ProductDetails|null>(null);
  const openedDeepLink=useRef(false);
  const found=filterServices(items,'',category);
  const preview=featuredProducts.flatMap(slug=>found.filter(item=>item.slug===slug));

  function selectCategory(next:string) {
    setCategory(next);
    setShowAll(false);
    history.replaceState(history.state,'',next==='Все'?'/services':serviceCategoryUrl(next));
  }
  function load() {
    setLoading(true);
    setError('');
    servicesRequest().then(result=>setItems(mergeServices(result.services))).catch(error=>setError(error.message)).finally(()=>setLoading(false));
  }
  useEffect(load,[]);
  function openProduct(service:AgencyService) {
    setProduct({title:service.name,description:service.description,slug:service.slug,
      offers:offersFor(service.slug,prices),available:service.status!=='Временно недоступна'});
  }
  useEffect(()=>{
    if (loading || error) return;
    function syncAnchor() {
      const params=new URLSearchParams(location.search);
      const anchor=location.hash.slice(1) || (params.get('view')==='pricing'?'pricebook':'');
      if (anchor==='calculator') setCalculatorOpen(true);
      if (anchor) document.getElementById(anchor)?.scrollIntoView({behavior:'instant'});
    }
    const frame=requestAnimationFrame(syncAnchor);
    window.addEventListener('hashchange',syncAnchor);
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener('hashchange',syncAnchor);};
  },[loading,error]);
  useEffect(()=>{
    if (loading || openedDeepLink.current) return;
    openedDeepLink.current=true;
    const slug=new URLSearchParams(location.search).get('product') || path.split('/')[2];
    const service=slug && items.find(item=>item.slug===slug && item.status!=='Скрыта');
    if (service) setProduct({title:service.name,description:service.description,slug:service.slug,
      offers:offersFor(service.slug,prices),available:service.status!=='Временно недоступна'});
  },[loading,items,path,prices]);

  return <main id="main" className="catalog-page products-page">
    <a className="catalog-back" href="/"><ArrowLeft size={17}/> На главную</a>
    <header className="page-banner products-heading" data-enter>
      <div><h1>Продукты и решения</h1><p>Выберите отдельный цифровой продукт или комплект работ под задачу бизнеса.</p>
        <div className="product-intro-actions"><a className="btn purple" href="#formats">Смотреть комплекты</a><a className="secondary-panel" href="#calculator"><Calculator size={17}/> Рассчитать проект</a></div>
      </div><InterfaceArt/>
    </header>
    <nav className="studio-jump" aria-label="Разделы каталога"><a href="#service-products">Продукты</a><a href="#formats">Готовые решения</a><a href="#pricebook">Весь прайс</a><a href="#calculator">Калькулятор</a></nav>
    <section className="studio-inner-section" id="service-products" aria-labelledby="product-list-title">
      <div className="product-section-heading"><h2 id="product-list-title">Продукты</h2>
        <p>Откройте карточку, чтобы сравнить варианты и их точную стоимость.</p></div>
      <div className="catalog-filters" aria-label="Фильтр направлений">{['Все',...serviceCategories].map(value=>
        <button type="button" key={value} aria-pressed={category===value} onClick={()=>selectCategory(value)}>{value}</button>)}</div>
      {error ? <div className="catalog-empty" role="alert"><p>{error}</p><button className="secondary-panel" onClick={load}>Повторить загрузку</button></div> :
        loading ? <p role="status">Загружаем продукты…</p> :
        found.length ? <div className="catalog-grid">{(category==='Все'&&!showAll&&preview.length?preview:found).map(service=>
          <ServiceCard key={service.slug} service={service} prices={prices} onOpen={()=>openProduct(service)}/>)}</div> :
        <div className="catalog-empty"><h3>В этом направлении пока нет решений</h3><button className="secondary-panel" onClick={()=>selectCategory('Все')}>Сбросить фильтр</button></div>}
      {!loading && !error && category==='Все' && preview.length>0 && found.length>preview.length &&
        <button className="secondary-panel products-more" type="button" onClick={()=>setShowAll(!showAll)}>{showAll?'Свернуть каталог':'Показать все продукты'}</button>}
    </section>
    <ProductPricing order={order} prices={prices} onOffer={offer=>setProduct({title:offer.name,description:offer.scope,offers:[offer]})}/>
    <section id="calculator" className="studio-inner-section catalog-calculator" aria-labelledby="catalog-calculator-title">
      <h2 id="catalog-calculator-title">Калькулятор проекта</h2>
      <details open={calculatorOpen} onToggle={event=>setCalculatorOpen(event.currentTarget.open)}>
        <summary><Calculator size={20}/> Настроить параметры проекта <ChevronDown size={17} aria-hidden="true"/></summary>
        {calculatorOpen && <React.Suspense fallback={<p role="status">Загружаем калькулятор…</p>}>
          <EmbeddedCalculator embedded prices={prices} contacts={contacts} onRequest={order}/>
        </React.Suspense>}
      </details>
    </section>
    <LeadSection contacts={contacts}/>
    {product && <ProductDialog product={product} close={()=>setProduct(null)} order={order}/>}
  </main>;
}

function ServiceCard({service,prices,onOpen}:{service:AgencyService;prices:PriceOverrides;onOpen:()=>void}) {
  const offers=service.status==='Временно недоступна'?[]:offersFor(service.slug,prices);
  const offer=offers[0];
  return <article className="catalog-card catalog-card-button">
    <ServicePreview slug={service.slug}/><div className="catalog-card-top"><ServiceIcon slug={service.slug}/></div>
    <small>{service.category}</small><span className="catalog-card-title">{service.name}</span><span className="catalog-card-description">{service.description}</span>
    <span className="catalog-card-foot"><span>{offer ? offerPrice(offer) : service.status}</span><button type="button" onClick={onOpen} aria-label={"Подробнее · "+service.name}>Подробнее</button></span>
  </article>;
}
