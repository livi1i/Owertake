import {useEffect,useRef,useState} from 'react';
import {MessageCircle,Tag,X} from 'lucide-react';
import {COOKIE_ACCEPTED_EVENT} from '../lib/cookie-preferences';

const storageKey='overtake:price-offer-once';
type OfferState='pending'|'shown'|null;

function readOffer():OfferState {
  for (const name of ['localStorage','sessionStorage'] as const) {
    try {
      const value=window[name].getItem(storageKey);
      if (value==='shown' || value==='pending') return value;
    } catch {}
  }
  return null;
}
function saveOffer(state:Exclude<OfferState,null>) {
  for (const name of ['localStorage','sessionStorage'] as const) {
    try { window[name].setItem(storageKey,state); return; } catch {}
  }
}
function chime(ctx:AudioContext) {
  if (ctx.state!=='running') return;
  [587.33,783.99].forEach((frequency,index)=>{
    const start=ctx.currentTime+index*.105;
    const note=ctx.createOscillator();
    const gain=ctx.createGain();
    note.frequency.value=frequency;
    gain.gain.setValueAtTime(.001,start);
    gain.gain.exponentialRampToValueAtTime(.058,start+.035);
    gain.gain.exponentialRampToValueAtTime(.001,start+.24);
    note.connect(gain).connect(ctx.destination);
    note.start(start);
    note.stop(start+.25);
  });
}

export function PriceMatch({allowed,onDiscuss}:{allowed:boolean;onDiscuss:()=>void}) {
  const [pending,setPending]=useState(()=>readOffer()==='pending');
  const [visible,setVisible]=useState(false);
  const shown=useRef(readOffer()==='shown');
  const audio=useRef<AudioContext|null>(null);

  useEffect(()=>{
    function accept() {
      if (shown.current || readOffer()==='shown') return;
      saveOffer('pending');
      setPending(true);
      try {
        audio.current ||= new AudioContext();
        void audio.current.resume().catch(()=>{});
      } catch {}
    }
    window.addEventListener(COOKIE_ACCEPTED_EVENT,accept);
    return ()=>{
      window.removeEventListener(COOKIE_ACCEPTED_EVENT,accept);
      void audio.current?.close().catch(()=>{});
    };
  },[]);

  useEffect(()=>{
    if (!pending || !allowed) return;
    let timer:number|undefined;
    function schedule() {
      window.clearTimeout(timer);
      if (document.hidden) return;
      timer=window.setTimeout(()=>{
        if (document.hidden) return;
        if (!shown.current && readOffer()!=='shown') {
          shown.current=true;
          saveOffer('shown');
          setVisible(true);
          if (audio.current) chime(audio.current);
        }
        setPending(false);
      },1200);
    }
    schedule();
    document.addEventListener('visibilitychange',schedule);
    return ()=>{window.clearTimeout(timer);document.removeEventListener('visibilitychange',schedule);};
  },[allowed,pending]);

  useEffect(()=>{if(!allowed) setVisible(false);},[allowed]);

  if (!visible || !allowed) return null;
  return <aside className="offer-notice small-notice" aria-labelledby="price-match-title"
    onKeyDown={event=>{if(event.key==='Escape') setVisible(false);}}>
    <span className="small-notice-icon" aria-hidden="true"><Tag size={17}/></span>
    <div>
      <h2 id="price-match-title">Нашли дешевле?</h2>
      <p>Сверим объём работ и, если сможем, предложим цену ниже.</p>
      <button className="offer-action" type="button" onClick={()=>{setVisible(false);onDiscuss();}}><MessageCircle size={15} aria-hidden="true"/>Связаться</button>
    </div>
    <button className="offer-close" type="button" onClick={()=>setVisible(false)} aria-label="Закрыть предложение"><X size={17}/></button>
  </aside>;
}
