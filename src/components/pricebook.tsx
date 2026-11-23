import {useMemo,useState} from 'react';
import {Printer,Search,X} from 'lucide-react';
import {pricebook,offerPrice,type PriceOverrides} from '../lib/public-prices';
import {pricebookTerms} from '../lib/pricebook-data';

const pageSize=12;
const normalize=(text:string)=>text.toLocaleLowerCase('ru').replaceAll('ё','е');

export function Pricebook({prices}:{prices:PriceOverrides}) {
  const groups=useMemo(()=>pricebook(prices),[prices]);
  const [category,setCategory]=useState(location.hash==='#extra-prices'?'02':'');
  const [search,setSearch]=useState('');
  const [limit,setLimit]=useState(pageSize);
  const terms=normalize(search).trim().split(/\s+/).filter(Boolean);
  const results=groups
    .filter(group=>!category || group.id===category)
    .map(group=>({...group,offers:group.offers.filter(offer=>{
      const text=normalize(offer.name+' '+offer.scope+' '+group.name);
      return terms.every(term=>text.includes(term));
    })}))
    .filter(group=>group.offers.length);
  const count=results.reduce((sum,group)=>sum+group.offers.length,0);
  const total=groups.reduce((sum,group)=>sum+group.offers.length,0);
  let position=0;

  function selectCategory(value:string) {
    setCategory(value);
    setLimit(pageSize);
  }

  return <section className="pricing-section price-index" id="pricebook" aria-labelledby="pricebook-title">
    <div className="price-index-heading">
      <div><h2 id="pricebook-title">Прайс услуг</h2><p>{pricebookTerms}</p></div>
      <button className="pricing-print secondary-panel" type="button" disabled={!count} onClick={()=>window.print()}><Printer size={17}/> Печать / PDF</button>
    </div>
    <div className="price-index-layout" id="extra-prices">
      <nav className="price-index-nav" aria-label="Разделы прайса">
        <label className="price-index-mobile-category">Раздел прайса
          <select value={category} onChange={event=>selectCategory(event.target.value)}>
            <option value="">Все услуги</option>
            {groups.map(group=><option value={group.id} key={group.id}>{group.name}</option>)}
          </select>
        </label>
        <div className="price-index-desktop-category">
          <button type="button" aria-pressed={!category} onClick={()=>selectCategory('')}><span>Все услуги</span><small>{total}</small></button>
          {groups.map(group=><button type="button" key={group.id} aria-pressed={category===group.id} onClick={()=>selectCategory(group.id)}><span>{group.name}</span><small>{group.offers.length}</small></button>)}
        </div>
      </nav>
      <div className="price-index-content">
        <div className="price-index-searchbar">
          <label><Search aria-hidden="true" size={19}/><input type="search" aria-label="Поиск по прайсу" placeholder="Поиск услуги, например «онлайн-оплата»" value={search} onChange={event=>{setSearch(event.target.value);setLimit(pageSize);}}/></label>
          {search && <button className="price-index-clear" type="button" aria-label="Очистить поиск" onClick={()=>{setSearch('');setLimit(pageSize);}}><X size={18}/></button>}
        </div>
        <p className="price-index-count" role="status">{search.trim() ? 'Найдено' : 'Услуг в разделе'} · {count}</p>
        {!count && <div className="price-index-empty">
          <p>Услуг по этому запросу нет.</p>
          {category && <button type="button" className="secondary-panel" onClick={()=>selectCategory('')}>Искать во всех разделах</button>}
        </div>}
        {results.map(group=>{
          const hidden=position>=limit;
          return <section className={hidden?'price-index-group print-only-price':'price-index-group'} key={group.id}>
            <h3>{group.name}</h3>
            <ul className="price-index-entries">{group.offers.map(offer=>
              <li className={position++>=limit?'print-only-price':undefined} key={offer.code}>
                <div><strong>{offer.name}</strong><p>{offer.scope}</p></div><b>{offerPrice(offer)}</b>
              </li>,
            )}</ul>
          </section>;
        })}
        {count>limit && <button type="button" className="secondary-panel price-index-more" onClick={()=>setLimit(limit+pageSize)}>Показать ещё {Math.min(pageSize,count-limit)}</button>}
      </div>
    </div>
  </section>;
}
