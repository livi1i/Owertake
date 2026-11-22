import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,Tag,X} from 'lucide-react';

const storageKey = 'overtake:price-offer-next';
const repeat = 85_000;

export function PriceMatch({onDiscuss}: {onDiscuss: () => void}) {
  const [ready,setReady] = useState(false);
  const [hovered,setHovered] = useState(false);
  const [focused,setFocused] = useState(false);
  const next = useRef(Date.now() + 9000);

  function schedule(delay:number) {
    next.current = Date.now()+delay;
    try { sessionStorage.setItem(storageKey,String(next.current)); } catch {}
  }

  useEffect(() => {
    try {
      const saved = Number(sessionStorage.getItem(storageKey));
      if (saved) next.current = saved;
      else sessionStorage.setItem(storageKey,String(next.current));
    } catch {}
    const timer = window.setInterval(() => {
      if (!document.hidden && Date.now()>=next.current) {
        schedule(repeat);
        setReady(true);
      }
    },500);
    return () => window.clearInterval(timer);
  },[]);

  useEffect(() => {
    if (!ready || hovered || focused) return;
    const timer = window.setTimeout(() => setReady(false),11_000);
    return () => window.clearTimeout(timer);
  },[ready,hovered,focused]);

  function dismiss(delay=repeat) {
    schedule(delay);
    setReady(false);
    setHovered(false);
    setFocused(false);
  }

  if (!ready) return null;
  return <aside className="offer-notice small-notice" aria-labelledby="price-match-title"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocus={() => setFocused(true)} onBlur={event => {if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);}}
    onKeyDown={event => {
    if (event.key === 'Escape') dismiss();
  }}>
    <span className="small-notice-icon" aria-hidden="true"><Tag size={17}/></span>
    <div>
      <h2 id="price-match-title">Нашли дешевле?</h2>
      <p>Сверим объём работ и, если сможем, предложим цену ниже.</p>
      <button className="offer-action" type="button" onClick={() => { dismiss(600_000); onDiscuss(); }}>
        Связаться <ArrowUpRight size={14} aria-hidden="true"/>
      </button>
    </div>
    <button className="offer-close" type="button" onClick={() => dismiss()} aria-label="Закрыть предложение"><X size={17}/></button>
  </aside>;
}
