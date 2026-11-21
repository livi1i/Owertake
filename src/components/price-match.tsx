import {useEffect, useState} from 'react';
import {ArrowUpRight, Tag, X} from 'lucide-react';

const storageKey = 'overtake:price-offer-dismissed';
const message = 'Пришлите предложение с сопоставимым объёмом работ. Посмотрим смету и, если сможем, предложим цену ниже.';

export function PriceMatch({onDiscuss}: {onDiscuss: () => void}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey)) return;
    } catch {}
    const timer = window.setTimeout(() => setVisible(true), 9000);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { sessionStorage.setItem(storageKey, '1'); } catch {}
  };

  if (!visible) return null;
  return <aside className="price-match" aria-labelledby="price-match-title" onKeyDown={event => {
    if (event.key === 'Escape') dismiss();
  }}>
    <div className="price-match-icon" aria-hidden="true"><Tag size={21}/></div>
    <div>
      <div role="status">
        <h2 id="price-match-title">Нашли дешевле?</h2>
        <p>{message}</p>
      </div>
      <button className="price-match-link" type="button" onClick={() => { dismiss(); onDiscuss(); }}>
        Сравнить предложения <ArrowUpRight size={16} aria-hidden="true"/>
      </button>
    </div>
    <button className="price-match-close" type="button" onClick={dismiss} aria-label="Закрыть предложение">
      <X size={18} aria-hidden="true"/>
    </button>
  </aside>;
}
