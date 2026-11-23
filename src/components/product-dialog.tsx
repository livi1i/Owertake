import {useEffect,useRef} from 'react';
import {Calculator,MessageCircle,X} from 'lucide-react';
import {offerPrice,type PublicOffer} from '../lib/public-prices';

export type ProductDetails={
  title:string;description:string;slug?:string;offers:readonly PublicOffer[];available?:boolean;
};

export function ProductDialog({product,close,order}:{
  product:ProductDetails;close:()=>void;order:(name:string,description?:string)=>void;
}) {
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{dialog.current?.showModal();},[]);
  const quote=product.offers.length===1?product.offers[0]:undefined;
  return <dialog ref={dialog} className="product-dialog" aria-labelledby="product-dialog-title" onClose={close}
    onClick={event=>{if(event.currentTarget===event.target) event.currentTarget.close();}}>
    <div className="product-dialog-content">
      <header><h2 id="product-dialog-title">{product.title}</h2><button type="button" aria-label="Закрыть описание" onClick={()=>dialog.current?.close()} autoFocus><X size={20}/></button></header>
      <p>{product.description}</p>
      {quote ? <>{quote.scope!==product.description && <p>{quote.scope}</p>}<strong className="product-dialog-price">{offerPrice(quote)}</strong></> :
        product.offers.length>0 && <ul className="public-offers">{product.offers.map(offer=><li key={offer.code}>
          <div><strong>{offer.name}</strong><p>{offer.scope}</p></div><b>{offerPrice(offer)}</b>
        </li>)}</ul>}
      <div className="product-dialog-actions">
        {product.available!==false && <button type="button" className="btn purple" onClick={()=>{
          dialog.current?.close();
          order(product.title,quote?`Работа «${quote.name}» · ${offerPrice(quote)}. ${quote.scope}`:undefined);
        }}><MessageCircle size={17}/> Связаться</button>}
        {product.available===false && <p>Приём заказов временно приостановлен.</p>}
        {product.slug && product.available!==false && <a className="secondary-panel" href={'/calculator?'+new URLSearchParams({service:product.slug})}><Calculator size={17}/> В калькулятор</a>}
      </div>
    </div>
  </dialog>;
}
