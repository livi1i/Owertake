import {useEffect,useRef,useState} from 'react';
import {Tag,Volume2,VolumeX,X} from 'lucide-react';

const storageKey = 'overtake:price-offer-next';
const soundKey = 'overtake:price-offer-muted';
const repeat = 85_000;

export function PriceMatch({onDiscuss}: {onDiscuss: () => void}) {
  const [ready,setReady] = useState(false);
  const [hovered,setHovered] = useState(false);
  const [focused,setFocused] = useState(false);
  const [muted,setMuted] = useState(()=>{try{return localStorage.getItem(soundKey)==='1';}catch{return false;}});
  const next = useRef(Date.now() + 9000);
  const audio = useRef<AudioContext|null>(null);
  const sounded = useRef(false);

  function chime() {
    const ctx=audio.current;
    if (muted || sounded.current || ctx?.state!=='running' || document.hidden) return;
    sounded.current=true;
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

  useEffect(()=>{
    function enable(event:Event) {
      if (!event.isTrusted || muted || event.target instanceof Element && event.target.closest('.offer-notice')) return;
      try {
        audio.current ||= new AudioContext();
        void audio.current.resume().then(()=>{if(ready) chime();}).catch(()=>{});
      } catch {}
    }
    window.addEventListener('pointerup',enable);
    window.addEventListener('keydown',enable);
    return ()=>{
      window.removeEventListener('pointerup',enable);
      window.removeEventListener('keydown',enable);
    };
  },[muted,ready]);
  useEffect(()=>()=>{void audio.current?.close().catch(()=>{});audio.current=null;},[]);
  useEffect(()=>{if(ready) chime(); else sounded.current=false;},[ready,muted]);

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
      <div className="offer-actions"><button className="offer-action" type="button" onClick={() => { dismiss(600_000); onDiscuss(); }}>Связаться</button>
        <button className="offer-sound" type="button" aria-pressed={!muted} aria-label="Звук предложения" title={muted?'Включить звук':'Выключить звук'}
          onClick={()=>{setMuted(!muted);try{localStorage.setItem(soundKey,muted?'0':'1');}catch{}}}>{muted?<VolumeX size={16}/>:<Volume2 size={16}/>}</button></div>
    </div>
    <button className="offer-close" type="button" onClick={() => dismiss()} aria-label="Закрыть предложение"><X size={17}/></button>
  </aside>;
}
