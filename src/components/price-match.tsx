import {useEffect,useState} from 'react';
import {ArrowUpRight,Tag,X} from 'lucide-react';

const storageKey = 'overtake:price-offer-dismissed';

export function PriceMatch({onDiscuss}: {onDiscuss: () => void}) {
  const [ready,setReady] = useState(false);

  useEffect(() => {
    try { if (sessionStorage.getItem(storageKey)) return; } catch {}
    const timer = window.setTimeout(() => setReady(true),12000);
    return () => window.clearTimeout(timer);
  },[]);

  function dismiss() {
    setReady(false);
    try { sessionStorage.setItem(storageKey,'1'); } catch {}
  }

  if (!ready) return null;
  return <aside className="offer-notice small-notice" aria-labelledby="price-match-title" onKeyDown={event => {
    if (event.key === 'Escape') dismiss();
  }}>
    <span className="small-notice-icon" aria-hidden="true"><Tag size={17}/></span>
    <div>
      <h2 id="price-match-title">Нашли дешевле?</h2>
      <p>Сверим объём работ и, если сможем, предложим цену ниже.</p>
      <button className="offer-action" type="button" onClick={() => { dismiss(); onDiscuss(); }}>
        Сравнить сметы <ArrowUpRight size={14} aria-hidden="true"/>
      </button>
    </div>
    <button className="offer-close" type="button" onClick={dismiss} aria-label="Закрыть предложение"><X size={17}/></button>
  </aside>;
}
