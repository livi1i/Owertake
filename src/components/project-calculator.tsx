import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,Bolt,Check} from 'lucide-react';
import {mergeServices,serviceCategories,servicesRequest,type AgencyService} from '../lib/services';
import {offerCode,offerPrice,formatPrice,type PriceOverrides} from '../lib/public-prices';
import {buildProjectQuote,designLevels,urgentRate,projectPresets,type DesignLevel} from '../lib/project-quote';
import {LeadSection,type LeadPrefill} from './lead-section';
import {CalculatorArt} from './calculator-art';
import {StudioSelect} from './studio-select';
import './project-calculator.css';

export function ProjectCalculator({prices,contacts,embedded=false,onRequest}:{prices:PriceOverrides;contacts:Record<string,string>;embedded?:boolean;onRequest?:(service:string,description:string)=>void}) {
  const params = new URLSearchParams(location.search);
  const initialSlug = params.get('service') || 'landing';
  const initialCode = params.get('offer') || '';
  const initialPreset = projectPresets.find(item => item.slug === initialSlug && (item.id !== 'redesign' || initialCode === offerCode(19)));
  const [items,setItems] = useState<AgencyService[]>([]);
  const [preset,setPreset] = useState<string>(initialPreset?.id || 'other');
  const [slug,setSlug] = useState(initialSlug);
  const [code,setCode] = useState(initialCode);
  const [design,setDesign] = useState<DesignLevel>('current');
  const [extra,setExtra] = useState<string[]>([]);
  const [urgent,setUrgent] = useState(false);
  const [prefill,setPrefill] = useState<LeadPrefill>();
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const formAnchor = useRef<HTMLDivElement>(null);

  function load() {
    setLoading(true);
    setError('');
    servicesRequest().then(result => {
      const available = mergeServices(result.services).filter(item => !['Скрыта','Временно недоступна'].includes(item.status));
      setItems(available);
      if (!available.some(item => item.slug === initialSlug)) {
        setSlug(available[0]?.slug || '');
        setPreset('other');
        setCode('');
      }
    }).catch(error => setError(error.message)).finally(() => setLoading(false));
  }
  useEffect(load,[]);

  const service = items.find(item => item.slug === slug);
  const quote = buildProjectQuote({slug,preset,code,design,extras:extra,urgent},prices);
  const adjustableDesign = ['landing','corporate','ecommerce'].includes(slug) || preset === 'redesign';

  function resetFor(next:string) {
    setSlug(next);
    setCode('');
    setDesign('current');
    setExtra([]);
  }

  function requestQuote() {
    const label = projectPresets.find(item => item.id === preset && item.id !== 'other')?.name || service?.name || 'Индивидуальная задача';
    const description = [
      `Проект: ${label}`,
      ...(quote.lines.length ? ['Состав расчёта:',...quote.lines.map(item => `• ${item.name} — ${offerPrice(item)}`)] : []),
      ...(adjustableDesign ? [`Дизайн: ${designLevels.find(item => item.id === design)?.name}`] : []),
      `Стоимость: ${quote.totals.join(' + ') || 'по индивидуальной оценке'}`,
      ...(urgent ? [quote.urgentFee ? 'Ускоренный запуск: ориентир доплаты '+formatPrice(quote.urgentFee)+'.' : 'Ускоренный запуск: нужна индивидуальная оценка.'] : []),
      `Срок: ${quote.timeline}`,
      'Итоговую смету и дату запуска прошу согласовать.',
    ].join('\n');
    if (onRequest) { onRequest(label,description); return; }
    setPrefill({service:label,description});
    formAnchor.current?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    formAnchor.current?.querySelector('input')?.focus({preventScroll:true});
  }

  const Container=embedded?"div":"main";
  return <Container id={embedded?undefined:"main"} className="project-calculator">
    {embedded ? <p className="embedded-calculator-intro">Выберите параметры проекта. Предварительная сумма обновится сразу.</p> : <>
      <a className="catalog-back" href="/services#calculator"><ArrowLeft size={17}/> Продукты и решения</a>
      <header className="page-banner config-heading" data-enter><div><h1>Сколько стоит<br/>ваш проект?</h1><p>Выберите задачу и функции. Расчёт обновится сразу и перейдёт в заявку вместе с составом работ.</p></div><CalculatorArt/></header>
    </>}
    {loading ? <p role="status" className="config-empty">Загружаем прайс…</p> : error ? <div role="alert" className="config-empty"><p>{error}</p><button className="btn purple" onClick={load}>Повторить</button></div> : <div className="config-layout">
      <div className="config-controls">
        <section className="config-panel"><div className="config-step"><span>01</span><h2>Что сделать</h2></div>
          <div className="quote-pills" aria-label="Тип проекта">{projectPresets.map(item => <button key={item.id} type="button" aria-pressed={preset===item.id}
            disabled={!!item.slug&&!items.some(service => service.slug === item.slug)} onClick={() => {setPreset(item.id);resetFor(item.slug);}}>{item.name}</button>)}</div>
          {preset==='other' && <StudioSelect label="Услуга" value={slug} onChange={resetFor} groups={[{choices:[{value:'',label:'Подбор решения'}]},...serviceCategories.map(category=>({label:category,choices:items.filter(item=>item.category===category).map(item=>({value:item.slug,label:item.name,hint:item.description}))}))]}/>}
        </section>
        <section className="config-panel"><div className="config-step"><span>02</span><h2>Объём работ</h2></div>
          {quote.variants.length ? <div className="quote-pills quote-volume" aria-label="Объём работ">{quote.variants.map(item => <button type="button" key={item.code}
            aria-pressed={item.code===quote.base?.code} onClick={() => {setCode(item.code);if ([offerCode(6),offerCode(7)].includes(item.code)) setDesign('current');}}>{item.name}</button>)}</div> : <p>Уточним объём по описанию задачи.</p>}
          {quote.base && <p className="config-hint">{quote.base.scope}</p>}
        </section>
        {adjustableDesign && <section className="config-panel"><div className="config-step"><span>03</span><h2>Дизайн</h2></div>
          <div className="quote-pills" aria-label="Уровень дизайна">{designLevels.map(item => <button type="button" key={item.id} aria-pressed={design===item.id}
            onClick={() => setDesign(item.id)}><strong>{item.name}</strong><small>{item.hint}</small></button>)}</div>
        </section>}
        {quote.options.length > 0 && <section className="config-panel"><div className="config-step"><span>{adjustableDesign?'04':'03'}</span><h2>Дополнения</h2></div>
          <div className="quote-extras">{quote.options.map(item => <label key={item.id}>
            <input type="checkbox" checked={item.included||extra.includes(item.id)} disabled={item.included} onChange={event => setExtra(event.target.checked ? [...extra,item.id] : extra.filter(id => id !== item.id))}/>
            <span>{item.name}<small>{item.included ? 'Уже в тарифе' : item.offer ? offerPrice(item.offer) : 'По согласованию'}</small></span>
          </label>)}</div>
        </section>}
        <label className="quote-urgent"><Bolt size={22}/><span><strong>Нужен срочный запуск</strong><small>{quote.hasUrgentEstimate ? 'Ориентир доплаты +'+urgentRate+'% к разовым работам' : 'Срок и доплата по индивидуальной оценке'}</small></span><input type="checkbox" role="switch" checked={urgent} onChange={event => setUrgent(event.target.checked)}/><i aria-hidden="true"/></label>
      </div>
      <aside className="config-summary">
        <span className="catalog-kicker">ПРЕДВАРИТЕЛЬНЫЙ РАСЧЁТ</span>
        <h2>{projectPresets.find(item => item.id === preset && item.id !== 'other')?.name || service?.name || 'Индивидуальный проект'}</h2>
        <div key={quote.totals.join()+quote.timeline} className="quote-totals" aria-live="polite"><strong>{quote.totals.join(' + ') || 'По согласованию'}</strong><p>{quote.timeline}</p></div>
        {quote.urgentFee>0 && <p className="quote-fee">Доплата за срочный запуск · {formatPrice(quote.urgentFee)}</p>}
        {quote.lines.length>0 && <ul className="quote-lines">{quote.lines.map(item => <li key={item.code}><Check size={15}/><span>{item.name}<small>{offerPrice(item)}</small></span></li>)}</ul>}
        <p className="config-hint">Это ориентир по прайсу и планированию. Итоговую стоимость и доступную дату запуска подтвердим после обсуждения.</p>
        <button className="btn purple full" onClick={requestQuote}>Получить расчёт</button>
      </aside>
    </div>}
    {!embedded && <div ref={formAnchor} className="request-anchor"><LeadSection contacts={contacts} prefill={prefill} heading="Отправить расчёт команде"/></div>}
  </Container>;
}
