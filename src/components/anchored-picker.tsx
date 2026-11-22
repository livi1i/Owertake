import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import {ChevronDown} from 'lucide-react';

export function AnchoredPicker({label,value,placeholder,onOpen,children,className=''}:{
  label:string;value?:string;placeholder:string;onOpen?:()=>void;
  children:(close:()=>void)=>ReactNode;className?:string;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open,setOpen] = useState(false);

  function position() {
    if (!trigger.current || !panel.current) return;
    const field = trigger.current.getBoundingClientRect();
    const viewport = window.visualViewport;
    const height = viewport?.height ?? window.innerHeight;
    const offset = viewport?.offsetTop ?? 0;
    const below = offset + height - field.bottom - 14;
    const above = field.top - offset - 14;
    const upwards = below < 248 && above > below;
    const width = Math.min(window.innerWidth - 24,Math.max(field.width,260));
    Object.assign(panel.current.style,{
      left:Math.max(12,Math.min(field.left,window.innerWidth-width-12))+'px',
      top:upwards ? 'auto' : Math.max(offset+8,field.bottom+6)+'px',
      bottom:upwards ? (window.innerHeight-field.top+6)+'px' : 'auto',
      width:width+'px',
      maxHeight:Math.max(70,Math.min(286,upwards ? above : below))+'px',
    });
  }

  useEffect(() => {
    if (!open) return;
    function update(event:Event) {
      if (event.target instanceof Node && panel.current?.contains(event.target)) return;
      position();
    }
    window.addEventListener('scroll',update,true);
    window.addEventListener('resize',update);
    window.visualViewport?.addEventListener('resize',update);
    return () => {
      window.removeEventListener('scroll',update,true);
      window.removeEventListener('resize',update);
      window.visualViewport?.removeEventListener('resize',update);
    };
  },[open]);

  const close = () => {
    panel.current?.hidePopover();
    trigger.current?.focus({preventScroll:true});
  };

  return <div className={'studio-choice '+className}>
    <span className="studio-choice-label" id={id+'-label'}>{label}</span>
    <button ref={trigger} className="studio-choice-trigger" type="button"
      aria-labelledby={id+'-label '+id+'-value'} aria-expanded={open}
      popoverTarget={id} onClick={() => { if (!open) { onOpen?.(); position(); } }}>
      <span id={id+'-value'}>{value || placeholder}</span><ChevronDown size={17} aria-hidden="true"/>
    </button>
    <div ref={panel} id={id} className="studio-choice-popover" popover="auto" aria-labelledby={id+'-label'} role="group"
      onToggle={event => setOpen(event.currentTarget.matches(':popover-open'))}
      onKeyDown={event => {if (event.key==='Escape') {event.preventDefault();close();}}}>
      {children(close)}
    </div>
  </div>;
}
