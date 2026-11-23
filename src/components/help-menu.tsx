import {useEffect,useRef,useState} from 'react';
import {CircleHelp,Clock3,Phone,Send,X} from 'lucide-react';
import {telegramContacts} from '../lib/contact-links';

export function HelpMenu({contacts,onRequest,onOpen}:{contacts:Record<string,string>;onRequest:()=>void;onOpen:()=>void}) {
  const [open,setOpen]=useState(false);
  const region=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const channels=telegramContacts(contacts);
  useEffect(()=>{
    if (!open) return;
    function outside(event:PointerEvent) {
      if (event.target instanceof Node && !region.current?.contains(event.target)) setOpen(false);
    }
    function escape(event:KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      trigger.current?.focus();
    }
    document.addEventListener('pointerdown',outside);
    document.addEventListener('keydown',escape);
    return ()=>{
      document.removeEventListener('pointerdown',outside);
      document.removeEventListener('keydown',escape);
    };
  },[open]);
  return <div className="help-menu" ref={region}>
    <button className="help-trigger" ref={trigger} type="button" aria-label="Помощь" aria-expanded={open} aria-controls="help-panel" onClick={()=>{
      if (!open) onOpen();
      setOpen(!open);
    }}><span>Помощь</span><CircleHelp size={17}/></button>
    <section className="help-popover" hidden={!open} id="help-panel" aria-labelledby="help-title">
      <div className="help-heading"><h2 id="help-title">Поддержка 24/7</h2><button type="button" aria-label="Закрыть помощь" onClick={()=>{setOpen(false);trigger.current?.focus();}}><X size={16}/></button></div>
      <p><Clock3 size={15} aria-hidden="true"/> Работаем круглосуточно</p>
      <a href="tel:+79517506700"><Phone size={17} aria-hidden="true"/> +7 (951) 750-67-00</a>
      {channels.map(channel=><a key={channel.url} href={channel.url} target="_blank" rel="noopener noreferrer"><Send size={17} aria-hidden="true"/> {channel.label}</a>)}
      <button className="btn purple" type="button" onClick={()=>{setOpen(false);onRequest();}}>Оставить заявку</button>
    </section>
  </div>;
}
