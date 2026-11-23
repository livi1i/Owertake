import {ArrowRight,Network,Palette,Send} from 'lucide-react';
import {formatPrice,offerAt,offerPrice,type PublicOffer,type PriceOverrides} from '../lib/public-prices';
import {businessSolutions} from '../lib/project-packages';
import {Pricebook} from './pricebook';
import {Reveal} from './reveal';
import './pricing-page.css';

const icons=[Network,Send,Palette];

export function ProductPricing({order,prices,onOffer}:{
  order:(name:string,description?:string)=>void;prices:PriceOverrides;onOffer:(offer:PublicOffer)=>void;
}) {
  return <div className="product-pricing">
    <section className="studio-inner-section" id="formats" aria-labelledby="product-packages-title">
      <div className="product-section-heading"><h2 id="product-packages-title">Комплекты для бизнеса</h2>
        <p>У каждого комплекта указан состав работ и итоговая сумма. Лицензии и сторонние сервисы оплачиваются отдельно.</p></div>
      <div className="solutions-grid">
        {businessSolutions.map((bundle,index)=>{
          const items=bundle.rows.map(row=>offerAt(row,prices));
          const total=items.reduce((sum,item)=>sum+item.amount,0);
          const Icon=icons[index];
          function requestSolution() {
            order(bundle.name,[`Комплект «${bundle.name}» · ${formatPrice(total)}`,...items.map(item=>`• ${item.name} — ${offerPrice(item)}. ${item.scope}`)].join('\n'));
          }
          return <Reveal key={bundle.id} delay={index*85}>
            <article className="solution-bundle">
              <div className="solution-top"><span aria-hidden="true"><Icon size={27} strokeWidth={1.6}/></span><strong>{formatPrice(total)}</strong></div>
              <h3>{bundle.name}</h3><p>{bundle.summary}</p>
              <ul>{items.map(item=><li key={item.code}><span>{item.name}</span><b>{offerPrice(item)}</b></li>)}</ul>
              <details><summary>Что входит в работы</summary><dl>{items.map(item=><div key={item.code}><dt>{item.name}</dt><dd>{item.scope}</dd></div>)}</dl></details>
              <button className="secondary-panel" type="button" onClick={requestSolution}>Обсудить комплект <ArrowRight size={16} aria-hidden="true"/></button>
            </article>
          </Reveal>;
        })}
      </div>
    </section>
    <Pricebook prices={prices} onOffer={onOffer}/>
  </div>;
}
